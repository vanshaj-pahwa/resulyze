import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@clerk/nextjs'

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to attempt API call with retries
const generateWithRetry = async (model: any, prompt: string, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error: any) {
      lastError = error;
      
      // If it's a model overload error (503), retry
      if (error.message && error.message.includes("503") && error.message.includes("overloaded")) {
        console.log(`Attempt ${retries + 1} failed, retrying in ${initialDelay * (retries + 1)}ms...`);
        await delay(initialDelay * Math.pow(2, retries)); // Exponential backoff
        retries++;
      } else {
        // If it's another error, throw immediately
        throw error;
      }
    }
  }
  
  // If we've exhausted our retries, throw the last error
  throw lastError;
};

// Fallback questions when AI service is unavailable
const generateFallbackQuestions = (jobData: any, resumeData: any) => {
  const jobTitle = jobData?.jobTitle || 'the role';
  const company = jobData?.company || 'the company';
  
  return {
    questions: [
      {
        category: "Technical",
        question: `Tell me about your experience with the technologies required for ${jobTitle}.`,
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
      },
      {
        category: "Experience",
        question: `How has your previous experience prepared you for this ${jobTitle} role at ${company}?`,
        tips: [
          "Highlight relevant accomplishments",
          "Quantify achievements when possible",
          "Show how your skills transfer to the new role"
        ]
      },
      {
        category: "Problem Solving",
        question: "Tell me about a time when you had to solve a complex technical problem.",
        tips: [
          "Break down the problem and your thought process",
          "Explain the solution you implemented",
          "Share the outcome and what you learned"
        ]
      },
      {
        category: "Company",
        question: `What interests you about working at ${company}?`,
        tips: [
          "Research the company's mission and values",
          "Connect your career goals to the company",
          "Show enthusiasm and genuine interest"
        ]
      }
    ]
  };
};

export async function POST(request: NextRequest) {
  // Get the user's session and verify authentication
  const { userId } = auth();
  
  console.log('Interview questions API accessed, userId:', userId);
  
  if (!userId) {
    console.log('No userId found, returning 401');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

    try {
      const { jobData, resumeData, interviewRound, roundName } = await request.json();
      
      if (!jobData || !resumeData) {
        return NextResponse.json(
          { error: 'Job data and resume data are required' },
          { status: 400 }
        );
      }
      
      // Check if this is for a specific interview round - accept either interviewRound or roundName parameter
      const actualRoundName = interviewRound || roundName;
      const isRoundSpecific = !!actualRoundName;    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 3072,
      }
    });

    // Safely get values with fallbacks
    const jobTitle = jobData?.jobTitle || 'the position';
    const company = jobData?.company || 'the company';
    const requiredSkills = Array.isArray(jobData?.skills) ? jobData.skills.join(', ') : 'relevant skills';
    const qualifications = Array.isArray(jobData?.qualifications) ? jobData.qualifications.join(', ') : 'required qualifications';
    
    const candidateName = resumeData?.personalInfo?.name || 'the candidate';
    const currentRole = resumeData?.workExperience?.[0]?.title || resumeData?.workExperience?.[0]?.position || 'current role';
    const profile = resumeData?.profile || 'professional experience';
    const technicalSkills = Array.isArray(resumeData?.technicalSkills?.languages) 
      ? resumeData.technicalSkills.languages.join(', ') 
      : 'technical skills';
    
    // Safely construct work experience string
    let workExperience = 'professional background';
    if (Array.isArray(resumeData?.workExperience) && resumeData.workExperience.length > 0) {
      workExperience = resumeData.workExperience
        .map((exp: any) => `${exp.title || exp.position || 'role'} at ${exp.company || 'company'}`)
        .join(', ');
    }

    // Create appropriate prompt based on whether this is for a specific round
    let promptText = isRoundSpecific 
      ? `Generate interview questions for a candidate preparing for the "${actualRoundName}" interview round at ${company}.
        
Job Information:
- Job Title: ${jobTitle}
- Company: ${company}
- Required Skills: ${requiredSkills}
- Qualifications: ${qualifications}

Candidate Information:
- Name: ${candidateName}
- Current Role: ${currentRole}
- Experience: ${profile}
- Technical Skills: ${technicalSkills}
- Work Experience: ${workExperience}

Generate 5-7 interview questions specifically for the "${actualRoundName}" round.
Focus on the type of questions that would typically be asked in this specific interview stage.

For each question, provide:
- The question text
- Category (Technical, Behavioral, Experience, Company, Problem Solving)
- 2-3 tips for answering effectively`
      : `Generate interview questions for a candidate based on their resume and the job they're applying for.

Job Information:
- Job Title: ${jobTitle}
- Company: ${company}
- Required Skills: ${requiredSkills}
- Qualifications: ${qualifications}

Candidate Information:
- Name: ${candidateName}
- Current Role: ${currentRole}
- Experience: ${profile}
- Technical Skills: ${technicalSkills}
- Work Experience: ${workExperience}

Generate 8-10 interview questions across different categories:
1. Technical questions related to the required skills
2. Behavioral questions about teamwork, leadership, problem-solving
3. Experience-based questions about past projects and achievements
4. Company/role-specific questions
5. Problem-solving scenarios

For each question, provide:
- The question text
- Category (Technical, Behavioral, Experience, Company, Problem Solving)
- 2-3 tips for answering effectively`;

    // Add the JSON format request to the prompt
    promptText += `

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
Return ONLY the JSON object without any additional text or formatting.`;

    const prompt = promptText;

    try {
      // Try to generate questions with retries
      const responseText = await generateWithRetry(model, prompt);
      
      // Clean up the response to ensure it's valid JSON
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        const questionsData = JSON.parse(cleanedText);
        return NextResponse.json(questionsData);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Raw response:', responseText);
        
        // Use fallback questions if parsing fails
        console.log('Using fallback questions due to JSON parsing error');
        return NextResponse.json(generateFallbackQuestions(jobData, resumeData));
      }
    } catch (generationError) {
      console.error('All retries failed:', generationError);
      
      // Use fallback questions if generation fails
      console.log('Using fallback questions due to generation failure');
      return NextResponse.json(generateFallbackQuestions(jobData, resumeData));
    }
  } catch (error: unknown) {
    console.error('Error generating interview questions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to generate interview questions: ${errorMessage}` },
      { status: 500 }
    );
  }
}