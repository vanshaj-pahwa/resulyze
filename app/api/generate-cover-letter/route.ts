import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { jobData, resumeData } = await request.json()

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })

    const resumeContent = resumeData.latexSource || JSON.stringify(resumeData)

    const prompt = `
    Write a professional cover letter based on the following information:

    Job Information:
    - Job Title: ${jobData.jobTitle || 'Not specified'}
    - Company: ${jobData.company || 'Not specified'}
    - Key Requirements: ${jobData.skills?.join(', ') || 'Not specified'}
    - Qualifications: ${jobData.qualifications?.join(', ') || 'Not specified'}

    Candidate's Resume:
    ${resumeContent}

    Write a compelling cover letter that:
    1. Extracts the candidate's name, experience, and skills from the resume above
    2. Opens with enthusiasm for the specific role and company
    3. Highlights relevant experience and achievements from the resume
    4. Demonstrates knowledge of the company and role requirements
    5. Shows how the candidate's skills align with job requirements
    6. Closes with a strong call to action
    7. Maintains a professional yet personable tone
    8. Is approximately 3-4 paragraphs long

    Format the cover letter properly with:
    - Date
    - Hiring Manager address placeholder
    - Professional greeting
    - Body paragraphs
    - Professional closing
    - Signature line

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