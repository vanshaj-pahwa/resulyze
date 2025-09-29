import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { jobDescription } = await request.json()

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
    })

    const prompt = `
    Analyze the following job description and extract key information. Return your response as a valid JSON object with the following structure:

    {
      "jobTitle": "extracted job title",
      "company": "company name if mentioned",
      "skills": ["skill1", "skill2", "skill3"],
      "qualifications": ["qualification1", "qualification2"],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "experience": "required experience level",
      "location": "job location if mentioned",
      "summary": "brief summary of the role"
    }

    Job Description:
    ${jobDescription}

    Focus on:
    - Technical skills and technologies mentioned
    - Required qualifications and certifications
    - Important keywords that should be included in a resume
    - Years of experience required
    - Soft skills mentioned

    Return ONLY the JSON object, no additional text or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const parsedData = JSON.parse(cleanedText)
      return NextResponse.json(parsedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        jobTitle: "Unable to extract",
        company: "Unable to extract",
        skills: [],
        qualifications: [],
        keywords: [],
        experience: "Unable to extract",
        location: "Unable to extract",
        summary: "Unable to process job description"
      })
    }

  } catch (error) {
    console.error('Error processing job description:', error)
    return NextResponse.json(
      { error: 'Failed to process job description' },
      { status: 500 }
    )
  }
}