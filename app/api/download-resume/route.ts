import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopPosition, TabStopType } from 'docx'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { resumeData, format } = await request.json()

    if (format === 'docx') {
      // Create DOCX document with exact formatting
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,    // 0.5 inch
                right: 720,  // 0.5 inch
                bottom: 720, // 0.5 inch
                left: 720,   // 0.5 inch
              },
            },
          },
          children: [
            // Header with name
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.personalInfo.name,
                  bold: true,
                  size: 22,
                  font: "Arial"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }),

            // Contact info in blue
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
              children: [
                new TextRun({
                  text: "________________________________________________________________________________",
                  size: 16,
                  font: "Arial"
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }
            }),

            // Profile section
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROFILE",
                  bold: true,
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: resumeData.profile,
                  size: 14,
                  font: "Arial"
                })
              ],
              spacing: { after: 240 }
            }),

            // Technical Skills
            new Paragraph({
              children: [
                new TextRun({
                  text: "TECHNICAL SKILLS",
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Languages: ",
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: resumeData.technicalSkills.languages.join(', '),
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Frontend Frameworks/Technologies: ",
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: resumeData.technicalSkills.frontend.join(', '),
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Backend Technologies: ",
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: resumeData.technicalSkills.backend.join(', '),
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Dev Tools: ",
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: resumeData.technicalSkills.devTools.join(', '),
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Other: ",
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: resumeData.technicalSkills.other.join(', '),
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 240 }
            }),

            // Work Experience
            new Paragraph({
              children: [
                new TextRun({
                  text: "WORK EXPERIENCE",
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),

            // Work experience entries
            ...resumeData.workExperience.flatMap((exp: any, index: number) => [
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: 9000,
                  },
                ],
                children: [
                  new TextRun({
                    text: `${exp.title}`,
                    bold: true,
                    size: 16,
                    font: "Arial"
                  }),
                  new TextRun({
                    text: ` | ${exp.company}`,
                    size: 16,
                    font: "Arial"
                  }),
                  new TextRun({
                    text: `\t${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`,
                    size: 16,
                    font: "Arial"
                  })
                ],
                spacing: { after: 60 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: exp.location,
                    italics: true,
                    size: 16,
                    font: "Arial"
                  })
                ],
                spacing: { after: 60 }
              }),
              ...exp.achievements.map((achievement: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${achievement}`,
                      size: 16,
                      font: "Arial"
                    })
                  ],
                  indent: { left: 360 },
                  spacing: { after: 60 }
                })
              ),
              new Paragraph({
                children: [new TextRun({ text: "", size: 16 })],
                spacing: { after: index === resumeData.workExperience.length - 1 ? 240 : 120 }
              })
            ]),

            // Education
            new Paragraph({
              children: [
                new TextRun({
                  text: "EDUCATION",
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),
            new Paragraph({
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9000,
                },
              ],
              children: [
                new TextRun({
                  text: `${resumeData.education.degree}`,
                  bold: true,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: ` | ${resumeData.education.institution}`,
                  size: 16,
                  font: "Arial"
                }),
                new TextRun({
                  text: `\t${resumeData.education.graduationDate}`,
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 60 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.education.location} | GPA: ${resumeData.education.gpa}`,
                  italics: true,
                  size: 16,
                  font: "Arial"
                })
              ],
              spacing: { after: 240 }
            }),

            // Projects
            new Paragraph({
              children: [
                new TextRun({
                  text: "PROJECTS",
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),
            ...resumeData.projects.flatMap((project: any, index: number) => [
              new Paragraph({
                tabStops: [
                  {
                    type: TabStopType.RIGHT,
                    position: 9000,
                  },
                ],
                children: [
                  new TextRun({
                    text: `${project.name}`,
                    bold: true,
                    size: 16,
                    font: "Arial"
                  }),
                  new TextRun({
                    text: ` – ${project.technologies}`,
                    size: 16,
                    font: "Arial"
                  }),
                  new TextRun({
                    text: `\t${project.githubUrl || 'GitHub'}`,
                    size: 16,
                    font: "Arial",
                    color: "0066CC"
                  })
                ],
                spacing: { after: 60 }
              }),
              ...project.achievements.map((achievement: string) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${achievement}`,
                      size: 16,
                      font: "Arial"
                    })
                  ],
                  indent: { left: 360 },
                  spacing: { after: 60 }
                })
              ),
              new Paragraph({
                children: [new TextRun({ text: "", size: 16 })],
                spacing: { after: index === resumeData.projects.length - 1 ? 240 : 120 }
              })
            ]),

            // Achievements and Certifications
            new Paragraph({
              children: [
                new TextRun({
                  text: "ACHIEVEMENTS AND CERTIFICATIONS",
                  bold: true,
                  size: 18,
                  font: "Arial"
                })
              ],
              spacing: { after: 120 }
            }),
            ...resumeData.achievements.map((achievement: string) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${achievement.split(':')[0]}:`,
                    bold: true,
                    size: 16,
                    font: "Arial"
                  }),
                  new TextRun({
                    text: ` ${achievement.split(':').slice(1).join(':')}`,
                    size: 16,
                    font: "Arial"
                  })
                ],
                spacing: { after: 60 }
              })
            )
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename=resume.docx'
        }
      })

    } else if (format === 'pdf') {
      // Create PDF document with exact formatting
      const pdf = new jsPDF()
      let yPosition = 15

      // Header - Name
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(resumeData.personalInfo.name, 105, yPosition, { align: 'center' })
      yPosition += 8

      // Contact info in blue
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0, 102, 204) // Blue color
      const contactInfo = `${resumeData.personalInfo.phone} | ${resumeData.personalInfo.email} | ${resumeData.personalInfo.linkedin} | ${resumeData.personalInfo.github}`
      pdf.text(contactInfo, 105, yPosition, { align: 'center' })
      pdf.setTextColor(0, 0, 0) // Reset to black
      yPosition += 8

      // Horizontal line
      pdf.setLineWidth(0.5)
      pdf.line(15, yPosition, 195, yPosition)
      yPosition += 8

      // Profile
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROFILE', 15, yPosition)
      yPosition += 5

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      const profileLines = pdf.splitTextToSize(resumeData.profile, 180)
      pdf.text(profileLines, 15, yPosition)
      yPosition += profileLines.length * 3.5 + 5

      // Technical Skills
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TECHNICAL SKILLS', 15, yPosition)
      yPosition += 5

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')

      // Languages
      pdf.setFont('helvetica', 'bold')
      pdf.text('Languages:', 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(resumeData.technicalSkills.languages.join(', '), 35, yPosition)
      yPosition += 3.5

      // Frontend
      pdf.setFont('helvetica', 'bold')
      pdf.text('Frontend Frameworks/Technologies:', 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      const frontendText = pdf.splitTextToSize(resumeData.technicalSkills.frontend.join(', '), 120)
      pdf.text(frontendText, 75, yPosition)
      yPosition += frontendText.length * 3.5

      // Backend
      pdf.setFont('helvetica', 'bold')
      pdf.text('Backend Technologies:', 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(resumeData.technicalSkills.backend.join(', '), 60, yPosition)
      yPosition += 3.5

      // Dev Tools
      pdf.setFont('helvetica', 'bold')
      pdf.text('Dev Tools:', 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      const devToolsText = pdf.splitTextToSize(resumeData.technicalSkills.devTools.join(', '), 140)
      pdf.text(devToolsText, 35, yPosition)
      yPosition += devToolsText.length * 3.5

      // Other
      pdf.setFont('helvetica', 'bold')
      pdf.text('Other:', 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(resumeData.technicalSkills.other.join(', '), 30, yPosition)
      yPosition += 8

      // Work Experience
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('WORK EXPERIENCE', 15, yPosition)
      yPosition += 5

      resumeData.workExperience.forEach((exp: any) => {
        // Check if we need a new page
        if (yPosition > 260) {
          pdf.addPage()
          yPosition = 15
        }

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${exp.title}`, 15, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(` | ${exp.company}`, 15 + pdf.getTextWidth(`${exp.title}`), yPosition)
        pdf.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, 180, yPosition)
        yPosition += 3.5

        pdf.setFont('helvetica', 'italic')
        pdf.text(exp.location, 15, yPosition)
        yPosition += 4

        pdf.setFont('helvetica', 'normal')
        exp.achievements.forEach((achievement: string) => {
          const achievementLines = pdf.splitTextToSize(`• ${achievement}`, 170)
          pdf.text(achievementLines, 20, yPosition)
          yPosition += achievementLines.length * 3.5 + 1
        })
        yPosition += 3
      })

      // Education
      if (yPosition > 240) {
        pdf.addPage()
        yPosition = 15
      }

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('EDUCATION', 15, yPosition)
      yPosition += 5

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${resumeData.education.degree}`, 15, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(` | ${resumeData.education.institution}`, 15 + pdf.getTextWidth(`${resumeData.education.degree}`), yPosition)
      pdf.text(resumeData.education.graduationDate, 180, yPosition)
      yPosition += 3.5

      pdf.setFont('helvetica', 'italic')
      pdf.text(`${resumeData.education.location} | GPA: ${resumeData.education.gpa}`, 15, yPosition)
      yPosition += 8

      // Projects
      if (yPosition > 220) {
        pdf.addPage()
        yPosition = 15
      }

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROJECTS', 15, yPosition)
      yPosition += 5

      resumeData.projects.forEach((project: any) => {
        if (yPosition > 240) {
          pdf.addPage()
          yPosition = 15
        }

        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${project.name}`, 15, yPosition)
        pdf.setFont('helvetica', 'normal')
        pdf.text(` – ${project.technologies}`, 15 + pdf.getTextWidth(`${project.name}`), yPosition)
        pdf.setTextColor(0, 102, 204)
        pdf.text(project.githubUrl || 'GitHub', 180, yPosition)
        pdf.setTextColor(0, 0, 0)
        yPosition += 4

        pdf.setFont('helvetica', 'normal')
        project.achievements.forEach((achievement: string) => {
          const achievementLines = pdf.splitTextToSize(`• ${achievement}`, 170)
          pdf.text(achievementLines, 20, yPosition)
          yPosition += achievementLines.length * 3.5 + 1
        })
        yPosition += 3
      })

      // Achievements and Certifications
      if (yPosition > 220) {
        pdf.addPage()
        yPosition = 15
      }

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ACHIEVEMENTS AND CERTIFICATIONS', 15, yPosition)
      yPosition += 5

      pdf.setFontSize(8)
      resumeData.achievements.forEach((achievement: string) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 15
        }

        const parts = achievement.split(':')
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${parts[0]}:`, 15, yPosition)
        pdf.setFont('helvetica', 'normal')
        const remainingText = parts.slice(1).join(':')
        const textLines = pdf.splitTextToSize(remainingText, 160)
        pdf.text(textLines, 15 + pdf.getTextWidth(`${parts[0]}: `), yPosition)
        yPosition += textLines.length * 3.5 + 1
      })

      const pdfBuffer = pdf.output('arraybuffer')

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=resume.pdf'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })

  } catch (error) {
    console.error('Error generating resume:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}