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
        question: `Describe the difference between \`useState\` and \`useRef\` in React. Provide a specific use case for each.`,
        tips: [
          "Clearly articulate the re-rendering behavior associated with `useState` and the lack thereof with `useRef`",
          "Provide practical examples beyond the standard 'input focus' example for `useRef` (e.g., storing previous prop values, managing timers)",
          "Explain how these hooks fit into React's component lifecycle"
        ]
      },
      {
        category: "Technical",
        question: `Explain the benefits of using TypeScript over JavaScript in a large React project. How would you approach migrating an existing JavaScript codebase to TypeScript?`,
        tips: [
          "Highlight improved code maintainability, reduced runtime errors, and enhanced developer tooling",
          "Outline a gradual migration strategy, focusing on annotating key components and utility functions first",
          "Mention the use of `any` type strategically during the initial migration phase"
        ]
      },
      {
        category: "Problem Solving",
        question: `Imagine you are building a complex form in React with multiple interdependent fields. The form data needs to be persisted to a backend API. Describe how you would manage the form state and handle API interactions, considering potential error scenarios and performance optimizations.`,
        tips: [
          "Demonstrate your understanding of state management techniques, including controlled components, form libraries, and asynchronous data handling",
          "Address error handling strategies (e.g., displaying validation errors, retrying failed requests)",
          "Discuss performance optimization techniques like debouncing or throttling input changes"
        ]
      },
      {
        category: "Experience",
        question: `Describe a challenging bug you encountered while working with React and how you approached debugging and resolving it. What tools and techniques did you use?`,
        tips: [
          "Focus on a specific bug and provide a clear and concise explanation of the problem, the debugging process, and the solution",
          "Highlight your problem-solving skills, debugging tools (e.g., React DevTools, console.log, network analysis)",
          "Share lessons learned and how you'd prevent similar issues in the future"
        ]
      },
      {
        category: "Technical",
        question: `Explain the differences between various CSS-in-JS solutions (e.g., Styled Components, Emotion, Material UI's \`sx\` prop). When would you choose one over the others?`,
        tips: [
          "Demonstrate your understanding of the trade-offs between different CSS-in-JS approaches (e.g., bundle size, performance, ease of use)",
          "Relate your choice to specific project requirements, such as the need for server-side rendering, theming capabilities, or existing component libraries",
          "Discuss how these solutions compare to traditional CSS/SCSS approach in terms of maintainability"
        ]
      },
      {
        category: "Technical",
        question: `Describe your experience with testing React components. What types of tests have you written, and what are the benefits and drawbacks of each type?`,
        tips: [
          "Demonstrate a solid understanding of different testing strategies (unit, integration, end-to-end) and their purpose",
          "Provide specific examples of how you would test a React component using React Testing Library",
          "Discuss how testing fits into your development workflow and CI/CD pipeline"
        ]
      },
      {
        category: "Experience",
        question: `Describe a project where you used a specific state management library (Redux, MobX, Context API). What were the benefits and drawbacks of your choice?`,
        tips: [
          "Be honest about the challenges you faced and the lessons you learned",
          "Demonstrate your ability to evaluate different technologies based on project requirements",
          "Discuss how your choice affected team productivity, application performance, and codebase maintainability"
        ]
      }
    ]
  };
};

export async function POST(request: NextRequest) {
  try {
    // Get the user's session and verify authentication
    const { userId } = auth();
    
    console.log('Interview questions API accessed, userId:', userId);
    
    // Check for session cookie from Clerk
    const hasClerkSession = request.headers.get('cookie')?.includes('__session=');
    const hasAuthorization = request.headers.get('authorization');
    
    if (!userId && !hasClerkSession && !hasAuthorization) {
      console.log('No authentication found, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  } catch (authError) {
    console.error('Authentication error:', authError);
    // Continue processing - the route might still be accessible even with auth errors
  }

  try {
      const { jobData, resumeData, interviewRound, roundName, roundDetails } = await request.json();
      
      if (!jobData || !resumeData) {
        return NextResponse.json(
          { error: 'Job data and resume data are required' },
          { status: 400 }
        );
      }
      
      // Check if this is for a specific interview round - accept either interviewRound or roundName parameter
      const actualRoundName = interviewRound || roundName;
      const isRoundSpecific = !!actualRoundName || !!roundDetails;
      
      const model = genAI.getGenerativeModel({ 
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

${roundDetails ? `Interview Round Details:\n${roundDetails}\n\n` : ''}

Generate 6-8 highly specific, robust interview questions tailored to the ${actualRoundName ? `"${actualRoundName}"` : 'current'} interview round.
${roundDetails ? 'Focus precisely on the technical skills, concepts, and scenarios described in the round details.' : 'Focus on the type of questions that would typically be asked in this specific interview stage.'}
Include a mix of theoretical questions and practical coding or problem-solving scenarios that would be relevant to assess the candidate's abilities.

For each question, provide:
- The question text (make it detailed and specific, use markdown formatting with bold headers and bullet points for clarity)
- Category (Technical, Behavioral, Experience, Company, Problem Solving)
- 2-3 detailed tips for answering effectively that demonstrate deep understanding, using proper markdown formatting for clarity

FORMATTING INSTRUCTIONS:
1. Format question text with clear markdown structure
2. Use **bold text** for important concepts, keywords, and section headings
3. Use bullet points or numbered lists for multi-part questions
4. For questions about code, include well-formatted code examples with proper markdown syntax highlighting where appropriate`
      : `Generate comprehensive interview questions for a candidate based on their resume and the job they're applying for.

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

Generate 8-10 in-depth, challenging interview questions across different categories:
1. Technical questions - Focus on practical application of skills, framework-specific questions, and technical problem-solving
2. Behavioral questions - Complex scenarios about teamwork, leadership, conflict resolution, and decision-making
3. Experience-based questions - Detailed inquiries about specific projects, technologies, and measurable achievements
4. Company/role-specific questions - Questions that assess cultural fit and understanding of the company's domain
5. Problem-solving scenarios - Realistic technical challenges that might be encountered in this role

For each question, provide:
- The question text (make it detailed and specific, use markdown formatting with bold headers and bullet points for clarity)
- Category (Technical, Behavioral, Experience, Company, Problem Solving)
- 2-3 detailed tips for answering effectively, using proper markdown formatting for clarity

FORMATTING INSTRUCTIONS:
1. Format question text with clear markdown structure
2. Use **bold text** for important concepts, keywords, and section headings
3. Use bullet points or numbered lists for multi-part questions
4. For questions about code, include well-formatted code examples with proper markdown syntax highlighting where appropriate`;

    // Add the JSON format request to the prompt
    promptText += `

Return the response in this exact JSON format:
{
  "questions": [
    {
      "category": "Technical",
      "question": "Detailed question text here that demonstrates deep understanding of the technical concepts",
      "tips": [
        "Specific, actionable tip that shows mastery of the subject matter",
        "Detailed guidance on how to structure the answer effectively",
        "Strategic advice on what aspects to emphasize or avoid"
      ]
    }
  ]
}

Follow these requirements strictly:
1. Make questions extremely relevant to both the job requirements and the interview round context
2. Ensure questions are challenging but fair, focusing on practical application of skills
3. For technical questions, include specific frameworks, languages, or concepts mentioned in the round details
4. For problem-solving questions, create realistic scenarios that test critical thinking
5. For code/dsa/take-away/system design/architecture questions, ensure tips include guidance on providing actual code examples and implementation details
6. Include at least 2-3 detailed tips for each question that provide genuine value
7. Return ONLY the JSON object without any additional text, comments, or formatting`;

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