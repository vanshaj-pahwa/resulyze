import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
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

    const prompt = `
    Write a professional cover letter based on the following information:

    Job Information:
    - Job Title: ${jobData.jobTitle}
    - Company: ${jobData.company}
    - Key Requirements: ${jobData.skills?.join(', ')}
    - Qualifications: ${jobData.qualifications?.join(', ')}

    Candidate Information:
    - Name: ${resumeData.personalInfo.name}
    - Current Role: ${resumeData.workExperience[0]?.title}
    - Experience: ${resumeData.profile}
    - Key Skills: ${resumeData.technicalSkills.languages?.join(', ')}

    Write a compelling cover letter that:
    1. Opens with enthusiasm for the specific role and company
    2. Highlights relevant experience and achievements from the resume
    3. Demonstrates knowledge of the company and role requirements
    4. Shows how the candidate's skills align with job requirements
    5. Closes with a strong call to action
    6. Maintains a professional yet personable tone
    7. Is approximately 3-4 paragraphs long

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