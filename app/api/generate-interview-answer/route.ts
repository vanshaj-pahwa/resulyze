import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@clerk/nextjs'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request: NextRequest) {
  // Get the user's session and verify authentication
  const { userId } = auth();
  
  // Debug log to check if userId is being received
  console.log('API route accessed, userId:', userId);
  
  if (!userId) {
    console.log('No userId found, returning 401');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { question, category, tips, resumeData, jobData } = await request.json()

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    })

    // Ensure we handle all possible null/undefined values safely
    const skillsArray = resumeData?.technicalSkills?.languages || [];
    const requiredSkillsArray = jobData?.skills || [];
    
    const prompt = `
    Generate a compelling answer for this interview question based on the candidate's background and the tips provided.

    Question (${category || 'General'}): "${question}"
    
    Tips for answering:
    ${Array.isArray(tips) ? tips.map((tip: string) => `- ${tip}`).join('\n') : '- Provide specific examples\n- Be concise'}

    Candidate Information:
    - Name: ${resumeData?.personalInfo?.name || 'N/A'}
    - Current Role: ${resumeData?.workExperience?.[0]?.position || resumeData?.workExperience?.[0]?.title || 'N/A'}
    - Experience Summary: ${resumeData?.profile || 'N/A'}
    - Technical Skills: ${Array.isArray(skillsArray) ? skillsArray.join(', ') : 'N/A'}
    
    Job Information:
    - Job Title: ${jobData?.jobTitle || 'N/A'}
    - Company: ${jobData?.company || 'N/A'}
    - Required Skills: ${Array.isArray(requiredSkillsArray) ? requiredSkillsArray.join(', ') : 'N/A'}

    Format the answer in first person as if the candidate is speaking.
    For Technical questions: Include specific examples from the candidate's experience and relate to required job skills.
    For Behavioral questions: Use the STAR method (Situation, Task, Action, Result).
    For Experience questions: Highlight relevant accomplishments and quantify achievements when possible.
    
    The answer should be professional, confident, and directly address the question while incorporating the tips provided.
    Keep the answer concise but comprehensive, around 3-5 paragraphs.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const answer = response.text().trim()

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('Error generating interview answer:', error)
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to generate answer: ${errorMessage}` },
      { status: 500 }
    )
  }
}
