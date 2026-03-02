import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getCondensedResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)

    const { resumeData, jobData, optimizationMode = "general", improvementChecklist = [], missingSkills = [] } = await request.json()

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    },
      { apiVersion: 'v1beta' }
    );

    const resumeRules = getCondensedResumeKnowledge()
    let prompt = ""

    // Choose prompt based on optimization mode
    switch(optimizationMode) {
      case "checklist":
        prompt = `
        You are an expert resume optimizer who follows these resume writing rules:

        ${resumeRules}

        Given the following resume data, job requirements, and improvement checklist, optimize the resume to address all the checklist items while maintaining truthfulness.

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}

        Current Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Improvement Checklist to Complete:
        ${JSON.stringify(improvementChecklist, null, 2)}

        Please update the resume to address each item in the checklist by:
        1. Making specific changes that directly resolve each checklist item
        2. Rewriting bullets using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
        3. Replacing weak action verbs (Helped, Assisted, Worked on) with strong ones (Built, Reduced, Architected)
        4. Ensuring all changes are truthful and realistic based on the existing resume
        5. Following the resume rules above for formatting, capitalization, and structure

        Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
        Be thorough and make sure every checklist item is properly addressed.

        Return ONLY the JSON object without any additional text or formatting.
        `
        break;

      case "skills":
        prompt = `
        You are an expert resume optimizer who follows these resume writing rules:

        ${resumeRules}

        Given the following resume data, job requirements, and list of missing skills, optimize the resume to incorporate the missing skills in a truthful manner.

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
        4. Capitalize skill names correctly per the rules (e.g., JavaScript not javascript, PostgreSQL not postgres)
        5. ONLY include skills that can be reasonably inferred from existing resume content — don't fabricate experience

        Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
        Focus on naturally incorporating the skills rather than just listing them.

        Return ONLY the JSON object without any additional text or formatting.
        `
        break;

      default: // general optimization
        prompt = `
        You are an expert resume optimizer who follows these resume writing rules:

        ${resumeRules}

        Given the following resume data and job requirements, optimize the resume to better match the job description while maintaining truthfulness.

        Job Requirements:
        ${JSON.stringify(jobData, null, 2)}

        Current Resume:
        ${JSON.stringify(resumeData, null, 2)}

        Please optimize the resume by:
        1. Updating the profile summary to highlight relevant skills and experience
        2. Rewriting achievement bullets using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"
        3. Replacing weak action verbs (Helped, Assisted, Used, Worked on) with strong ones (Built, Reduced, Architected, Implemented)
        4. Reordering and emphasizing technical skills that match the job requirements
        5. Pushing for specific, quantified metrics in every bullet where possible
        6. Ensuring ATS-friendly formatting per the rules above

        Return the optimized resume data in the exact same JSON structure as the input, but with improved content.
        Focus on making the resume more relevant to the job while keeping all information truthful.

        Return ONLY the JSON object without any additional text or formatting.
        `
    }

    try {
      const result = await generateWithRetry(model, prompt)
      
      // Clean up the response to ensure it's valid JSON
      const cleanedText = result.replace(/```json\n?|\n?```/g, '').trim()
      
      try {
        const optimizedData = JSON.parse(cleanedText)
        return NextResponse.json(optimizedData)
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        console.error('Raw response:', result)
        // Return original data if parsing fails
        return NextResponse.json({
          ...resumeData,
          error: 'Failed to parse AI response. Your data was not modified.'
        })
      }
    } catch (generationError: any) {
      console.error('Model generation failed:', generationError.message)
      return NextResponse.json({
        ...resumeData,
        error: 'AI service temporarily unavailable. Your resume was not modified.'
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Error optimizing resume:', error)
    return NextResponse.json(
      { error: 'Failed to optimize resume' },
      { status: 500 }
    )
  }
}