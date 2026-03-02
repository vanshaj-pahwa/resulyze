import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { generateWithRetry } from '@/lib/ai/generate'

// Fallback company research when AI service is unavailable
const generateFallbackResearch = (companyName: string, jobTitle: string) => {
  return {
    companyOverview: `Unable to research ${companyName} at this time. Visit their official website or LinkedIn page for company details.`,
    confidenceLevel: 'low' as const,
    interviewProcess: [
      {
        roundName: "Technical Screening",
        description: "Initial technical assessment to evaluate your skills related to the position.",
        focus: "Problem-solving abilities and technical knowledge",
        isVerified: false,
        source: "typical for industry",
        tips: [
          "Review the job description carefully and match your experience to each requirement",
          `Practice problems relevant to ${jobTitle || 'the role'}`,
          "Be prepared to discuss your past projects with specific metrics and outcomes"
        ]
      },
      {
        roundName: "Behavioral Interview",
        description: "Assessment of your soft skills and cultural fit with the company.",
        focus: "Communication skills, teamwork, and past experiences",
        isVerified: false,
        source: "typical for industry",
        tips: [
          "Use the STAR method (Situation, Task, Action, Result) for every answer",
          "Prepare 5-6 stories that demonstrate leadership, conflict resolution, and impact",
          "Research the company culture and values before the interview"
        ]
      },
      {
        roundName: "Final Interview",
        description: "Discussion with hiring manager or team lead about the role and team fit.",
        focus: "Role-specific questions and alignment with team needs",
        isVerified: false,
        source: "typical for industry",
        tips: [
          "Prepare thoughtful questions about the team structure and current projects",
          "Demonstrate genuine interest in the company's mission and challenges",
          "Clarify expectations for the first 30/60/90 days in the role"
        ]
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { companyName, jobTitle, jobDescription } = await request.json()

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const prompt = `
You are helping a candidate prepare for interviews at "${companyName}" for a "${jobTitle || 'professional'}" role.

${jobDescription ? `Here is the actual job description:\n${jobDescription}\n` : ''}

CRITICAL RULES:
1. You do NOT have real-time access to ${companyName}'s actual interview process.
2. DO NOT present any specific claims about their interview process as verified fact.
3. If you know the company well (e.g., Google, Amazon, Meta, Microsoft), you may mention COMMONLY KNOWN aspects of their process, clearly labeled as "commonly reported."
4. For less-known companies, be explicit: "Specific interview process details for ${companyName} are not available."
5. ${jobDescription ? 'USE the job description above to infer likely interview focus areas. If the JD mentions "technical assessment," "panel interview," "take-home," etc., include those as likely rounds.' : 'Without a job description, provide only general guidance based on industry norms.'}

Return a JSON object:
{
  "companyOverview": "Brief factual description of the company. If uncertain about details, say so honestly.",
  "confidenceLevel": "high" | "medium" | "low",
  "interviewProcess": [
    {
      "roundName": "Name of likely round",
      "description": "What this round typically involves",
      "focus": "Skills and qualities evaluated",
      "isVerified": false,
      "source": "inferred from JD" | "commonly reported" | "typical for industry",
      "tips": ["tip1", "tip2", "tip3"]
    }
  ]
}

Include 3-5 interview rounds. ${jobDescription ? 'Derive rounds primarily from the job description — look for phrases about assessments, interviews, or evaluation stages.' : 'Provide rounds typical for a company of this type hiring for this role.'}

Return ONLY valid JSON without any markdown formatting, comments, or additional text.
`
    
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
        const fallbackResponse = generateFallbackResearch(companyName, jobTitle)
        return NextResponse.json(fallbackResponse);
      }
    } catch (generationError) {
      console.error('All retries failed:', generationError);
      
      // If generation fails after retries, use fallback
      console.log('Using fallback company research');
      const fallbackResponse = generateFallbackResearch(companyName, jobTitle)
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
