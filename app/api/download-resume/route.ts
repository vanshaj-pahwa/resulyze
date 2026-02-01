import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, ExternalHyperlink } from 'docx'
import jsPDF from 'jspdf'

// Helper to escape special characters for PDF
const escapeText = (text: string) => {
  if (!text) return ''
  return text.replace(/[\r\n]+/g, ' ').trim()
}

export async function POST(request: NextRequest) {
  try {
    const { resumeData, format } = await request.json()

    if (format === 'pdf') {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 210
      const pageHeight = 297
      const margin = { left: 8, right: 8, top: 13, bottom: 8 }
      const contentWidth = pageWidth - margin.left - margin.right
      let y = margin.top

      // Helper to add page break if needed
      const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - margin.bottom) {
          pdf.addPage()
          y = margin.top
          return true
        }
        return false
      }

      // Helper to draw section header (no underline)
      const drawSectionHeader = (title: string) => {
        checkPageBreak(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(0, 0, 0)
        pdf.text(title, margin.left, y)
        y += 5
      }

      // Helper to draw text with word wrap
      const drawText = (text: string, x: number, maxWidth: number, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal')
        pdf.setFontSize(fontSize)
        const lines = pdf.splitTextToSize(escapeText(text), maxWidth)
        for (const line of lines) {
          checkPageBreak(5)
          pdf.text(line, x, y)
          y += 4
        }
      }

      // NAME HEADER
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(20)
      pdf.setTextColor(0, 0, 0)
      const name = escapeText(resumeData.personalInfo?.name || '')
      pdf.text(name, pageWidth / 2, y, { align: 'center' })
      y += 7

      // CONTACT INFO
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(37, 99, 235)
      const contactParts = [
        resumeData.personalInfo?.phone,
        resumeData.personalInfo?.email,
        resumeData.personalInfo?.linkedin,
        resumeData.personalInfo?.github
      ].filter(Boolean)
      const contactText = contactParts.join(' | ')
      pdf.text(contactText, pageWidth / 2, y, { align: 'center' })

      // Add clickable links
      let linkX = (pageWidth - pdf.getTextWidth(contactText)) / 2
      for (let i = 0; i < contactParts.length; i++) {
        const part = contactParts[i]
        const partWidth = pdf.getTextWidth(part)

        if (part === resumeData.personalInfo?.email) {
          pdf.link(linkX, y - 3, partWidth, 4, { url: `mailto:${part}` })
        } else if (part === resumeData.personalInfo?.linkedin) {
          const url = part.startsWith('http') ? part : `https://${part}`
          pdf.link(linkX, y - 3, partWidth, 4, { url })
        } else if (part === resumeData.personalInfo?.github) {
          const url = part.startsWith('http') ? part : `https://${part}`
          pdf.link(linkX, y - 3, partWidth, 4, { url })
        }

        linkX += partWidth + pdf.getTextWidth(' | ')
      }

      pdf.setTextColor(0, 0, 0)
      y += 5

      // HORIZONTAL LINE
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.4)
      pdf.line(margin.left, y, pageWidth - margin.right, y)
      y += 6

      // PROFILE
      if (resumeData.profile) {
        drawSectionHeader('PROFILE')
        drawText(resumeData.profile, margin.left, contentWidth, 10)
        y += 4
      }

      // TECHNICAL SKILLS - Dynamic fields
      const hasSkills = resumeData.technicalSkills &&
        Object.keys(resumeData.technicalSkills).some(key => {
          const value = resumeData.technicalSkills[key]
          return Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && value.trim())
        })

      if (hasSkills) {
        drawSectionHeader('TECHNICAL SKILLS')

        // Dynamically iterate over all keys in technicalSkills
        for (const [key, value] of Object.entries(resumeData.technicalSkills)) {
          // Skip empty values
          const values = Array.isArray(value) ? value : (typeof value === 'string' && value.trim() ? [value] : [])
          if (values.length === 0) continue

          checkPageBreak(6)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          const label = `${key}: `
          pdf.text(label, margin.left, y)

          const labelWidth = pdf.getTextWidth(label)
          pdf.setFont('helvetica', 'normal')
          const valueText = values.join(', ')
          const valueLines = pdf.splitTextToSize(valueText, contentWidth - labelWidth)

          pdf.text(valueLines[0] || '', margin.left + labelWidth, y)
          y += 4

          for (let i = 1; i < valueLines.length; i++) {
            checkPageBreak(5)
            pdf.text(valueLines[i], margin.left + labelWidth, y)
            y += 4
          }
        }
        y += 4
      }

      // WORK EXPERIENCE
      if (resumeData.workExperience?.length > 0) {
        drawSectionHeader('WORK EXPERIENCE')

        for (const exp of resumeData.workExperience) {
          checkPageBreak(15)

          // Position | Company and Date
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          const posCompany = `${escapeText(exp.position)} | ${escapeText(exp.company)}`
          pdf.text(posCompany, margin.left, y)

          pdf.setFont('helvetica', 'italic')
          pdf.setFontSize(10)
          const dateText = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`
          pdf.text(dateText, pageWidth - margin.right, y, { align: 'right' })
          y += 4.5

          // Location
          if (exp.location) {
            pdf.setFont('helvetica', 'italic')
            pdf.setFontSize(10)
            pdf.text(escapeText(exp.location), margin.left, y)
            y += 4.5
          }

          // Achievements
          if (exp.achievements?.length > 0) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(10)
            const bulletIndent = 6 // Left indent for bullet points

            for (const ach of exp.achievements) {
              if (ach?.trim()) {
                checkPageBreak(6)
                // Draw bullet at indented position
                pdf.text('•', margin.left + bulletIndent, y)
                // Draw text after bullet with additional spacing
                const textStartX = margin.left + bulletIndent + 4
                const textMaxWidth = contentWidth - bulletIndent - 4
                const lines = pdf.splitTextToSize(escapeText(ach), textMaxWidth)

                for (let i = 0; i < lines.length; i++) {
                  if (i === 0) {
                    pdf.text(lines[i], textStartX, y)
                  } else {
                    pdf.text(lines[i], textStartX, y)
                  }
                  y += 4
                }
              }
            }
          }
          y += 3
        }
      }

      // EDUCATION
      if (resumeData.education?.degree || resumeData.education?.institution) {
        drawSectionHeader('EDUCATION')

        checkPageBreak(12)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        const eduText = `${escapeText(resumeData.education.degree)} | ${escapeText(resumeData.education.institution)}`
        pdf.text(eduText, margin.left, y)

        if (resumeData.education.graduationDate) {
          pdf.setFont('helvetica', 'italic')
          pdf.setFontSize(10)
          pdf.text(resumeData.education.graduationDate, pageWidth - margin.right, y, { align: 'right' })
        }
        y += 4.5

        const eduDetails = [
          resumeData.education.location,
          resumeData.education.gpa ? `GPA: ${resumeData.education.gpa}` : null
        ].filter(Boolean).join(' | ')

        if (eduDetails) {
          pdf.setFont('helvetica', 'italic')
          pdf.setFontSize(10)
          pdf.text(eduDetails, margin.left, y)
          y += 4.5
        }
        y += 4
      }

      // PROJECTS
      if (resumeData.projects?.length > 0) {
        drawSectionHeader('PROJECTS')

        for (const project of resumeData.projects) {
          checkPageBreak(12)

          // Project name - Technologies and GitHub link
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          let projectTitle = escapeText(project.name)
          if (project.technologies) {
            projectTitle += ` – ${escapeText(project.technologies)}`
          }

          // Truncate title if too long
          const maxTitleWidth = contentWidth - (project.githubUrl ? 45 : 0)
          const titleLines = pdf.splitTextToSize(projectTitle, maxTitleWidth)
          pdf.text(titleLines[0], margin.left, y)

          // GitHub link
          if (project.githubUrl) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(10)
            pdf.setTextColor(37, 99, 235)
            const linkText = escapeText(project.githubUrl)
            pdf.text(linkText, pageWidth - margin.right, y, { align: 'right' })

            // Add clickable link
            const linkWidth = pdf.getTextWidth(linkText)
            const url = project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`
            pdf.link(pageWidth - margin.right - linkWidth, y - 3, linkWidth, 5, { url })

            pdf.setTextColor(0, 0, 0)
          }
          y += 4.5

          // Additional title lines if wrapped
          for (let i = 1; i < titleLines.length; i++) {
            pdf.setFont('helvetica', 'bold')
            pdf.text(titleLines[i], margin.left, y)
            y += 4.5
          }

          // Project achievements
          if (project.achievements?.length > 0) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(10)
            const bulletIndent = 6 // Left indent for bullet points

            for (const ach of project.achievements) {
              if (ach?.trim()) {
                checkPageBreak(6)
                // Draw bullet at indented position
                pdf.text('•', margin.left + bulletIndent, y)
                // Draw text after bullet with additional spacing
                const textStartX = margin.left + bulletIndent + 4
                const textMaxWidth = contentWidth - bulletIndent - 4
                const lines = pdf.splitTextToSize(escapeText(ach), textMaxWidth)

                for (let i = 0; i < lines.length; i++) {
                  if (i === 0) {
                    pdf.text(lines[i], textStartX, y)
                  } else {
                    pdf.text(lines[i], textStartX, y)
                  }
                  y += 4
                }
              }
            }
          }
          y += 3
        }
      }

      // ACHIEVEMENTS AND CERTIFICATIONS
      if (resumeData.achievements?.length > 0) {
        drawSectionHeader('ACHIEVEMENTS AND CERTIFICATIONS')

        pdf.setFontSize(10)

        for (const ach of resumeData.achievements) {
          if (ach?.trim()) {
            checkPageBreak(6)
            const colonIdx = ach.indexOf(':')

            if (colonIdx > 0 && colonIdx < 50) {
              // Has title
              pdf.setFont('helvetica', 'bold')
              const title = ach.substring(0, colonIdx + 1)
              pdf.text(title, margin.left, y)

              const titleWidth = pdf.getTextWidth(title + ' ')
              pdf.setFont('helvetica', 'normal')
              const rest = escapeText(ach.substring(colonIdx + 1))
              const restLines = pdf.splitTextToSize(rest, contentWidth - titleWidth)

              if (restLines[0]) {
                pdf.text(restLines[0], margin.left + titleWidth, y)
              }
              y += 4

              for (let i = 1; i < restLines.length; i++) {
                checkPageBreak(5)
                pdf.text(restLines[i], margin.left, y)
                y += 4
              }
            } else {
              pdf.setFont('helvetica', 'normal')
              const lines = pdf.splitTextToSize(escapeText(ach), contentWidth)
              for (const line of lines) {
                checkPageBreak(5)
                pdf.text(line, margin.left, y)
                y += 4
              }
            }
          }
        }
      }

      const pdfBuffer = pdf.output('arraybuffer')
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=resume.pdf'
        }
      })
    }

    if (format === 'docx') {
      // Create DOCX document with hyperlinks
      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: [
            // Name header
            new Paragraph({
              children: [new TextRun({ text: resumeData.personalInfo?.name || '', bold: true, size: 32, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            // Contact info with hyperlinks
            new Paragraph({
              children: [
                ...(resumeData.personalInfo?.phone ? [new TextRun({ text: resumeData.personalInfo.phone, size: 20, font: "Arial" })] : []),
                ...(resumeData.personalInfo?.phone && resumeData.personalInfo?.email ? [new TextRun({ text: " | ", size: 20, font: "Arial" })] : []),
                ...(resumeData.personalInfo?.email ? [
                  new ExternalHyperlink({
                    children: [new TextRun({ text: resumeData.personalInfo.email, size: 20, font: "Arial", color: "0066CC" })],
                    link: `mailto:${resumeData.personalInfo.email}`
                  })
                ] : []),
                ...((resumeData.personalInfo?.phone || resumeData.personalInfo?.email) && resumeData.personalInfo?.linkedin ? [new TextRun({ text: " | ", size: 20, font: "Arial" })] : []),
                ...(resumeData.personalInfo?.linkedin ? [
                  new ExternalHyperlink({
                    children: [new TextRun({ text: resumeData.personalInfo.linkedin, size: 20, font: "Arial", color: "0066CC" })],
                    link: resumeData.personalInfo.linkedin.startsWith("http") ? resumeData.personalInfo.linkedin : `https://${resumeData.personalInfo.linkedin}`
                  })
                ] : []),
                ...((resumeData.personalInfo?.phone || resumeData.personalInfo?.email || resumeData.personalInfo?.linkedin) && resumeData.personalInfo?.github ? [new TextRun({ text: " | ", size: 20, font: "Arial" })] : []),
                ...(resumeData.personalInfo?.github ? [
                  new ExternalHyperlink({
                    children: [new TextRun({ text: resumeData.personalInfo.github, size: 20, font: "Arial", color: "0066CC" })],
                    link: resumeData.personalInfo.github.startsWith("http") ? resumeData.personalInfo.github : `https://${resumeData.personalInfo.github}`
                  })
                ] : [])
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            // Horizontal line
            new Paragraph({
              children: [new TextRun({ text: "_".repeat(100), size: 20, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            // Profile section
            ...(resumeData.profile ? [
              new Paragraph({
                children: [new TextRun({ text: "PROFILE", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [new TextRun({ text: resumeData.profile, size: 20, font: "Arial" })],
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED
              })
            ] : []),
            // Technical Skills - Dynamic fields
            ...(resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).some(key => {
              const value = resumeData.technicalSkills[key]
              return Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && value.trim())
            }) ? [
              new Paragraph({
                children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              ...Object.entries(resumeData.technicalSkills)
                .filter(([, value]) => {
                  return Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && (value as string).trim())
                })
                .map(([key, value]) => {
                  const values = Array.isArray(value) ? value : [value]
                  return new Paragraph({
                    children: [
                      new TextRun({ text: `${key}: `, bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: values.join(', '), size: 20, font: "Arial" })
                    ],
                    spacing: { after: 50 }
                  })
                }),
              new Paragraph({ children: [], spacing: { after: 100 } })
            ] : []),
            // Work Experience
            ...(resumeData.workExperience?.length > 0 ? [
              new Paragraph({
                children: [new TextRun({ text: "WORK EXPERIENCE", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              ...resumeData.workExperience.flatMap((exp: any) => [
                new Paragraph({
                  tabStops: [{ type: TabStopType.RIGHT, position: 9500 }],
                  children: [
                    new TextRun({ text: `${exp.position || ''} | ${exp.company || ''}`, bold: true, size: 20, font: "Arial" }),
                    new TextRun({ text: `\t${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`, italics: true, size: 20, font: "Arial" })
                  ],
                  spacing: { after: 50 }
                }),
                ...(exp.location ? [new Paragraph({
                  children: [new TextRun({ text: exp.location, italics: true, size: 20, font: "Arial" })],
                  spacing: { after: 50 }
                })] : []),
                ...(Array.isArray(exp.achievements) ? exp.achievements.filter((a: string) => a?.trim()).map((ach: string) =>
                  new Paragraph({
                    children: [new TextRun({ text: `• ${ach}`, size: 20, font: "Arial" })],
                    indent: { left: 200 },
                    spacing: { after: 30 },
                    alignment: AlignmentType.JUSTIFIED
                  })
                ) : []),
                new Paragraph({ children: [], spacing: { after: 100 } })
              ])
            ] : []),
            // Education
            ...(resumeData.education && (resumeData.education.degree || resumeData.education.institution) ? [
              new Paragraph({
                children: [new TextRun({ text: "EDUCATION", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9500 }],
                children: [
                  new TextRun({ text: `${resumeData.education.degree || ''} | ${resumeData.education.institution || ''}`, bold: true, size: 20, font: "Arial" }),
                  new TextRun({ text: `\t${resumeData.education.graduationDate || ''}`, italics: true, size: 20, font: "Arial" })
                ],
                spacing: { after: 50 }
              }),
              new Paragraph({
                children: [new TextRun({
                  text: [resumeData.education.location, resumeData.education.gpa ? `GPA: ${resumeData.education.gpa}` : null].filter(Boolean).join(' | '),
                  italics: true,
                  size: 20,
                  font: "Arial"
                })],
                spacing: { after: 200 }
              })
            ] : []),
            // Projects
            ...(resumeData.projects?.length > 0 ? [
              new Paragraph({
                children: [new TextRun({ text: "PROJECTS", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              ...resumeData.projects.flatMap((project: any) => [
                new Paragraph({
                  tabStops: [{ type: TabStopType.RIGHT, position: 9500 }],
                  children: [
                    new TextRun({ text: `${project.name || ''}${project.technologies ? ` – ${project.technologies}` : ''}`, bold: true, size: 20, font: "Arial" }),
                    ...(project.githubUrl ? [
                      new TextRun({ text: "\t", size: 20 }),
                      new ExternalHyperlink({
                        children: [new TextRun({ text: project.githubUrl, size: 18, font: "Arial", color: "0066CC" })],
                        link: project.githubUrl.startsWith("http") ? project.githubUrl : `https://${project.githubUrl}`
                      })
                    ] : [])
                  ],
                  spacing: { after: 50 }
                }),
                ...(Array.isArray(project.achievements) ? project.achievements.filter((a: string) => a?.trim()).map((ach: string) =>
                  new Paragraph({
                    children: [new TextRun({ text: `• ${ach}`, size: 20, font: "Arial" })],
                    indent: { left: 200 },
                    spacing: { after: 30 },
                    alignment: AlignmentType.JUSTIFIED
                  })
                ) : []),
                new Paragraph({ children: [], spacing: { after: 100 } })
              ])
            ] : []),
            // Achievements
            ...(Array.isArray(resumeData.achievements) && resumeData.achievements.length > 0 ? [
              new Paragraph({
                children: [new TextRun({ text: "ACHIEVEMENTS AND CERTIFICATIONS", bold: true, size: 22, font: "Arial" })],
                                spacing: { after: 100 }
              }),
              ...resumeData.achievements.filter((a: string) => a?.trim()).map((ach: string) => {
                const colonIndex = ach.indexOf(':')
                if (colonIndex > 0 && colonIndex < 50) {
                  return new Paragraph({
                    children: [
                      new TextRun({ text: ach.substring(0, colonIndex + 1), bold: true, size: 20, font: "Arial" }),
                      new TextRun({ text: ach.substring(colonIndex + 1), size: 20, font: "Arial" })
                    ],
                    spacing: { after: 50 }
                  })
                }
                return new Paragraph({
                  children: [new TextRun({ text: ach, size: 20, font: "Arial" })],
                  spacing: { after: 50 }
                })
              })
            ] : [])
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename=resume.docx'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error generating resume:', error)
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 })
  }
}
