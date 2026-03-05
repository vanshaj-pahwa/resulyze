import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getCondensedResumeKnowledge } from '@/lib/ai/resume-knowledge'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { jobData, resumeData } = await request.json()

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.8,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 2048,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const resumeContent = resumeData.latexSource
      || (resumeData.workExperience ? JSON.stringify(resumeData, null, 2) : 'No resume data provided')

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const prompt = `
    Today's date is ${today}.

    You are an expert cover letter writer with deep resume knowledge:

    ${getCondensedResumeKnowledge()}

    Write a professional cover letter based on the following information:

    Job Information:
    - Job Title: ${jobData.jobTitle || 'Not specified'}
    - Company: ${jobData.company || 'Not specified'}
    - Key Requirements: ${jobData.skills?.join(', ') || 'Not specified'}
    - Qualifications: ${jobData.qualifications?.join(', ') || 'Not specified'}

    Candidate's Resume:
    ${resumeContent}

    Instructions:
    1. Extract the candidate's ACTUAL name from the resume. Never write "[Your Name]" or placeholders.
    2. Cherry-pick the 2-3 most impressive, quantified achievements that directly map to JD requirements.
    3. Open with a specific hook about WHY this role at this company — not generic "I am excited to apply."
    4. Every claim must be backed by a specific achievement from the resume. No generic fluff.
    5. Match tone to company type: startup = conversational, enterprise = formal.
    6. Close with a concrete call to action.
    7. 3-4 paragraphs. Under 400 words.

    Format the cover letter properly with:
    - Date
    - Hiring Manager address placeholder
    - Professional greeting
    - Body paragraphs
    - Professional closing
    - Signature line with the candidate's actual name

    Return only the cover letter text without any additional formatting or explanations.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const coverLetter = response.text()

    return NextResponse.json({ coverLetter })

  } catch (error) {
    console.error('Error generating cover letter:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}