import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { jobData, resumeData, contactName, contactEmail } = await request.json()

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    })

    const greeting = contactName ? `Hi ${contactName},` : 'Hi there,'
    
    const prompt = `
    Write a professional referral message in FIRST PERSON that I (${resumeData.personalInfo.name}) can send to ${contactName || 'someone in my network'} to ask for referrals for a job opportunity.

    Job Information:
    - Job Title: ${jobData.jobTitle}
    - Company: ${jobData.company}
    - Key Requirements: ${jobData.skills?.join(', ')}

    My Information:
    - Name: ${resumeData.personalInfo.name}
    - Current Role: ${resumeData.workExperience[0]?.title}
    - Key Skills: ${resumeData.technicalSkills.languages?.join(', ')}
    - Experience Summary: ${resumeData.profile}

    Contact Information:
    - Contact Name: ${contactName || 'Not specified'}
    - Contact Email: ${contactEmail || 'Not provided'}

    Write a personalized, professional message where I am speaking in first person that:
    1. Start with "${greeting}"
    2. I introduce myself and my background briefly
    3. I mention the specific role and company I'm interested in
    4. I highlight my relevant qualifications and experience
    5. I make a polite ask for referrals or connections
    6. I offer to provide more information if needed
    7. Is suitable for direct email or LinkedIn messages
    8. Is approximately 2-3 short paragraphs
    9. End with a professional closing

    The tone should be:
    - Professional but friendly
    - Confident but not pushy
    - Grateful and respectful
    - Clear and concise
    - Written in FIRST PERSON (I, my, me)
    - Personalized to the contact if name is provided

    Return only the referral message text without any additional formatting or explanations.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const referralMessage = response.text()

    return NextResponse.json({ referralMessage })

  } catch (error) {
    console.error('Error generating referral message:', error)
    return NextResponse.json(
      { error: 'Failed to generate referral message' },
      { status: 500 }
    )
  }
}