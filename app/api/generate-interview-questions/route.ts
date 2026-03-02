import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { generateWithRetry } from '@/lib/ai/generate'

// Role-adaptive fallback questions when AI service is unavailable
const generateFallbackQuestions = (jobData: any, resumeData: any) => {
  const jobTitle = jobData?.jobTitle || 'the role'
  const company = jobData?.company || 'the company'
  const skills = Array.isArray(jobData?.skills) ? jobData.skills : []
  const topSkills = skills.slice(0, 3)

  return {
    questions: [
      {
        category: "Technical",
        question: `Walk me through how you would design a system or solution using **${topSkills[0] || 'the core technologies listed in the job description'}** for a project relevant to ${jobTitle}. What architecture decisions would you make and why?`,
        tips: [
          "Describe the system at a high level before diving into implementation details",
          "Explain your technology choices and the trade-offs you considered",
          "Mention scalability, maintainability, and testing strategies"
        ]
      },
      {
        category: "Technical",
        question: `Describe a challenging technical problem you solved in a previous role that is relevant to **${jobTitle}**. What was the problem, how did you approach it, and what was the outcome?`,
        tips: [
          "Use the STAR method: Situation, Task, Action, Result",
          "Include specific metrics or outcomes where possible (e.g., performance improvements, users impacted)",
          "Highlight the technical skills most relevant to the target role"
        ]
      },
      {
        category: "Behavioral",
        question: `Tell me about a time you disagreed with a teammate or manager on a technical approach. How did you handle it and what was the result?`,
        tips: [
          "Show that you can advocate for your position respectfully with data and reasoning",
          "Demonstrate willingness to compromise when presented with better arguments",
          "Focus on the outcome and what you learned from the experience"
        ]
      },
      {
        category: "Problem Solving",
        question: `You are given a tight deadline to deliver a feature for **${jobTitle}** at **${company}**. The requirements are ambiguous and the codebase is unfamiliar. Walk me through your approach.`,
        tips: [
          "Start by clarifying requirements — describe the right questions to ask stakeholders",
          "Explain how you would ramp up on an unfamiliar codebase quickly",
          "Discuss how you would communicate progress and risks to the team"
        ]
      },
      {
        category: "Experience",
        question: `What is the most impactful project you have worked on, and how does that experience prepare you for **${jobTitle}** at **${company}**?`,
        tips: [
          "Pick a project that demonstrates skills directly relevant to the target role",
          "Quantify impact: users served, performance improvements, revenue affected, time saved",
          "Connect specific skills and lessons learned to the job requirements"
        ]
      },
      {
        category: "Technical",
        question: topSkills.length >= 2
          ? `Compare and contrast **${topSkills[0]}** and **${topSkills[1]}**. When would you choose one over the other, and what trade-offs would you consider?`
          : `What are the most important technical trends in your field right now, and how do you stay current with evolving technologies?`,
        tips: [
          "Demonstrate depth of understanding beyond surface-level knowledge",
          "Provide concrete examples from your own experience using these technologies",
          "Discuss trade-offs rather than declaring one technology universally better"
        ]
      },
      {
        category: "Company",
        question: `Why are you interested in **${company}**, and what specifically about the **${jobTitle}** role excites you?`,
        tips: [
          "Reference specific aspects of the company's product, mission, or technical challenges",
          "Connect your career goals to the opportunities this role provides",
          "Show genuine enthusiasm with specifics — avoid generic statements"
        ]
      }
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
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
      
      const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 3072,
        },
      },
      { apiVersion: 'v1beta' }
    )

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