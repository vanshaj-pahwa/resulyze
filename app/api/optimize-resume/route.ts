import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobData } = await request.json()

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `
    You are an expert resume optimizer. Given the following resume data and job requirements, optimize the resume to better match the job description while maintaining truthfulness.

    Job Requirements:
    ${JSON.stringify(jobData, null, 2)}

    Current Resume:
    ${JSON.stringify(resumeData, null, 2)}

    Please optimize the resume by:
    1. Updating the profile summary to highlight relevant skills and experience
    2. Reordering and emphasizing technical skills that match the job requirements
    3. Rephrasing work experience achievements to use keywords from the job description
    4. Suggesting improvements to project descriptions
    5. Ensuring ATS-friendly formatting

    Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
    Focus on making the resume more relevant to the job while keeping all information truthful.

    Return ONLY the JSON object without any additional text or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const optimizedData = JSON.parse(cleanedText)
      return NextResponse.json(optimizedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      // Return original data if parsing fails
      return NextResponse.json(resumeData)
    }

  } catch (error) {
    console.error('Error optimizing resume:', error)
    return NextResponse.json(
      { error: 'Failed to optimize resume' },
      { status: 500 }
    )
  }
}