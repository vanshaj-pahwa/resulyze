import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

const DEFAULT_USER_ID = 'default-user'

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
      
      // Log the actual error for debugging
      console.log(`Attempt ${retries + 1} failed:`, error.message);
      
      // Retry on server errors (5xx) or rate limiting (429)
      if ((error.status >= 500 && error.status < 600) || error.status === 429) {
        console.log(`Retrying in ${initialDelay * Math.pow(2, retries)}ms...`);
        await delay(initialDelay * Math.pow(2, retries)); // Exponential backoff
        retries++;
      } else {
        // For other errors (4xx, model not found, auth errors), throw immediately
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
  
  let fallbackAnswer = `## Approach to "${question}"\n\n`;
  fallbackAnswer += `I'd approach this **${category.toLowerCase()}** question by following these key principles:\n\n`;
  
  // Add tips-based content
  fallbackAnswer += `### Key Strategies\n\n`;
  fallbackAnswer += `The most important strategies for this question are:\n- ${tipsList}\n\n`;
  
  if (category === "Technical") {
    fallbackAnswer += "### My Technical Approach\n\n";
    fallbackAnswer += "I would structure my answer by:\n\n";
    fallbackAnswer += "1. **Conceptual understanding** - First explaining my understanding of the technical concept\n";
    fallbackAnswer += "2. **Practical experience** - Sharing a specific example from my experience\n";
    fallbackAnswer += "3. **Application** - Connecting it to how I'd apply this skill in the role\n\n";
    
    // Add a simple code example if it's a technical question
    if (question.toLowerCase().includes('javascript') || question.toLowerCase().includes('js')) {
      fallbackAnswer += "For example, if implementing a solution:\n\n";
      fallbackAnswer += "```javascript\n// A simple implementation example\nfunction example() {\n  const result = someLogic();\n  return result;\n}\n```\n\n";
    }
  } else if (category === "Behavioral") {
    fallbackAnswer += "### STAR Method Approach\n\n";
    fallbackAnswer += "For this behavioral question, I'd use the STAR method:\n\n";
    fallbackAnswer += "* **Situation**: Describe the context and background\n";
    fallbackAnswer += "* **Task**: Explain what was required of me\n";
    fallbackAnswer += "* **Action**: Detail the specific steps I took\n";
    fallbackAnswer += "* **Result**: Share the outcomes and what I learned\n\n";
  } else if (category === "Experience") {
    fallbackAnswer += "### Highlighting Relevant Experience\n\n";
    fallbackAnswer += "I would focus on:\n\n";
    fallbackAnswer += "* **Relevant accomplishments** from my past roles\n";
    fallbackAnswer += "* **Quantified achievements** with metrics where possible (e.g., improved efficiency by 20%)\n";
    fallbackAnswer += "* **Direct connections** between my experience and this position's requirements\n\n";
  }
  
  fallbackAnswer += "### Final Considerations\n\n";
  fallbackAnswer += "I'd make sure to:\n\n";
  fallbackAnswer += "* Be **concise yet comprehensive**\n";
  fallbackAnswer += "* Maintain a **positive tone**\n";
  fallbackAnswer += "* Focus on **relevant skills and experiences** that match the job requirements";
  
  return fallbackAnswer;
};

export async function POST(request: NextRequest) {

  try {
    const genAI = getGeminiClient(request)
    const { question, category, tips, resumeData, jobData } = await request.json();
    
    // Validate required inputs
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        // Increase token limit for system design questions that need more detailed code examples
        maxOutputTokens: category === 'Problem Solving' || 
                        category === 'System Design' || 
                        (question && question.toLowerCase().includes('system design')) || 
                        (question && question.toLowerCase().includes('architecture')) ? 
                        4096 : 1024,
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
    
    OUTPUT FORMATTING REQUIREMENTS:
    1. Use proper Markdown formatting for readability
    2. Use **bold text** for important points and key concepts
    3. Use *italics* for emphasis
    4. Use ordered lists (1., 2., 3.) for sequential steps or processes
    5. Use unordered lists (•) for related points and examples
    6. For technical questions with code, place code snippets in proper markdown code blocks with syntax highlighting: \`\`\`language\ncode here\n\`\`\`
    7. Use clear paragraph breaks between different parts of the answer
    8. Use headings (### or ####) to organize longer answers with clear sections
    9. If referring to multiple points, use numbered lists
    10. If mentioning the STAR method, clearly label each section: **Situation**, **Task**, **Action**, **Result**

    CONTENT REQUIREMENTS:
    - For Technical questions: Include specific examples from the candidate's experience and relate to required job skills AND if the question invites code, include formatted code snippets that illustrate the point.
    - If the category is Technical/Problem-Solving/DSA and the question invites implementation, include a **brief, runnable code or config snippet** that illustrates the key idea.
    - For Behavioral questions: Use the STAR method (Situation, Task, Action, Result).
    - For Experience questions: Highlight relevant accomplishments and quantify achievements when possible.
    
    The answer should be professional, confident, and directly address the question while incorporating the tips provided.
    Keep the answer concise but comprehensive, around 3-5 paragraphs.
    `;
    
    try {
      // Try to generate answer with retries
      const answer = await generateWithRetry(model, prompt);
      return NextResponse.json({ answer });
    } catch (generationError: any) {
      console.error('gemini-3-flash-preview failed:', generationError.message);
      
      // Try fallback to gemini-2.0-flash if the preview model fails
      try {
        console.log('Trying gemini-2.0-flash as fallback...');
        const fallbackModel = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });
        
        const answer = await generateWithRetry(fallbackModel, prompt);
        return NextResponse.json({ answer });
      } catch (fallbackError: any) {
        console.error('gemini-2.0-flash also failed:', fallbackError.message);
        
        // If both models fail, use local fallback generator
        console.log('Using local fallback answer generator');
        const fallbackAnswer = generateFallbackAnswer(question, category, tips);
        return NextResponse.json({ answer: fallbackAnswer });
      }
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
