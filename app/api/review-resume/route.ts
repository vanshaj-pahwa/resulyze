import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getFullResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource, jobData } = await request.json()

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
          'TARGET ROLE (score relevance against this):',
          '- Title: ' + (jobData.jobTitle || 'Not specified'),
          '- Company: ' + (jobData.company || 'Not specified'),
          '- Required Skills: ' + ((jobData.skills || []).join(', ') || 'Not specified'),
          '- Qualifications: ' + ((jobData.qualifications || []).join(', ') || 'Not specified'),
        ].join('\n')
      : ''

    const prompt = [
      'You are an expert resume reviewer. Use these resume writing rules as your SCORING RUBRIC:',
      '',
      getFullResumeKnowledge(),
      '',
      'RESUME TO REVIEW (LaTeX source):',
      latexSource,
      jobContext,
      '',
      'TASK: Perform a comprehensive resume review. Return a JSON object with this EXACT structure:',
      '',
      '```json',
      '{',
      '  "overallScore": <number 0-100>,',
      '  "letterGrade": "<A+|A|B+|B|C+|C|D|F>",',
      '  "verdict": "<one-line summary of resume quality>",',
      '  "sections": {',
      '    "contactInfo": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '    "experience": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '    "skills": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '    "education": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '    "projects": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '    "formatting": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] }',
      '  },',
      '  "atsCompliance": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] },',
      '  "contentQuality": {',
      '    "weakBullets": [{ "text": "<original bullet>", "reason": "<why it is weak>", "rewrite": "<improved version>" }],',
      '    "missingMetrics": ["<bullets that should have numbers but dont>"],',
      '    "vagueClaims": ["<vague statements found>"]',
      '  },',
      '  "topPriorities": ["<fix 1>", "<fix 2>", "<fix 3>"]',
      jobData ? '  ,"relevance": { "score": <0-100>, "findings": ["..."], "suggestions": ["..."] }' : '',
      '}',
      '```',
      '',
      'SCORING GUIDE:',
      '- 90-100: Publication-ready, strong metrics, perfect formatting',
      '- 80-89: Good resume with minor improvements needed',
      '- 70-79: Decent but has clear weaknesses to fix',
      '- 60-69: Below average, multiple issues',
      '- Below 60: Needs significant rewriting',
      '',
      'LATEX-AWARE RULES:',
      '- This is LaTeX source code. Understand LaTeX conventions:',
      '  - \\href{url}{display text} means the URL is MASKED — only "display text" appears in the final PDF. The URL inside \\href{} is NOT visible to the reader.',
      '  - So \\href{https://linkedin.com/in/john}{linkedin.com/in/john} does NOT display "https://" — only "linkedin.com/in/john" is shown.',
      '  - Similarly, \\href{mailto:email}{email} means only "email" is displayed.',
      '  - Do NOT flag href URLs as "displaying https://" — they are hyperlinks, not displayed text.',
      '  - Only flag "https://" if it appears as PLAIN TEXT outside of \\href{} commands.',
      '- Phone numbers are user-specific contact info. Do NOT suggest removing them. They are standard on resumes.',
      '- LinkedIn profiles are user-specific contact info. Do NOT suggest removing them. They are expected on modern resumes.',
      '- Email, phone, LinkedIn, GitHub, and portfolio links are all valid contact info. Review their formatting, not their presence.',
      '',
      'TONE & JUDGMENT RULES:',
      '- Distinguish between HARD RULES and SOFT SUGGESTIONS from the resume knowledge base:',
      '  - HARD RULES (penalize in score): broken formatting, missing contact info, no action verbs, no metrics at all, ATS-incompatible templates',
      '  - SOFT SUGGESTIONS (mention as suggestions, do NOT penalize in score): Profile/Summary section presence, bolding within bullets, section ordering preferences, whether to include an Achievements section separately',
      '- A Profile/Summary section is a USER CHOICE. It is fine at any career stage. Do NOT say it is "prohibited" or penalize the score for having one. You may suggest it as optional for shorter resumes, but never as a negative finding.',
      '- Bolding key terms in bullets is a common and acceptable practice. Do NOT flag it as a problem.',
      '- An Achievements section is valid as a standalone section. Do NOT penalize for having one.',
      '- Focus findings on things that ACTUALLY HURT the resume: weak bullets, missing metrics, bad formatting, ATS issues, poor keyword coverage.',
      '',
      'REVIEW RULES:',
      '- Every finding must cite specific text from the resume',
      '- Every suggestion must be actionable (not "consider improving")',
      '- weakBullets: find 3-5 weakest bullets, provide concrete rewrites using XYZ formula',
      '- If sections are missing from the resume, score them 0 and note they are missing',
      '- Return ONLY the JSON object, no markdown fences, no explanation outside JSON',
    ].join('\n')

    const result = await generateWithRetry(model, prompt)

    // Parse JSON from response (handle markdown fences)
    const cleaned = result.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/g, '').trim()

    try {
      const review = JSON.parse(cleaned)
      return NextResponse.json(review)
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const review = JSON.parse(jsonMatch[0])
        return NextResponse.json(review)
      }
      throw new Error('Failed to parse review response as JSON')
    }
  } catch (error: any) {
    console.error('Error reviewing resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to review resume' },
      { status: 500 }
    )
  }
}
