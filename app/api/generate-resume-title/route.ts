import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource } = await request.json()

    if (!latexSource) {
      return NextResponse.json({ error: 'No LaTeX source provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 60,
      },
    })

    const prompt = `Given this LaTeX resume, extract the candidate's full name and primary role. Generate a concise resume title (max 5 words). Look for the name in \\name{}, \\author{}, or the first prominent text in the document header.

Examples: "Vanshaj Pahwa SWE Resume", "Jane Doe Data Scientist", "Alex Kim Product Designer"

Rules:
- No dashes, colons, or separators
- Keep it under 30 characters if possible

Return ONLY the title text, nothing else. No quotes, no explanation.

LaTeX:
${latexSource.slice(0, 3000)}`

    const result = await model.generateContent(prompt)
    const title = result.response.text().trim().replace(/^["']|["']$/g, '')

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating resume title:', error)
    return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 })
  }
}
