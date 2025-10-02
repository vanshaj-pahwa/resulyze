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

// Fallback answer generator when AI service is unavailable
const generateFallbackAnswer = (question: string, category: string, tips: string[]) => {
  const tipsList = Array.isArray(tips) ? tips.join("\n- ") : "Follow the STAR method";
  
  let fallbackAnswer = `I'd approach this ${category.toLowerCase()} question about "${question}" by following these key principles:\n\n`;
  
  // Add tips-based content
  fallbackAnswer += `The most important strategies for this question are:\n- ${tipsList}\n\n`;
  
  if (category === "Technical") {
    fallbackAnswer += "I would structure my answer by first explaining my understanding of the technical concept, then sharing a specific example from my experience, and finally connecting it to how I'd apply this skill in the role.\n\n";
  } else if (category === "Behavioral") {
    fallbackAnswer += "For this behavioral question, I'd use the STAR method: describing the Situation, the Task required, the Actions I took, and the Results achieved.\n\n";
  } else if (category === "Experience") {
    fallbackAnswer += "I'd highlight relevant past experiences, quantify my achievements where possible, and connect my experience directly to the requirements of this position.\n\n";
  }
  
  fallbackAnswer += "Finally, I'd make sure to be concise while still being comprehensive, maintain a positive tone, and focus on relevant skills and experiences that match the job requirements.";
  
  return fallbackAnswer;
};

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
    const { question, category, tips, resumeData, jobData } = await request.json();
    
    // Validate required inputs
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // Try using 'gemini-1.5-flash' as fallback if needed
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

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
    `;
    
    try {
      // Try to generate answer with retries
      const answer = await generateWithRetry(model, prompt);
      return NextResponse.json({ answer });
    } catch (generationError) {
      console.error('All retries failed:', generationError);
      
      // If generation fails after retries, use fallback
      console.log('Using fallback answer generator');
      const fallbackAnswer = generateFallbackAnswer(question, category, tips);
      
      // Add a note that this is a fallback response
      const answer = `[Note: Generated using fallback system due to AI service limitations]\n\n${fallbackAnswer}`;
      return NextResponse.json({ answer });
    }
  } catch (error: unknown) {
    console.error('Error generating interview answer:', error);
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to generate answer: ${errorMessage}` },
      { status: 500 }
    );
  }
}
