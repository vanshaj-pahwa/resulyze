import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopPosition, TabStopType } from 'docx'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { resumeData, format } = await request.json()

    if (format === 'docx') {
      // Create DOCX document
      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: [
            // Name header
            new Paragraph({
              children: [new TextRun({ text: resumeData.personalInfo.name, bold: true, size: 22, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }),
            // Contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.personalInfo.phone} | ${resumeData.personalInfo.email} | ${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}`,
                  size: 16,
                  font: "Arial",
                  color: "0066CC"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }),
            // Horizontal line
            new Paragraph({
              children: [new TextRun({ text: "_".repeat(80), size: 16, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }),
            // Profile section
            new Paragraph({ children: [new TextRun({ text: "PROFILE", bold: true, size: 16, font: "Arial" })], spacing: { after: 120 } }),
            new Paragraph({ children: [new TextRun({ text: resumeData.profile, size: 14, font: "Arial" })], spacing: { after: 240 } }),
            // Technical Skills
            new Paragraph({ children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 18, font: "Arial" })], spacing: { after: 120 } }),
            ...[
              { label: "Languages", value: resumeData.technicalSkills.languages },
              { label: "Frontend Frameworks/Technologies", value: resumeData.technicalSkills.frontend },
              { label: "Backend Technologies", value: resumeData.technicalSkills.backend },
              { label: "Dev Tools", value: resumeData.technicalSkills.devTools },
              { label: "Other", value: resumeData.technicalSkills.other },
            ].map(skill =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${skill.label}: `, bold: true, size: 16, font: "Arial" }),
                  new TextRun({ text: skill.value.join(', '), size: 16, font: "Arial" })
                ],
                spacing: { after: 60 }
              })
            ),
            // Work Experience header
            new Paragraph({ children: [new TextRun({ text: "WORK EXPERIENCE", bold: true, size: 18, font: "Arial" })], spacing: { after: 120 } }),
            // Work Experience entries
            ...resumeData.workExperience.flatMap((exp: any, index: number) => [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                children: [
                  new TextRun({ text: exp.title, bold: true, size: 16, font: "Arial" }),
                  new TextRun({ text: ` | ${exp.company}`, size: 16, font: "Arial" }),
                  new TextRun({ text: `\t${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, size: 16, font: "Arial" })
                ],
                spacing: { after: 60 }
              }),
              new Paragraph({ children: [new TextRun({ text: exp.location, italics: true, size: 16, font: "Arial" })], spacing: { after: 60 } }),
              ...exp.achievements.map((ach: string) =>
                new Paragraph({ children: [new TextRun({ text: `• ${ach}`, size: 16, font: "Arial" })], indent: { left: 360 }, spacing: { after: 60 } })
              ),
              new Paragraph({ children: [new TextRun({ text: "", size: 16 })], spacing: { after: index === resumeData.workExperience.length - 1 ? 240 : 120 } })
            ]),
            // Education
            new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 18, font: "Arial" })], spacing: { after: 120 } }),
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
              children: [
                new TextRun({ text: resumeData.education.degree || '', bold: true, size: 16, font: "Arial" }),
                new TextRun({ text: ` | ${resumeData.education.institution || ''}`, size: 16, font: "Arial" }),
                new TextRun({ text: `\t${resumeData.education.graduationDate || ''}`, size: 16, font: "Arial" })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({ children: [new TextRun({ text: `${resumeData.education.location || ''} | GPA: ${resumeData.education.gpa || ''}`, italics: true, size: 16, font: "Arial" })], spacing: { after: 240 } }),
            // Projects
            new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 18, font: "Arial" })], spacing: { after: 120 } }),
            ...resumeData.projects.flatMap((project: any, index: number) => [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                children: [
                  new TextRun({ text: project.name, bold: true, size: 16, font: "Arial" }),
                  new TextRun({ text: ` – ${project.technologies}`, size: 16, font: "Arial" }),
                  new TextRun({ text: `\t${project.githubUrl || 'GitHub'}`, size: 16, font: "Arial", color: "0066CC" })
                ],
                spacing: { after: 60 }
              }),
              ...project.achievements.map((ach: string) =>
                new Paragraph({ children: [new TextRun({ text: `• ${ach}`, size: 16, font: "Arial" })], indent: { left: 360 }, spacing: { after: 60 } })
              ),
              new Paragraph({ children: [new TextRun({ text: "", size: 16 })], spacing: { after: index === resumeData.projects.length - 1 ? 240 : 120 } })
            ]),
            // Achievements
            new Paragraph({ children: [new TextRun({ text: "ACHIEVEMENTS AND CERTIFICATIONS", bold: true, size: 18, font: "Arial" })], spacing: { after: 120 } }),
            ...resumeData.achievements.map((ach: string) =>
              new Paragraph({
                children: [
                  new TextRun({ text: ach.split(':')[0] + ':', bold: true, size: 16, font: "Arial" }),
                  new TextRun({ text: ' ' + ach.split(':').slice(1).join(':'), size: 16, font: "Arial" })
                ],
                spacing: { after: 60 }
              })
            )
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      const uint8Array = new Uint8Array(buffer) // Convert Node Buffer to Uint8Array

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename=resume.docx'
        }
      })

    } else if (format === 'pdf') {
      // Create PDF
      const pdf = new jsPDF()
      let y = 15
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(16)
      pdf.text(resumeData.personalInfo.name, 105, y, { align: 'center' })
      y += 8

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(9)
      pdf.setTextColor(0, 102, 204)
      pdf.text(`${resumeData.personalInfo.phone} | ${resumeData.personalInfo.email} | ${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}`, 105, y, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      y += 8
      pdf.setLineWidth(0.5)
      pdf.line(15, y, 195, y)
      y += 8

      // For simplicity, just include profile as example
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('PROFILE', 15, y)
      y += 5
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      const profileLines = pdf.splitTextToSize(resumeData.profile, 180)
      pdf.text(profileLines, 15, y)
      y += profileLines.length * 3.5 + 5

      const pdfBuffer = pdf.output('arraybuffer')
      const uint8Pdf = new Uint8Array(pdfBuffer)

      return new NextResponse(uint8Pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=resume.pdf'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error generating resume:', error)
    return NextResponse.json({ error: 'Failed to generate resume' }, { status: 500 })
  }
}