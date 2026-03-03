import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { generateWithRetry } from '@/lib/ai/generate'
import { TEMPLATES } from '@/lib/templates'

// Brief format hints for each template, so we don't need to send the full sample body
const FORMAT_HINTS: Record<string, string> = {
  modern: `
- Sections: \\section{Title}
- Experience/Education entries: \\resumeSubheading{Company}{Dates}{Job Title}{Location}
- Bullets: \\resumeItem{text} inside \\resumeItemListStart...\\resumeItemListEnd
- Projects: \\resumeProjectHeading{\\textbf{Name} $|$ tech description}{\\href{url}{text}}
- Wrap experience/education entries in \\resumeSubHeadingListStart...\\resumeSubHeadingListEnd
- Heading: \\begin{center} \\textbf{\\Huge Name} \\\\ \\vspace{5pt} contact line \\end{center}`,

  classic: `
- Sections: \\ressection{Title}
- Experience/Education entries: \\resentry{Job Title}{Dates}{Company}{Location} then \\begin{itemize}[noitemsep, topsep=4pt, leftmargin=*] bullets \\end{itemize}
- Heading: \\begin{center} {\\LARGE\\textbf{Name}} \\\\[6pt] contact line \\end{center}`,

  minimal: `
- Sections: \\section*{Title} (with asterisk, no numbering)
- Heading: \\centerline{\\Huge Name} then \\vspace{5pt} then \\begin{center}\\small contact $|$ contact $|$ ...\\end{center} — use \\begin{center} NOT \\centerline for the contact line so it wraps within margins
- Skills: \\textbf{Category:} items \\\\ (one per line, no itemize wrapper)
- Experience entries: \\textbf{Job Title,} {Company} -- Location \\hfill Dates \\\\ then \\vspace{-9pt} then \\begin{itemize} \\item bullets \\end{itemize}
- Projects: \\textbf{Name} $|$ tech description \\hfill \\href{url}{text} \\\\ (single line per project)
- Education: \\textbf{Institution} -- Degree \\hfill Year \\\\ (single line per entry)
- Achievements: \\textbf{Label:} text \\\\ (plain lines, no itemize)
- Add \\vspace{-10pt} before Skills, \\vspace{-6.5pt} before Experience, \\vspace{-18.5pt} before Projects and Education`,

  sidebar: `
- Left column (30% width minipage): \\sidesec{} sections — Skills (\\textbf{Cat} \\\\ items $\\cdot$ separated) and Education (\\textbf{Institution} \\\\ Degree \\\\ Year)
- Right column (66% width minipage): \\mainsec{} sections — Profile, Experience, Projects
- Experience: \\mainentry{Job Title}{Dates}{Company}{Location} then \\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em] bullets \\end{itemize}
- Heading: {\\LARGE\\textbf{Name}} \\hfill {\\small\\textcolor{accent}{Role}} \\\\[4pt] {\\small contact}`,
}

function stripFences(text: string): string {
  let s = text.trim()
  if (s.startsWith('```')) {
    const firstNewline = s.indexOf('\n')
    s = firstNewline >= 0 ? s.slice(firstNewline + 1) : s.slice(3)
  }
  if (s.endsWith('```')) {
    s = s.slice(0, -3)
  }
  return s.trim()
}

function extractPreamble(source: string): string {
  const idx = source.indexOf('\\begin{document}')
  return idx >= 0 ? source.slice(0, idx).trim() : source.trim()
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource, targetId } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }

    const target = TEMPLATES.find(t => t.id === targetId)
    if (!target) {
      return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 16384,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const targetPreamble = extractPreamble(target.source)
    const formatHint = FORMAT_HINTS[targetId] ?? ''

    const prompt = `You are an expert LaTeX resume converter. Convert the source resume into the target template format, preserving ALL content from the source exactly.

TARGET TEMPLATE PREAMBLE — copy this verbatim before \\begin{document}:
${targetPreamble}

TARGET FORMAT RULES — use these exact commands and patterns for the document body:
${formatHint}

SOURCE RESUME — extract all content from this and rewrite it using the target format above:
${latexSource}

Additional rules:
- Name, email, phone, linkedin, and github come from the SOURCE RESUME
- For the github contact field: use ONLY the profile URL (github.com/username with NO repo path) — project repo links go in the Projects section
- Preserve EVERY bullet point word-for-word, every date, company name, job title, metric, and skill
- Do NOT introduce any LaTeX commands that are not in the preamble above
- Output a complete, compilable LaTeX document with balanced braces

Return ONLY the complete LaTeX document. No markdown. No explanation.`

    const result = await generateWithRetry(model, prompt)
    const convertedLatex = stripFences(result)

    if (!convertedLatex.includes('\\begin{document}') || !convertedLatex.includes('\\end{document}')) {
      console.error('Invalid LaTeX output (first 200 chars):', convertedLatex.slice(0, 200))
      return NextResponse.json({ error: 'AI returned invalid LaTeX — please try again' }, { status: 500 })
    }

    return NextResponse.json({ convertedLatex })
  } catch (error: any) {
    console.error('Error converting template:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to convert template' },
      { status: 500 }
    )
  }
}
