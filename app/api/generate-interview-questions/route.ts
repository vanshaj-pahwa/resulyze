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
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  try {
    const { jobData, resumeData } = await request.json()

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3072,
      }
    })

    const prompt = `
    Generate interview questions for a candidate based on their resume and the job they're applying for.

    Job Information:
    - Job Title: ${jobData.jobTitle}
    - Company: ${jobData.company}
    - Required Skills: ${jobData.skills?.join(', ')}
    - Qualifications: ${jobData.qualifications?.join(', ')}

    Candidate Information:
    - Name: ${resumeData.personalInfo.name}
    - Current Role: ${resumeData.workExperience[0]?.title}
    - Experience: ${resumeData.profile}
    - Technical Skills: ${resumeData.technicalSkills.languages?.join(', ')}
    - Work Experience: ${resumeData.workExperience.map((exp: any) => `${exp.title} at ${exp.company}`).join(', ')}

    Generate 8-10 interview questions across different categories:
    1. Technical questions related to the required skills
    2. Behavioral questions about teamwork, leadership, problem-solving
    3. Experience-based questions about past projects and achievements
    4. Company/role-specific questions
    5. Problem-solving scenarios

    For each question, provide:
    - The question text
    - Category (Technical, Behavioral, Experience, Company, Problem Solving)
    - 2-3 tips for answering effectively

    Return the response in JSON format:
    {
      "questions": [
        {
          "category": "Technical",
          "question": "Question text here",
          "tips": ["Tip 1", "Tip 2", "Tip 3"]
        }
      ]
    }

    Make sure questions are relevant to both the job requirements and the candidate's background.
    Return ONLY the JSON object without any additional text or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const questionsData = JSON.parse(cleanedText)
      return NextResponse.json(questionsData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        questions: [
          {
            category: "Technical",
            question: "Tell me about your experience with the technologies mentioned in the job description.",
            tips: [
              "Provide specific examples from your past projects",
              "Mention measurable outcomes when possible",
              "Connect your experience to the job requirements"
            ]
          },
          {
            category: "Behavioral",
            question: "Describe a challenging project you worked on and how you overcame obstacles.",
            tips: [
              "Use the STAR method (Situation, Task, Action, Result)",
              "Focus on your problem-solving approach",
              "Highlight what you learned from the experience"
            ]
          }
        ]
      })
    }

  } catch (error) {
    console.error('Error generating interview questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    )
  }
}