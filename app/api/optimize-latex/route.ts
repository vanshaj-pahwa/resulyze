import { NextRequest, NextResponse } from 'next/server'
import { jsonrepair } from 'jsonrepair'
import { getGeminiClient } from '@/lib/gemini'
import { getCondensedResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'

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
        responseMimeType: 'application/json',
      },
      },
      { apiVersion: 'v1beta' }
    )

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const prompt = `Today's date is ${today}. Use this when evaluating whether dates in the resume are past or future.

You are an expert resume writer AND a LaTeX expert. You follow these resume writing rules:

${getCondensedResumeKnowledge()}

You are given a LaTeX resume and a parsed job description. Your task is to optimize the resume to better match the job description while following the rules above.

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
1. Rephrase achievement bullets using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
2. Replace weak action verbs (Helped, Assisted, Worked on, Used) with strong ones (Built, Reduced, Architected, Implemented)
3. Add missing JD skills to the Skills section where the candidate reasonably has them (infer from experience)
4. Reorder skills to prioritize JD matches
5. Strengthen quantifiable metrics where they exist — push for specific numbers
6. Flag and fix any formatting violations from the rules above (capitalization, date format, etc.)
7. Ensure the resume reads naturally — don't keyword-stuff

PROFILE / SUMMARY SECTION:
- If the resume has a Profile or Summary section, do NOT remove it. Instead, tailor it to the target role: mention years of experience, core specialization, 2–3 headline skills from the JD, and one standout achievement.
- A good profile is a 2–3 line professional summary that hooks a recruiter in under 10 seconds.
- If no profile exists, do NOT add one.

CRITICAL CONSTRAINTS:
- NEVER fabricate experience, companies, job titles, dates, or certifications
- NEVER change company names, position titles, dates, education details, or project names
- NEVER break LaTeX syntax — keep all braces balanced, all commands intact
- NEVER add or remove \\usepackage declarations or custom command definitions
- NEVER change the document structure or formatting commands
- NEVER remove or rename sections (Profile, Summary, Projects, etc.) — only enhance their content
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

    let parsed: any
    try {
      parsed = JSON.parse(cleanedText)
    } catch {
      // Attempt repair with jsonrepair
      try {
        const repaired = jsonrepair(cleanedText)
        parsed = JSON.parse(repaired)
      } catch (repairError) {
        console.error('jsonrepair also failed:', repairError)
        return NextResponse.json({
          error: 'Failed to parse AI response. Your resume was not modified.',
          optimizedLatex: latexSource,
          changes: [],
        })
      }
    }

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
  } catch (error: any) {
    console.error('Error optimizing LaTeX:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to optimize resume', optimizedLatex: null, changes: [] },
      { status: 500 }
    )
  }
}
