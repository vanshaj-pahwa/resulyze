import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { generateWithRetry } from '@/lib/ai/generate'
import { jsonrepair } from 'jsonrepair'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { pdfBase64, jobKeywords = [] } = await request.json()

    if (!pdfBase64?.trim()) {
      return NextResponse.json({ error: 'PDF data is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const hasJd = jobKeywords.length > 0

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const prompt = [
      'You are a strict ATS (Applicant Tracking System) compatibility auditor analyzing a compiled resume PDF.',
      'You are seeing exactly what ATS bots see when they parse this resume.',
      `Today's date is ${today}. Use this to determine whether dates in the resume are in the past or future.`,
      'Your scores must be REALISTIC and CONSERVATIVE. Most real resumes score between 55 and 75.',
      'A score above 85 requires near-perfect ATS optimization across every dimension.',
      '',
      hasJd
        ? `Job Description Keywords to match: ${jobKeywords.slice(0, 25).join(', ')}`
        : 'No job description provided.',
      '',
      'TASK: Analyze the resume PDF and return a JSON object with this EXACT structure:',
      '',
      '```json',
      '{',
      '  "score": <integer 0-100, MUST equal sections + keywords + formatting + structure>,',
      '  "breakdown": {',
      '    "sections": <integer 0-25>,',
      '    "keywords": <integer 0-25>,',
      '    "formatting": <integer 0-25>,',
      '    "structure": <integer 0-25>',
      '  },',
      '  "detectedSections": ["Experience", "Skills", "Education"],',
      hasJd
        ? '  "matchedKeywords": ["React.js", "TypeScript"],'
        : '  "matchedKeywords": [],',
      hasJd
        ? '  "missingKeywords": ["Unit Testing", "Debugging"],'
        : '  "missingKeywords": [],',
      '  "suggestions": [',
      '    {',
      '      "severity": "error",',
      '      "category": "sections",',
      '      "message": "plain English description of the issue, one sentence, no line breaks"',
      '    }',
      '  ]',
      '}',
      '```',
      '',
      'SCORING RULES:',
      '',
      'sections (0-25): Start at 25. Deduct for each missing element:',
      '  -8 no contact info visible (email or phone number)',
      '  -8 no Experience / Work History section heading',
      '  -5 no Education section heading',
      '  -4 no Skills / Technologies section heading',
      'Give 25 only if ALL four are present and clearly readable.',
      '',
      'keywords (0-25):',
      hasJd
        ? 'Score = round((matched_count / total_keywords_provided) x 25). Only count a keyword as matched if it appears in the visible PDF text. matchedKeywords and missingKeywords must together contain all provided keywords.'
        : 'Start at 8. +4 if resume has quantified metrics (%, $, numbers tied to achievements). +4 if strong action verbs present (led, built, delivered, optimized, launched, reduced). MAX 16 without a JD. Add a tip: "Load a job description to get keyword-specific scoring."',
      '',
      'formatting (0-25): Start at 25. Deduct for ATS-unfriendly PDF layout:',
      '  -10 multi-column layout (ATS reads columns in wrong order)',
      '  -10 resume appears to be an image or text is not selectable',
      '  -8  images or graphics embedded in the PDF body',
      '  -5  heavy use of tables for layout positioning',
      '  -3  excessive decorative elements, borders, or colored boxes',
      'Give 25 only if the PDF has clean single-column, text-based layout.',
      '',
      'structure (0-25): Start at 25. Deduct:',
      '  -8  candidate name is not prominently visible at the top',
      '  -5  section headings are not clearly distinguished from body text',
      '  -4  experience entries have no date ranges',
      '  -3  inconsistent formatting between sections',
      '  -5  text appears garbled, mis-encoded, or unreadable in places',
      '',
      'CALIBRATION:',
      '  55-65: Template with placeholder content or image-based PDF',
      '  65-75: Real resume, missing some ATS practices',
      '  75-82: Well-optimized resume',
      '  83-89: Excellent, ATS-ready',
      '  90+:   EXCEPTIONAL. Extremely rare.',
      '',
      'severity must be exactly "error", "warning", or "tip".',
      'category must be exactly "sections", "keywords", "formatting", or "structure".',
      'All message strings must be plain English. No backslashes.',
      'Return ONLY the JSON object, no markdown fences, no explanation outside JSON.',
    ].join('\n')

    // Multimodal: PDF inline data + text prompt
    const contents = [
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      { text: prompt },
    ]

    const result = await generateWithRetry(model, contents)

    const analysis = JSON.parse(jsonrepair(result))

    analysis.suggestions      = analysis.suggestions      ?? []
    analysis.detectedSections = analysis.detectedSections ?? []
    analysis.matchedKeywords  = analysis.matchedKeywords  ?? []
    analysis.missingKeywords  = analysis.missingKeywords  ?? []

    return NextResponse.json(analysis)
  } catch (error: any) {
    console.error('Error analyzing ATS:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze ATS compatibility' },
      { status: 500 }
    )
  }
}
