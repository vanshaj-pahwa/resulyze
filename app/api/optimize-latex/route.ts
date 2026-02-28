import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const generateWithRetry = async (model: any, prompt: string, maxRetries = 3, initialDelay = 1000) => {
  let lastError
  let retries = 0

  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch (error: any) {
      lastError = error
      if ((error.status >= 500 && error.status < 600) || error.status === 429) {
        await delay(initialDelay * Math.pow(2, retries))
        retries++
      } else {
        throw error
      }
    }
  }

  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource, jobData } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }
    if (!jobData) {
      return NextResponse.json({ error: 'Job data is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const prompt = `You are an expert resume writer AND a LaTeX expert. You are given a LaTeX resume and a parsed job description. Your task is to optimize the resume to better match the job description and maximize ATS score.

Job Description Analysis:
- Job Title: ${jobData.jobTitle || 'Not specified'}
- Company: ${jobData.company || 'Not specified'}
- Required Skills: ${(jobData.skills || []).join(', ')}
- Qualifications: ${(jobData.qualifications || []).join(', ')}
- Important Keywords: ${(jobData.keywords || []).join(', ')}
- Experience Required: ${jobData.experience || 'Not specified'}
- Role Summary: ${jobData.summary || 'Not specified'}

Current LaTeX Resume:
${latexSource}

Optimize the resume by:
1. Rephrase the Profile/Summary section to naturally incorporate JD keywords and align with the target role
2. Add missing skills from the JD to the Skills section where the candidate reasonably has them (infer from existing experience)
3. Rephrase achievement bullet points (\\resumeItem{...}) to use terminology and keywords from the JD
4. Reorder skills to prioritize those matching the JD
5. Strengthen quantifiable metrics where they already exist
6. Ensure the resume reads naturally — don't just stuff keywords

CRITICAL CONSTRAINTS:
- NEVER fabricate experience, companies, job titles, dates, or certifications
- NEVER change company names, position titles, dates, education details, or project names
- NEVER break LaTeX syntax — keep all braces balanced, all commands intact
- NEVER add or remove \\usepackage declarations or custom command definitions
- NEVER change the document structure or formatting commands
- Only enhance wording, keyword density, and skill coverage

Return a JSON object with exactly two fields:
{
  "optimizedLatex": "the full optimized LaTeX source code",
  "changes": ["change 1 description", "change 2 description", ...]
}

The "changes" array should contain short human-readable descriptions of each modification you made (e.g., "Added React and TypeScript to Skills section", "Rephrased Profile to emphasize cloud architecture experience").

Return ONLY the JSON object. No markdown fences, no explanation outside the JSON.`

    const result = await generateWithRetry(model, prompt)
    const cleanedText = result.replace(/```json\n?|\n?```/g, '').trim()

    try {
      const parsed = JSON.parse(cleanedText)

      // Validate the optimized LaTeX has basic structure
      if (!parsed.optimizedLatex?.includes('\\begin{document}') || !parsed.optimizedLatex?.includes('\\end{document}')) {
        return NextResponse.json({
          error: 'AI returned invalid LaTeX. Your resume was not modified.',
          optimizedLatex: latexSource,
          changes: [],
        })
      }

      return NextResponse.json({
        optimizedLatex: parsed.optimizedLatex,
        changes: parsed.changes || [],
      })
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({
        error: 'Failed to parse AI response. Your resume was not modified.',
        optimizedLatex: latexSource,
        changes: [],
      })
    }
  } catch (error: any) {
    console.error('Error optimizing LaTeX:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to optimize resume', optimizedLatex: null, changes: [] },
      { status: 500 }
    )
  }
}
