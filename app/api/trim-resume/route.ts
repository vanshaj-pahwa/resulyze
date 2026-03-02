import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getFullResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource, jobData, pageCount } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
          maxOutputTokens: 8192,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const jobContext = jobData
      ? [
          '',
          'TARGET ROLE (prioritize content relevant to this):',
          '- Title: ' + (jobData.jobTitle || 'Not specified'),
          '- Company: ' + (jobData.company || 'Not specified'),
          '- Required Skills: ' + ((jobData.skills || []).join(', ') || 'Not specified'),
        ].join('\n')
      : ''

    const prompt = [
      'You are an expert resume editor. Your task is to trim this resume to fit on ONE page.',
      '',
      getFullResumeKnowledge(),
      '',
      'CURRENT RESUME (' + (pageCount || 2) + ' pages, needs to be 1):',
      latexSource,
      jobContext,
      '',
      'TRIMMING STRATEGY (in order of priority):',
      '1. Remove the WEAKEST bullets first — those without metrics, using passive voice, or irrelevant to the target role',
      '2. Compress verbose bullets — apply the XYZ formula to make them tighter',
      '3. Remove redundant skills or tools already implied by others',
      '4. Remove outdated or least relevant experience entries (oldest first)',
      '5. Only as a last resort: reduce spacing (\\vspace, itemsep). NEVER reduce font below 10pt or margins below 0.5in',
      '',
      'RULES:',
      '- Do NOT remove entire sections (keep Experience, Skills, Education at minimum)',
      '- Do NOT reduce font size below 10pt',
      '- Do NOT reduce margins below 0.5 inches',
      '- Do NOT add \\newpage, \\clearpage, or \\pagebreak',
      '- Keep the most impactful, metrics-driven bullets',
      '- Maintain valid LaTeX syntax',
      '',
      'Return your response in this EXACT format:',
      '',
      '---EXPLANATION---',
      'Brief explanation of what was removed/changed and why (2-4 bullet points)',
      '---LATEX---',
      'The complete trimmed LaTeX source',
      '---END---',
    ].join('\n')

    const result = await generateWithRetry(model, prompt)

    const explanationMatch = result.match(/---EXPLANATION---\s*([\s\S]*?)(?=---LATEX---|---END---|$)/)
    const latexMatch = result.match(/---LATEX---\s*([\s\S]*?)(?=---END---|$)/)

    const explanation = explanationMatch ? explanationMatch[1].trim() : 'Resume trimmed to fit one page.'
    const rawLatex = latexMatch ? latexMatch[1].trim() : null

    if (!rawLatex) {
      return NextResponse.json({ error: 'Failed to generate trimmed resume' }, { status: 500 })
    }

    const trimmedLatex = rawLatex
      .replace(/^```(?:latex|tex)?\s*\n?/i, '')
      .replace(/\n?```\s*$/g, '')
      .replace(/\\newpage/g, '')
      .replace(/\\clearpage/g, '')
      .replace(/\\pagebreak/g, '')
      .trim()

    if (!trimmedLatex.includes('\\begin{document}') || !trimmedLatex.includes('\\end{document}')) {
      return NextResponse.json({ error: 'Generated LaTeX is invalid' }, { status: 500 })
    }

    return NextResponse.json({ trimmedLatex, explanation })
  } catch (error: any) {
    console.error('Error trimming resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to trim resume' },
      { status: 500 }
    )
  }
}
