import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { generateWithRetry } from '@/lib/ai/generate'

/** Strip preamble — only send document body to reduce input tokens */
function extractDocumentBody(source: string): string {
  const start = source.indexOf('\\begin{document}')
  const end = source.indexOf('\\end{document}')
  if (start !== -1 && end !== -1) {
    return source.slice(start, end + '\\end{document}'.length)
  }
  return source
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 16384,
          // Force valid JSON output — no manual repair needed
          responseMimeType: 'application/json',
        },
      },
      { apiVersion: 'v1beta' }
    )

    const body = extractDocumentBody(latexSource)

    const prompt = `Parse this LaTeX resume and return a JSON object with these fields:
- name (string), phone (string), email (string)
- linkedin (string: "linkedin.com/in/handle" or "")
- github (string: profile URL only "github.com/username" — NO repo paths; those go in projects[].link)
- profile (string: plain text summary, no LaTeX commands)
- skills: [{category, items[]}]
- experience: [{title, company, dates, location, bullets[]}] — include EVERY entry and ALL bullets
- projects: [{name, tech, link, linkText}]
- education: [{institution, degree, dates, location}]
- achievements: [string]

Rules:
- Strip ALL LaTeX commands: \\textbf{X}→X, \\href{url}{text}→text, \\textit{X}→X, etc.
- Keep dates verbatim (e.g. "Jan 2024 -- Present")
- Empty fields: "" or []

LaTeX Resume:
${body}`

    const result = await generateWithRetry(model, prompt)

    try {
      const data = JSON.parse(result)
      return NextResponse.json({ data })
    } catch {
      console.error('Failed to parse AI response as JSON (length:', result.length, '):\n', result)
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error parsing resume LaTeX:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to parse resume' },
      { status: 500 }
    )
  }
}
