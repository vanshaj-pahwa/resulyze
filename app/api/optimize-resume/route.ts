import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("API Key is missing");
      return NextResponse.json(
        { error: 'API key configuration issue', details: 'GEMINI_API_KEY is not available' },
        { status: 500 }
      );
    }
    
    const { resumeData, jobData, optimizationMode = "general", improvementChecklist = [], missingSkills = [] } = await request.json()

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    })

    let prompt = ""
    
    // Choose prompt based on optimization mode
    switch(optimizationMode) {
      case "checklist":
        prompt = `
        You are an expert resume optimizer. Given the following resume data, job requirements, and improvement checklist, optimize the resume to address all the checklist items while maintaining truthfulness.

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}

        Current Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Improvement Checklist to Complete:
        ${JSON.stringify(improvementChecklist, null, 2)}

        Please update the resume to address each item in the checklist by:
        1. Making specific changes that directly resolve each checklist item
        2. Ensuring all changes are truthful and realistic based on the existing resume
        3. Following ATS best practices in your modifications

        Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
        Be thorough and make sure every checklist item is properly addressed.

        Return ONLY the JSON object without any additional text or formatting.
        `
        break;
        
      case "skills":
        prompt = `
        You are an expert resume optimizer. Given the following resume data, job requirements, and list of missing skills, optimize the resume to incorporate the missing skills in a truthful manner.

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}

        Current Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Missing Skills to Add:
        ${JSON.stringify(missingSkills, null, 2)}

        Please update the resume to incorporate the missing skills by:
        1. Adding the missing skills to the technical skills sections where appropriate
        2. Integrating the missing skills into work experience descriptions where you can reasonably infer the candidate might have used them
        3. Updating project descriptions to highlight relevant skill usage
        4. Mentioning relevant skills in the profile summary
        5. ONLY include skills that can be reasonably inferred from existing resume content - don't fabricate experience

        Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
        Focus on naturally incorporating the skills rather than just listing them.

        Return ONLY the JSON object without any additional text or formatting.
        `
        break;
        
      default: // general optimization
        prompt = `
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
    }

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
      // Return original data if parsing fails with an error message
      return NextResponse.json({
        ...resumeData,
        error: 'Failed to parse AI response properly. Your data was not modified.',
        _debugInfo: {
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          responsePreview: text.substring(0, 200) + '...' // First 200 chars for debugging
        }
      })
    }

  } catch (error) {
    console.error('Error optimizing resume:', error)
    return NextResponse.json(
      { error: 'Failed to optimize resume' },
      { status: 500 }
    )
  }
}