"use server";

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Extract file from form data
    const formData = await request.formData();
    const resumeFile = formData.get('resumeFile') as File | null;

    if (!resumeFile) {
      return NextResponse.json({
        error: "No file provided",
        suggestions: ["Upload a PDF or DOCX file"]
      }, { status: 400 });
    }

    // Check file type
    const fileType = resumeFile.name.split('.').pop()?.toLowerCase();
    if (!fileType || !['pdf', 'docx'].includes(fileType)) {
      return NextResponse.json({
        error: "Invalid file format",
        suggestions: ["Please upload a PDF or DOCX file"]
      }, { status: 400 });
    }

    // Check file size (limit to 5MB)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({
        error: "File too large",
        suggestions: ["File size should be less than 5MB", "Try compressing your file"]
      }, { status: 400 });
    }

    // Extract text from the file using Generative AI
    // Convert file to base64
    const fileBuffer = await resumeFile.arrayBuffer();
    const fileBase64 = Buffer.from(fileBuffer).toString('base64');
    const mimeType = fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.1, // Keep it factual
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    // First - extract text from the document
    const textExtractionResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: "Extract all text content from this document, preserving structure and formatting as much as possible." },
            {
              inlineData: {
                mimeType: mimeType,
                data: fileBase64
              }
            }
          ]
        }
      ]
    });

    const extractedText = textExtractionResult.response.text();

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({
        error: "Failed to extract text from document",
        suggestions: ["The document may be password protected", "The document may have restricted permissions", "The document may be corrupted"]
      }, { status: 400 });
    }

    // Now, parse the extracted text into structured data
    const parsingResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: `
I need you to parse this resume text into structured data. Extract all relevant information and format it as a valid JSON object following this structure:

{
  "personalInfo": {
    "name": string,
    "phone": string,
    "email": string,
    "linkedin": string,
    "github": string,
    "location": string
  },
  "profile": string,
  "technicalSkills": {
    "languages": string[],
    "frontend": string[],
    "backend": string[],
    "devTools": string[],
    "other": string[]
  },
  "workExperience": [
    {
      "position": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "current": boolean,
      "achievements": string[]
    }
  ],
  "education": {
    "degree": string,
    "institution": string,
    "location": string,
    "graduationDate": string,
    "gpa": string
  },
  "projects": [
    {
      "name": string,
      "technologies": string,
      "description": string,
      "achievements": string[],
      "githubUrl": string (optional)
    }
  ],
  "achievements": string[]
}

For technical skills, try to categorize them appropriately into languages, frontend, backend, devTools, and other.
For workExperience, extract bullet points as achievements.
For projects, extract any bullet points as achievements.
Always return valid JSON that can be parsed with JSON.parse(). Be as accurate as possible.

Here's the resume text to parse:

${extractedText}
            `}
          ]
        }
      ]
    });

    // Extract JSON from the response
    let resumeData;
    try {
      const responseText = parsingResult.response.text();
      
      // Find JSON in the response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : responseText;
      
      resumeData = JSON.parse(jsonString);
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({
        error: "Failed to parse resume data",
        warning: "We couldn't fully parse your resume. Try uploading a cleaner version or one with a simpler format.",
      }, { status: 200 }); // Still return 200 to display the warning in the UI
    }

    // Return the structured data
    return NextResponse.json(resumeData);

  } catch (error) {
    console.error("Resume parsing error:", error);
    
    // Return a friendly error message
    return NextResponse.json({
      error: "Failed to process resume",
      warning: "We encountered an error processing your resume. Please try again with a different file or format.",
    }, { status: 500 });
  }
}
