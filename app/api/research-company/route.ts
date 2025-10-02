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

// Fallback company research when AI service is unavailable
const generateFallbackResearch = (companyName: string) => {
  return {
    companyOverview: `${companyName} is a company operating in its industry. To learn more about their specific details, visit their official website or check their LinkedIn page.`,
    interviewProcess: [
      {
        roundName: "Technical Screening",
        description: "Initial technical assessment to evaluate your skills related to the position.",
        focus: "Problem-solving abilities and technical knowledge",
        tips: [
          "Review the job description carefully",
          "Practice coding problems if applying for a technical role",
          "Be prepared to discuss your past projects"
        ]
      },
      {
        roundName: "Behavioral Interview",
        description: "Assessment of your soft skills and cultural fit with the company.",
        focus: "Communication skills, teamwork, and past experiences",
        tips: [
          "Use the STAR method (Situation, Task, Action, Result)",
          "Prepare examples from your past experience",
          "Research the company culture"
        ]
      },
      {
        roundName: "Final Interview",
        description: "Discussion with hiring manager or team lead about the role.",
        focus: "Role-specific questions and alignment with team needs",
        tips: [
          "Prepare questions about the team and project",
          "Demonstrate your interest in the company",
          "Clarify any aspects of the role you're unsure about"
        ]
      }
    ]
  };
};

export async function POST(request: NextRequest) {
  // Get the user's session and verify authentication
  const { userId } = auth();
  
  console.log('Company research API accessed, userId:', userId);
  
  if (!userId) {
    console.log('No userId found, returning 401');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { companyName, jobTitle } = await request.json();
    
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.5,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });
    
    const prompt = `
    Research the company "${companyName}" and provide information about their interview process for a "${jobTitle || 'professional'}" role.
    
    Please return your response in the following JSON format:
    
    {
      "companyOverview": "Brief overview of the company, their industry, mission, and culture",
      "interviewProcess": [
        {
          "roundName": "Name of the interview round (e.g., 'Technical Screening')",
          "description": "Description of what happens in this round",
          "focus": "What the company evaluates in this round",
          "tips": [
            "Preparation tip 1",
            "Preparation tip 2",
            "Preparation tip 3"
          ]
        }
      ]
    }
    
    Include 3-5 interview rounds based on typical processes for this company. If specific information isn't available for ${companyName}, provide a general interview process for similar companies in their industry for the role of ${jobTitle || 'this type of position'}.
    
    Return ONLY valid JSON without any markdown formatting, comments, or additional text.
    `;
    
    try {
      // Try to generate research with retries
      const jsonResponse = await generateWithRetry(model, prompt);
      
      try {
        // Try to parse the JSON response
        const parsedResponse = JSON.parse(jsonResponse.replace(/```json\n?|\n?```/g, '').trim());
        return NextResponse.json(parsedResponse);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        console.error('Raw response:', jsonResponse);
        
        // If parsing fails, use the fallback
        const fallbackResponse = generateFallbackResearch(companyName);
        return NextResponse.json(fallbackResponse);
      }
    } catch (generationError) {
      console.error('All retries failed:', generationError);
      
      // If generation fails after retries, use fallback
      console.log('Using fallback company research');
      const fallbackResponse = generateFallbackResearch(companyName);
      return NextResponse.json(fallbackResponse);
    }
  } catch (error: unknown) {
    console.error('Error researching company:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to research company: ${errorMessage}` },
      { status: 500 }
    );
  }
}
