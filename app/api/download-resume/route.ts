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
          properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
          children: [
            // Name header
            new Paragraph({
              children: [new TextRun({ text: resumeData.personalInfo.name.toUpperCase(), bold: true, size: 18, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 }
            }),
            // Contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.personalInfo.phone} | ${resumeData.personalInfo.email} | ${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}`,
                  size: 10,
                  font: "Arial",
                  color: "0066CC"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }),
            // Horizontal line
            new Paragraph({
              children: [new TextRun({ text: "_".repeat(100), size: 12, font: "Arial" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }),
            // Profile section
            new Paragraph({ children: [new TextRun({ text: "PROFILE", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            new Paragraph({ children: [new TextRun({ text: resumeData.profile, size: 14, font: "Arial" })], spacing: { after: 240 }, alignment: AlignmentType.JUSTIFIED }),
            // Technical Skills
            new Paragraph({ children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            ...[
              { label: "Languages", value: resumeData.technicalSkills?.languages || [] },
              { label: "Frontend Frameworks/Technologies", value: resumeData.technicalSkills?.frontend || [] },
              { label: "Backend Technologies", value: resumeData.technicalSkills?.backend || [] },
              { label: "Dev Tools", value: resumeData.technicalSkills?.devTools || [] },
              { label: "Other", value: resumeData.technicalSkills?.other || [] },
            ].map(skill =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${skill.label}: `, bold: true, size: 11, font: "Arial" }),
                  new TextRun({ text: Array.isArray(skill.value) ? skill.value.join(', ') : '', size: 11, font: "Arial" })
                ],
                spacing: { after: 30 },
                alignment: AlignmentType.JUSTIFIED
              })
            ),
            // Work Experience header
            new Paragraph({ children: [new TextRun({ text: "WORK EXPERIENCE", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            // Work Experience entries
            ...resumeData.workExperience.flatMap((exp: any, index: number) => [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                children: [
                  new TextRun({ text: exp.position, bold: true, size: 12, font: "Arial" }),
                  new TextRun({ text: ` | ${exp.company}`, size: 12, font: "Arial" }),
                  new TextRun({ text: `\t${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, size: 11, font: "Arial" })
                ],
                spacing: { after: 30 }
              }),
              new Paragraph({ 
                children: [new TextRun({ text: exp.location, italics: true, size: 11, font: "Arial" })], 
                spacing: { after: 30 } 
              }),
              ...(Array.isArray(exp.achievements) ? exp.achievements.map((ach: string) =>
                new Paragraph({ 
                  children: [new TextRun({ text: `• ${ach}`, size: 11, font: "Arial" })], 
                  indent: { left: 360 }, 
                  spacing: { after: 20 },
                  alignment: AlignmentType.JUSTIFIED
                })
              ) : []),
              new Paragraph({ children: [new TextRun({ text: "", size: 11 })], spacing: { after: index === resumeData.workExperience.length - 1 ? 120 : 60 } })
            ]),
            // Education
            new Paragraph({ children: [new TextRun({ text: "EDUCATION", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            new Paragraph({
              tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
              children: [
                new TextRun({ text: resumeData.education.degree || '', bold: true, size: 12, font: "Arial" }),
                new TextRun({ text: ` | ${resumeData.education.institution || ''}`, size: 12, font: "Arial" }),
                new TextRun({ text: `\t${resumeData.education.graduationDate || ''}`, size: 11, font: "Arial" })
              ],
              spacing: { after: 30 }
            }),
            new Paragraph({ children: [new TextRun({ text: `${resumeData.education.location || ''} | GPA: ${resumeData.education.gpa || ''}`, italics: true, size: 11, font: "Arial" })], spacing: { after: 120 } }),
            // Projects
            new Paragraph({ children: [new TextRun({ text: "PROJECTS", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            ...resumeData.projects.flatMap((project: any, index: number) => [
              new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
                children: [
                  new TextRun({ text: project.name, bold: true, size: 12, font: "Arial" }),
                  new TextRun({ text: ` – ${project.technologies}`, size: 11, font: "Arial" }),
                  new TextRun({ text: `\t${project.githubUrl || 'GitHub'}`, size: 10, font: "Arial", color: "0066CC" })
                ],
                spacing: { after: 30 }
              }),
              ...(Array.isArray(project.achievements) ? project.achievements.map((ach: string) =>
                new Paragraph({ 
                  children: [new TextRun({ text: `• ${ach}`, size: 11, font: "Arial" })], 
                  indent: { left: 360 }, 
                  spacing: { after: 20 },
                  alignment: AlignmentType.JUSTIFIED
                })
              ) : []),
              new Paragraph({ children: [new TextRun({ text: "", size: 11 })], spacing: { after: index === resumeData.projects.length - 1 ? 120 : 60 } })
            ]),
            // Achievements
            new Paragraph({ children: [new TextRun({ text: "ACHIEVEMENTS AND CERTIFICATIONS", bold: true, size: 14, font: "Arial" })], spacing: { after: 60 } }),
            ...(Array.isArray(resumeData.achievements) ? resumeData.achievements.map((ach: string) =>
              new Paragraph({
                children: [
                  new TextRun({ text: ach.includes(':') ? ach.split(':')[0] + ':' : ach, bold: true, size: 11, font: "Arial" }),
                  new TextRun({ text: ach.includes(':') ? ' ' + ach.split(':').slice(1).join(':') : '', size: 11, font: "Arial" })
                ],
                spacing: { after: 30 },
                alignment: AlignmentType.JUSTIFIED
              })
            ) : [])
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
      // Create PDF with reduced margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      // Set smaller margins
      pdf.setDrawColor(255, 255, 255); // White
      pdf.setFillColor(255, 255, 255); // White
      pdf.rect(5, 5, 200, 287, 'F'); // Fill whole page with white
      
      // Set document margins
      const margins = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      };
      
      let y = margins.top
      
      // Name header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text(resumeData.personalInfo.name.toUpperCase(), 105, y, { align: 'center' })
      y += 6

      // Contact info
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(0, 102, 204)
      pdf.text(`${resumeData.personalInfo.phone} | ${resumeData.personalInfo.email} | ${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}`, 105, y, { align: 'center' })
      pdf.setTextColor(0, 0, 0)
      y += 5
      pdf.setLineWidth(0.3)
      pdf.line(margins.left, y, 200 - margins.right, y)
      y += 5

      // Profile section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('PROFILE', margins.left, y)
      y += 4
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      
      // Create justified text for profile
      const profileText = resumeData.profile;
      const availableWidth = 200 - margins.left - margins.right;
      const profileLines = pdf.splitTextToSize(profileText, availableWidth);
      
      // Manual text justification for each line
      for (let i = 0; i < profileLines.length; i++) {
        pdf.text(profileLines[i], margins.left, y);
        y += 3;
      }
      
      y += 3
      
      // Technical Skills section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('TECHNICAL SKILLS', margins.left, y)
      y += 4
      
      const skillCategories = [
        { label: "Languages", value: resumeData.technicalSkills?.languages || [] },
        { label: "Frontend Frameworks/Technologies", value: resumeData.technicalSkills?.frontend || [] },
        { label: "Backend Technologies", value: resumeData.technicalSkills?.backend || [] },
        { label: "Dev Tools", value: resumeData.technicalSkills?.devTools || [] },
        { label: "Other", value: resumeData.technicalSkills?.other || [] },
      ];
      
      for (const skill of skillCategories) {
        if (Array.isArray(skill.value) && skill.value.length > 0) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(8)
          pdf.text(`${skill.label}: `, margins.left, y)
          
          const textWidth = pdf.getTextWidth(`${skill.label}: `)
          pdf.setFont('helvetica', 'normal')
          const skillText = skill.value.join(', ')
          const skillLines = pdf.splitTextToSize(skillText, 200 - margins.left - margins.right - textWidth)
          
          // Place text right after the label
          pdf.text(skillLines, margins.left + textWidth, y)
          y += skillLines.length * 3 + 2
        }
      }
      y += 2
      
      // Work Experience section
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('WORK EXPERIENCE', margins.left, y)
      y += 4
      
      for (const exp of resumeData.workExperience) {
        // Check if we're close to the end of the page, and add a new page if needed
        if (y > 270) {
          pdf.addPage()
          y = margins.top
        }
        
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.text(exp.position, margins.left, y)
        
        const dateText = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.text(dateText, 200 - margins.right, y, { align: 'right' })
        y += 3
        
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.text(`${exp.company} | ${exp.location}`, margins.left, y)
        y += 3
        
        if (Array.isArray(exp.achievements)) {
          for (const achievement of exp.achievements) {
            // Check if we're close to the end of the page, and add a new page if needed
            if (y > 270) {
              pdf.addPage()
              y = margins.top
            }
            
            const achievementLines = pdf.splitTextToSize(`• ${achievement}`, 185 - margins.left)
            pdf.text(achievementLines, margins.left + 4, y)
            y += achievementLines.length * 3 + 1
          }
        }
        y += 2
      }
      
      // Education section
      // Check if we're close to the end of the page, and add a new page if needed
      if (y > 250) {
        pdf.addPage()
        y = margins.top
      }
      
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('EDUCATION', margins.left, y)
      y += 4
      
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.text(resumeData.education.degree || '', margins.left, y)
      
      if (resumeData.education.graduationDate) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.text(resumeData.education.graduationDate, 200 - margins.right, y, { align: 'right' })
      }
      y += 3
      
      if (resumeData.education.institution || resumeData.education.location) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        let educationText = ''
        if (resumeData.education.institution) educationText += resumeData.education.institution
        if (resumeData.education.institution && resumeData.education.location) educationText += ' | '
        if (resumeData.education.location) educationText += resumeData.education.location
        if (resumeData.education.gpa) educationText += ` | GPA: ${resumeData.education.gpa}`
        pdf.text(educationText, margins.left, y)
        y += 4
      }
      
      // Projects section
      // Check if we're close to the end of the page, and add a new page if needed
      if (y > 240 && resumeData.projects && resumeData.projects.length > 0) {
        pdf.addPage()
        y = margins.top
      }
      
      if (resumeData.projects && resumeData.projects.length > 0) {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.text('PROJECTS', margins.left, y)
        y += 4
        
        for (const project of resumeData.projects) {
          // Check if we're close to the end of the page, and add a new page if needed
          if (y > 270) {
            pdf.addPage()
            y = margins.top
          }
          
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(9)
          pdf.text(project.name, margins.left, y)
          
          if (project.githubUrl) {
            pdf.setTextColor(0, 102, 204)
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            pdf.text(project.githubUrl, 200 - margins.right, y, { align: 'right' })
            pdf.setTextColor(0, 0, 0)
          }
          y += 3
          
          if (project.technologies) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            const techLines = pdf.splitTextToSize(project.technologies, 195 - margins.left - margins.right)
            pdf.text(techLines, margins.left, y)
            y += techLines.length * 3 + 1
          }
          
          if (Array.isArray(project.achievements)) {
            for (const achievement of project.achievements) {
              // Check if we're close to the end of the page, and add a new page if needed
              if (y > 270) {
                pdf.addPage()
                y = margins.top
              }
              
              const achievementLines = pdf.splitTextToSize(`• ${achievement}`, 190 - margins.left - margins.right)
              pdf.text(achievementLines, margins.left + 4, y)
              y += achievementLines.length * 3 + 1
            }
          }
          y += 2
        }
      }
      
      // Achievements section
      // Check if we're close to the end of the page, and add a new page if needed
      if (y > 240 && Array.isArray(resumeData.achievements) && resumeData.achievements.length > 0) {
        pdf.addPage()
        y = margins.top
      }
      
      if (Array.isArray(resumeData.achievements) && resumeData.achievements.length > 0) {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.text('ACHIEVEMENTS AND CERTIFICATIONS', margins.left, y)
        y += 4
        
        for (const achievement of resumeData.achievements) {
          // Check if we're close to the end of the page, and add a new page if needed
          if (y > 270) {
            pdf.addPage()
            y = 15
          }
          
          const parts = achievement.split(':')
          if (parts.length > 1) {
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(8)
            pdf.text(`${parts[0]}:`, 15, y)
            
            const textWidth = pdf.getTextWidth(`${parts[0]}: `)
            pdf.setFont('helvetica', 'normal')
            const achievementText = parts.slice(1).join(':')
            const achievementLines = pdf.splitTextToSize(achievementText, 180 - textWidth)
            pdf.text(achievementLines, 15 + textWidth, y)
            y += achievementLines.length * 3.5 + 2
          } else {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(8)
            const achievementLines = pdf.splitTextToSize(achievement, 180)
            pdf.text(achievementLines, 15, y)
            y += achievementLines.length * 3.5 + 2
          }
        }
      }

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