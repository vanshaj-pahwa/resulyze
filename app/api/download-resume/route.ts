import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType, ExternalHyperlink } from 'docx'
import jsPDF from 'jspdf'
import { parse as parseHtml } from 'node-html-parser'

const escapeText = (text: string) => {
  if (!text) return ''
  return text.replace(/[\r\n]+/g, ' ').trim()
}

/** Strip HTML tags for plain text usage */
function stripHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>\s*<p[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ──────────────────────────────────────────────────────
// HTML → text segments for rich text PDF/DOCX rendering
// ──────────────────────────────────────────────────────
interface TextSegment {
  text: string
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: number | null
}

function htmlToSegments(html: string): TextSegment[] {
  if (!html) return [{ text: '', bold: false, italic: false, underline: false, fontSize: null }]
  if (!/<[^>]+>/.test(html)) {
    return [{ text: escapeText(html), bold: false, italic: false, underline: false, fontSize: null }]
  }

  const segments: TextSegment[] = []
  const root = parseHtml(html)

  function walk(node: any, inherited: { bold: boolean; italic: boolean; underline: boolean; fontSize: number | null }) {
    if (node.nodeType === 3) {
      const text = (node.rawText || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
      if (text) segments.push({ text, ...inherited })
      return
    }

    const tag = (node.tagName || '').toLowerCase()
    const next = { ...inherited }

    if (tag === 'strong' || tag === 'b') next.bold = true
    if (tag === 'em' || tag === 'i') next.italic = true
    if (tag === 'u') next.underline = true
    if (tag === 'br') { segments.push({ text: '\n', ...inherited }); return }

    if (tag === 'span') {
      const style = node.getAttribute?.('style') || ''
      const match = style.match(/font-size:\s*([\d.]+)pt/)
      if (match) next.fontSize = parseFloat(match[1])
    }

    for (const child of (node.childNodes || [])) {
      walk(child, next)
    }

    if (tag === 'p' || tag === 'div') {
      segments.push({ text: '\n', ...inherited })
    }
  }

  walk(root, { bold: false, italic: false, underline: false, fontSize: null })

  // Trim trailing newlines
  while (segments.length > 0 && segments[segments.length - 1].text === '\n') {
    segments.pop()
  }

  return segments.length > 0 ? segments : [{ text: '', bold: false, italic: false, underline: false, fontSize: null }]
}

/** Convert HTML segments to docx TextRun objects */
function htmlToTextRuns(html: string, baseSize: number = 20, baseFont: string = 'Arial'): TextRun[] {
  const segments = htmlToSegments(html)
  return segments.flatMap((seg) => {
    if (seg.text === '\n') {
      return [new TextRun({ text: '', break: 1 })]
    }
    return [new TextRun({
      text: seg.text,
      bold: seg.bold || undefined,
      italics: seg.italic || undefined,
      underline: seg.underline ? {} : undefined,
      size: seg.fontSize ? Math.round(seg.fontSize * 2) : baseSize,
      font: baseFont,
    })]
  })
}

// ──────────────────────────────────────────────────────
// Template colour / font config
// ──────────────────────────────────────────────────────
interface TemplateStyle {
  accentRgb: [number, number, number]
  headingFont: string
  bodyFont: string
  sectionStyle: 'uppercase' | 'titlecase'
  headerAlign: 'center' | 'left'
  showHeaderRule: boolean
  contactColor: [number, number, number]
  sectionHeadingColor: [number, number, number]
  sectionRuleColor: [number, number, number] | null // null = no full-width rule
  sectionOrder: string[]
}

const SECTION_ORDER_CLASSIC = ['profile', 'skills', 'experience', 'education', 'projects', 'achievements']
const SECTION_ORDER_DEFAULT = ['profile', 'experience', 'skills', 'education', 'projects', 'achievements']

function getStyle(templateId: string): TemplateStyle {
  switch (templateId) {
    case 'modern':
      return {
        accentRgb: [15, 118, 110],  // teal-700
        headingFont: 'helvetica',
        bodyFont: 'helvetica',
        sectionStyle: 'titlecase',
        headerAlign: 'left',
        showHeaderRule: false,
        contactColor: [15, 118, 110],
        sectionHeadingColor: [15, 118, 110],  // teal accent headings
        sectionRuleColor: [15, 118, 110],
        sectionOrder: SECTION_ORDER_DEFAULT,
      }
    case 'minimal':
      return {
        accentRgb: [0, 0, 0],
        headingFont: 'helvetica',
        bodyFont: 'helvetica',
        sectionStyle: 'uppercase',
        headerAlign: 'center',
        showHeaderRule: false,
        contactColor: [85, 85, 85],
        sectionHeadingColor: [0, 0, 0],       // pure black headings
        sectionRuleColor: [153, 153, 153],
        sectionOrder: SECTION_ORDER_DEFAULT,
      }
    case 'creative':
      return {
        accentRgb: [30, 58, 95],  // navy
        headingFont: 'helvetica',
        bodyFont: 'helvetica',
        sectionStyle: 'uppercase',
        headerAlign: 'left',
        showHeaderRule: false,
        contactColor: [255, 255, 255],
        sectionHeadingColor: [30, 58, 95],     // navy headings
        sectionRuleColor: [226, 232, 240],
        sectionOrder: SECTION_ORDER_DEFAULT,
      }
    case 'technical':
      return {
        accentRgb: [5, 150, 105],  // emerald-600
        headingFont: 'courier',
        bodyFont: 'helvetica',
        sectionStyle: 'titlecase',
        headerAlign: 'left',
        showHeaderRule: false,
        contactColor: [5, 150, 105],
        sectionHeadingColor: [17, 24, 39],     // black headings (gray-900)
        sectionRuleColor: [209, 213, 219],
        sectionOrder: SECTION_ORDER_DEFAULT,
      }
    case 'classic':
    default:
      return {
        accentRgb: [37, 99, 235],
        headingFont: 'helvetica',
        bodyFont: 'helvetica',
        sectionStyle: 'uppercase',
        headerAlign: 'center',
        showHeaderRule: true,
        contactColor: [37, 99, 235],
        sectionHeadingColor: [0, 0, 0],        // black headings
        sectionRuleColor: null,
        sectionOrder: SECTION_ORDER_CLASSIC,
      }
  }
}

function formatSectionTitle(title: string, style: 'uppercase' | 'titlecase') {
  if (style === 'uppercase') return title.toUpperCase()
  return title
}

// ──────────────────────────────────────────────────────
// PDF generation
// ──────────────────────────────────────────────────────
function generatePdf(resumeData: any, templateId: string): ArrayBuffer {
  const s = getStyle(templateId)

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = 210
  const pageHeight = 297
  const margin = { left: 8, right: 8, top: 13, bottom: 8 }
  const contentWidth = pageWidth - margin.left - margin.right
  let y = margin.top

  const checkPageBreak = (height: number) => {
    if (y + height > pageHeight - margin.bottom) {
      pdf.addPage()
      y = margin.top
      return true
    }
    return false
  }

  // ── Section header ──
  const drawSectionHeader = (title: string) => {
    checkPageBreak(10)
    const formatted = formatSectionTitle(title, s.sectionStyle)
    pdf.setFont(s.headingFont, 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(s.sectionHeadingColor[0], s.sectionHeadingColor[1], s.sectionHeadingColor[2])
    pdf.text(formatted, margin.left, y)
    y += 1

    if (s.sectionRuleColor) {
      pdf.setDrawColor(s.sectionRuleColor[0], s.sectionRuleColor[1], s.sectionRuleColor[2])
      pdf.setLineWidth(0.3)
      pdf.line(margin.left, y, pageWidth - margin.right, y)
    }
    y += 4
    pdf.setTextColor(0, 0, 0)
  }

  const drawText = (text: string, x: number, maxWidth: number, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFont(s.bodyFont, isBold ? 'bold' : 'normal')
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(escapeText(text), maxWidth)
    for (const line of lines) {
      checkPageBreak(5)
      pdf.text(line, x, y)
      y += 4
    }
  }

  /** Render HTML-rich text with bold/italic/underline/fontSize support */
  const drawRichText = (html: string, x: number, maxWidth: number, defaultFontSize: number = 10) => {
    const segments = htmlToSegments(html)
    let currentX = x

    for (const seg of segments) {
      if (seg.text === '\n') {
        currentX = x
        y += 4
        checkPageBreak(5)
        continue
      }

      const fontStyle = seg.bold && seg.italic ? 'bolditalic' :
                        seg.bold ? 'bold' :
                        seg.italic ? 'italic' : 'normal'
      const fontSize = seg.fontSize || defaultFontSize

      pdf.setFont(s.bodyFont, fontStyle)
      pdf.setFontSize(fontSize)

      const words = seg.text.split(/(\s+)/)
      for (const word of words) {
        if (!word) continue
        const wordWidth = pdf.getTextWidth(word)

        if (currentX + wordWidth > x + maxWidth && currentX > x) {
          currentX = x
          y += 4
          checkPageBreak(5)
        }

        pdf.text(word, currentX, y)

        if (seg.underline) {
          pdf.setDrawColor(0, 0, 0)
          pdf.setLineWidth(0.2)
          pdf.line(currentX, y + 0.5, currentX + wordWidth, y + 0.5)
        }

        currentX += wordWidth
      }
    }

    y += 4
  }

  // ── Header ──
  if (templateId === 'creative') {
    // Dark header bar
    pdf.setFillColor(s.accentRgb[0], s.accentRgb[1], s.accentRgb[2])
    pdf.rect(0, 0, pageWidth, 28, 'F')
    y = 12

    pdf.setFont(s.headingFont, 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(255, 255, 255)
    pdf.text(escapeText(resumeData.personalInfo?.name || ''), margin.left + 4, y)
    y += 6

    // Contact on dark bg
    pdf.setFont(s.bodyFont, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(220, 220, 230)
    const contactParts = [
      resumeData.personalInfo?.phone,
      resumeData.personalInfo?.email,
      resumeData.personalInfo?.linkedin,
      resumeData.personalInfo?.github
    ].filter(Boolean)
    pdf.text(contactParts.join('  |  '), margin.left + 4, y)

    // Profile in header
    if (resumeData.profile) {
      y += 5
      pdf.setFontSize(8.5)
      pdf.setTextColor(200, 200, 210)
      const profileLines = pdf.splitTextToSize(escapeText(resumeData.profile), contentWidth - 8)
      for (const line of profileLines) {
        if (y > 26) break
        pdf.text(line, margin.left + 4, y)
        y += 3.5
      }
    }

    y = 32
    pdf.setTextColor(0, 0, 0)
  } else if (templateId === 'technical') {
    // Dark rounded-ish header bar
    pdf.setFillColor(31, 41, 55)
    pdf.rect(margin.left, margin.top - 2, contentWidth, 18, 'F')

    y = margin.top + 5
    pdf.setFont('courier', 'bold')
    pdf.setFontSize(18)
    pdf.setTextColor(249, 250, 251)
    pdf.text(escapeText(resumeData.personalInfo?.name || ''), margin.left + 4, y)
    y += 6

    pdf.setFont(s.bodyFont, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(s.accentRgb[0], s.accentRgb[1], s.accentRgb[2])
    const contactParts = [
      resumeData.personalInfo?.phone,
      resumeData.personalInfo?.email,
      resumeData.personalInfo?.linkedin,
      resumeData.personalInfo?.github
    ].filter(Boolean)
    pdf.text(contactParts.join('  |  '), margin.left + 4, y)

    y = margin.top + 20
    pdf.setTextColor(0, 0, 0)
  } else {
    // Classic / Modern / Minimal
    const name = escapeText(resumeData.personalInfo?.name || '')
    pdf.setFont(s.headingFont, 'bold')
    pdf.setFontSize(20)
    pdf.setTextColor(0, 0, 0)

    if (s.headerAlign === 'center') {
      pdf.text(name, pageWidth / 2, y, { align: 'center' })
    } else {
      pdf.text(name, margin.left, y)
    }
    y += 7

    // Contact
    pdf.setFont(s.bodyFont, 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(s.contactColor[0], s.contactColor[1], s.contactColor[2])
    const contactParts = [
      resumeData.personalInfo?.phone,
      resumeData.personalInfo?.email,
      resumeData.personalInfo?.linkedin,
      resumeData.personalInfo?.github
    ].filter(Boolean)
    const contactText = contactParts.join(' | ')

    if (s.headerAlign === 'center') {
      pdf.text(contactText, pageWidth / 2, y, { align: 'center' })

      // Clickable links
      let linkX = (pageWidth - pdf.getTextWidth(contactText)) / 2
      for (let i = 0; i < contactParts.length; i++) {
        const part = contactParts[i]
        const partWidth = pdf.getTextWidth(part)
        if (part === resumeData.personalInfo?.email) {
          pdf.link(linkX, y - 3, partWidth, 4, { url: `mailto:${part}` })
        } else if (part === resumeData.personalInfo?.linkedin || part === resumeData.personalInfo?.github) {
          const url = part.startsWith('http') ? part : `https://${part}`
          pdf.link(linkX, y - 3, partWidth, 4, { url })
        }
        linkX += partWidth + pdf.getTextWidth(' | ')
      }
    } else {
      pdf.text(contactText, margin.left, y)
    }

    pdf.setTextColor(0, 0, 0)
    y += 5

    if (s.showHeaderRule) {
      pdf.setDrawColor(0, 0, 0)
      pdf.setLineWidth(0.4)
      pdf.line(margin.left, y, pageWidth - margin.right, y)
      y += 6
    } else {
      y += 2
    }
  }

  // ── Section renderers ──
  const renderProfile = () => {
    if (!resumeData.profile) return
    if (templateId === 'creative') return // already in header
    drawSectionHeader('Profile')
    drawRichText(resumeData.profile, margin.left, contentWidth, 10)
    y += 4
  }

  const renderSkills = () => {
    const hasSkills = resumeData.technicalSkills &&
      Object.keys(resumeData.technicalSkills).some((key: string) => {
        const value = resumeData.technicalSkills[key]
        return Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && value.trim())
      })
    if (!hasSkills) return

    drawSectionHeader('Technical Skills')

    for (const [key, value] of Object.entries(resumeData.technicalSkills)) {
      const values = Array.isArray(value) ? value : (typeof value === 'string' && (value as string).trim() ? [value as string] : [])
      if (values.length === 0) continue

      checkPageBreak(6)
      pdf.setFont(s.bodyFont, 'bold')
      pdf.setFontSize(10)
      const label = `${key}: `
      pdf.text(label, margin.left, y)

      const labelWidth = pdf.getTextWidth(label)
      pdf.setFont(s.bodyFont, 'normal')
      const valueText = values.join(', ')

      // First line fits in the space remaining after the bold label
      const firstLineMax = contentWidth - labelWidth
      const firstLines = pdf.splitTextToSize(valueText, firstLineMax)
      pdf.text(firstLines[0] || '', margin.left + labelWidth, y)
      y += 4

      // Continuation lines use full content width from left margin
      if (firstLines.length > 1) {
        const remaining = firstLines.slice(1).join(' ')
        const contLines = pdf.splitTextToSize(remaining, contentWidth)
        for (const line of contLines) {
          checkPageBreak(5)
          pdf.text(line, margin.left, y)
          y += 4
        }
      }
    }
    y += 4
  }

  const renderExperience = () => {
    if (!resumeData.workExperience?.length) return

    drawSectionHeader('Work Experience')

    for (const exp of resumeData.workExperience) {
      checkPageBreak(15)

      // Measure date to reserve space on the right
      pdf.setFont(s.bodyFont, 'italic')
      pdf.setFontSize(10)
      const dateText = `${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}`
      const dateW = pdf.getTextWidth(dateText) + 4

      pdf.setFont(s.bodyFont, 'bold')
      pdf.setFontSize(10)
      const posCompany = `${escapeText(exp.position)} | ${escapeText(exp.company)}`
      const maxPosW = contentWidth - dateW
      const posLines = pdf.splitTextToSize(posCompany, maxPosW)
      pdf.text(posLines[0], margin.left, y)

      pdf.setFont(s.bodyFont, 'italic')
      pdf.setFontSize(10)
      pdf.text(dateText, pageWidth - margin.right, y, { align: 'right' })
      y += 4.5

      for (let li = 1; li < posLines.length; li++) {
        pdf.setFont(s.bodyFont, 'bold')
        pdf.setFontSize(10)
        pdf.text(posLines[li], margin.left, y)
        y += 4.5
      }

      if (exp.location) {
        pdf.setFont(s.bodyFont, 'italic')
        pdf.setFontSize(10)
        pdf.text(escapeText(exp.location), margin.left, y)
        y += 4.5
      }

      if (exp.achievements?.length > 0) {
        pdf.setFont(s.bodyFont, 'normal')
        pdf.setFontSize(10)
        const bulletIndent = 6

        for (const ach of exp.achievements) {
          const achText = stripHtml(ach)
          if (achText) {
            checkPageBreak(6)
            pdf.setFont(s.bodyFont, 'normal')
            pdf.setFontSize(10)
            pdf.text('•', margin.left + bulletIndent, y)
            const textStartX = margin.left + bulletIndent + 4
            const textMaxWidth = contentWidth - bulletIndent - 4
            drawRichText(ach, textStartX, textMaxWidth, 10)
          }
        }
      }
      y += 3
    }
  }

  const renderEducation = () => {
    if (!resumeData.education?.degree && !resumeData.education?.institution) return

    drawSectionHeader('Education')

    checkPageBreak(12)

    // Measure date first to reserve space on the right
    let dateWidth = 0
    const dateText = resumeData.education.graduationDate || ''
    if (dateText) {
      pdf.setFont(s.bodyFont, 'italic')
      pdf.setFontSize(10)
      dateWidth = pdf.getTextWidth(dateText) + 4 // 4mm gap
    }

    pdf.setFont(s.bodyFont, 'bold')
    pdf.setFontSize(10)
    const eduText = `${escapeText(resumeData.education.degree)} | ${escapeText(resumeData.education.institution)}`
    const maxEduWidth = contentWidth - dateWidth
    const eduLines = pdf.splitTextToSize(eduText, maxEduWidth)
    pdf.text(eduLines[0], margin.left, y)

    if (dateText) {
      pdf.setFont(s.bodyFont, 'italic')
      pdf.setFontSize(10)
      pdf.text(dateText, pageWidth - margin.right, y, { align: 'right' })
    }
    y += 4.5

    // Print any overflow lines of the education text
    for (let i = 1; i < eduLines.length; i++) {
      pdf.setFont(s.bodyFont, 'bold')
      pdf.setFontSize(10)
      pdf.text(eduLines[i], margin.left, y)
      y += 4.5
    }

    const eduDetails = [
      resumeData.education.location,
      resumeData.education.gpa ? `GPA: ${resumeData.education.gpa}` : null
    ].filter(Boolean).join(' | ')

    if (eduDetails) {
      pdf.setFont(s.bodyFont, 'italic')
      pdf.setFontSize(10)
      pdf.text(eduDetails, margin.left, y)
      y += 4.5
    }
    y += 4
  }

  const renderProjects = () => {
    if (!resumeData.projects?.length) return

    drawSectionHeader('Projects')

    for (const project of resumeData.projects) {
      checkPageBreak(12)

      pdf.setFont(s.bodyFont, 'bold')
      pdf.setFontSize(10)
      let projectTitle = escapeText(project.name)
      if (project.technologies) projectTitle += ` – ${escapeText(project.technologies)}`

      const maxTitleWidth = contentWidth - (project.githubUrl ? 45 : 0)
      const titleLines = pdf.splitTextToSize(projectTitle, maxTitleWidth)
      pdf.text(titleLines[0], margin.left, y)

      if (project.githubUrl) {
        pdf.setFont(s.bodyFont, 'normal')
        pdf.setFontSize(10)
        pdf.setTextColor(s.accentRgb[0], s.accentRgb[1], s.accentRgb[2])
        const linkText = escapeText(project.githubUrl)
        pdf.text(linkText, pageWidth - margin.right, y, { align: 'right' })
        const linkWidth = pdf.getTextWidth(linkText)
        const url = project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`
        pdf.link(pageWidth - margin.right - linkWidth, y - 3, linkWidth, 5, { url })
        pdf.setTextColor(0, 0, 0)
      }
      y += 4.5

      for (let i = 1; i < titleLines.length; i++) {
        pdf.setFont(s.bodyFont, 'bold')
        pdf.text(titleLines[i], margin.left, y)
        y += 4.5
      }

      if (project.achievements?.length > 0) {
        pdf.setFont(s.bodyFont, 'normal')
        pdf.setFontSize(10)
        const bulletIndent = 6

        for (const ach of project.achievements) {
          const achText = stripHtml(ach)
          if (achText) {
            checkPageBreak(6)
            pdf.setFont(s.bodyFont, 'normal')
            pdf.setFontSize(10)
            pdf.text('•', margin.left + bulletIndent, y)
            const textStartX = margin.left + bulletIndent + 4
            const textMaxWidth = contentWidth - bulletIndent - 4
            drawRichText(ach, textStartX, textMaxWidth, 10)
          }
        }
      }
      y += 3
    }
  }

  const renderAchievements = () => {
    if (!resumeData.achievements?.length) return

    drawSectionHeader('Achievements and Certifications')

    pdf.setFontSize(10)
    for (const ach of resumeData.achievements) {
      const achPlain = stripHtml(ach)
      if (achPlain) {
        checkPageBreak(6)

        // If it contains HTML, render as rich text
        if (/<[^>]+>/.test(ach)) {
          drawRichText(ach, margin.left, contentWidth, 10)
        } else {
          // Plain text: bold prefix before colon
          const colonIdx = ach.indexOf(':')
          if (colonIdx > 0 && colonIdx < 50) {
            pdf.setFont(s.bodyFont, 'bold')
            const title = ach.substring(0, colonIdx + 1)
            pdf.text(title, margin.left, y)
            const titleWidth = pdf.getTextWidth(title + ' ')
            pdf.setFont(s.bodyFont, 'normal')
            const rest = escapeText(ach.substring(colonIdx + 1))
            const restLines = pdf.splitTextToSize(rest, contentWidth - titleWidth)
            if (restLines[0]) pdf.text(restLines[0], margin.left + titleWidth, y)
            y += 4
            for (let i = 1; i < restLines.length; i++) {
              checkPageBreak(5)
              pdf.text(restLines[i], margin.left, y)
              y += 4
            }
          } else {
            pdf.setFont(s.bodyFont, 'normal')
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
  }

  // ── Render sections in template order ──
  const renderers: Record<string, () => void> = {
    profile: renderProfile,
    skills: renderSkills,
    experience: renderExperience,
    education: renderEducation,
    projects: renderProjects,
    achievements: renderAchievements,
  }

  for (const section of s.sectionOrder) {
    renderers[section]?.()
  }

  return pdf.output('arraybuffer')
}

// ──────────────────────────────────────────────────────
// DOCX generation (stays classic layout, template-agnostic)
// ──────────────────────────────────────────────────────
function generateDocx(resumeData: any): Document {
  return new Document({
    sections: [{
      properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: [
        new Paragraph({
          children: [new TextRun({ text: resumeData.personalInfo?.name || '', bold: true, size: 32, font: "Arial" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
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
        new Paragraph({
          children: [new TextRun({ text: "_".repeat(100), size: 20, font: "Arial" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        // Profile
        ...(resumeData.profile ? [
          new Paragraph({
            children: [new TextRun({ text: "PROFILE", bold: true, size: 22, font: "Arial" })],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: htmlToTextRuns(resumeData.profile),
            spacing: { after: 200 },
            alignment: AlignmentType.JUSTIFIED
          })
        ] : []),
        // Technical Skills
        ...(resumeData.technicalSkills && Object.keys(resumeData.technicalSkills).some((key: string) => {
          const value = resumeData.technicalSkills[key]
          return Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && value.trim())
        }) ? [
          new Paragraph({
            children: [new TextRun({ text: "TECHNICAL SKILLS", bold: true, size: 22, font: "Arial" })],
            spacing: { after: 100 }
          }),
          ...Object.entries(resumeData.technicalSkills)
            .filter(([, value]) => Array.isArray(value) ? value.length > 0 : (typeof value === 'string' && (value as string).trim()))
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
            ...(Array.isArray(exp.achievements) ? exp.achievements.filter((a: string) => stripHtml(a)).map((ach: string) =>
              new Paragraph({
                children: [new TextRun({ text: '• ', size: 20, font: "Arial" }), ...htmlToTextRuns(ach)],
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
            ...(Array.isArray(project.achievements) ? project.achievements.filter((a: string) => stripHtml(a)).map((ach: string) =>
              new Paragraph({
                children: [new TextRun({ text: '• ', size: 20, font: "Arial" }), ...htmlToTextRuns(ach)],
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
}

// ──────────────────────────────────────────────────────
// Route handler
// ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { resumeData, format, templateId = 'classic' } = await request.json()

    if (format === 'pdf') {
      const pdfBuffer = generatePdf(resumeData, templateId)
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=resume.pdf'
        }
      })
    }

    if (format === 'docx') {
      const doc = generateDocx(resumeData)
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
