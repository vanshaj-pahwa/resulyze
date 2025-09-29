import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { jobData, resumeData, contactName, contactEmail } =
      await request.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const greeting = contactName ? `Hi ${contactName},` : "Hi there,";

    const prompt = `
Write a professional referral message in FIRST PERSON that I (${
      resumeData.personalInfo.name
    }) can send to ${
      contactName || "someone in my network"
    } for a job opportunity.

Job Information:
- Job Title: ${jobData.jobTitle}
- Company: ${jobData.company}
- Key Requirements: ${jobData.skills?.join(", ")}

My Information:
- Name: ${resumeData.personalInfo.name}
- Current Role: ${resumeData.workExperience[0]?.title || "N/A"}
- Key Skills: ${resumeData.technicalSkills.languages?.join(", ") || "N/A"}
- Experience Summary: ${resumeData.profile || "N/A"}

Contact Information:
- Contact Name: ${contactName || "Not specified"}
- Contact Email: ${contactEmail || "Not provided"}

Requirements for the message:
1. Start with "${greeting}"
2. Introduce myself naturally (e.g., "My name is Vanshaj Pahwa, and I’m currently working as...")
3. Mention the specific role and company I’m interested in
4. Highlight relevant qualifications and experience
5. Politely ask for referrals or connections
6. Offer to provide more information if needed
7. Suitable for direct email or LinkedIn
8. Approx. 2-3 short paragraphs
9. Tone: Professional, friendly, confident, grateful, and respectful
10. Written in FIRST PERSON
11. Personalized if contact name is provided

Return only the referral message text without extra formatting or explanations.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const referralMessage = response.text();

    return NextResponse.json({ referralMessage });
  } catch (error) {
    console.error("Error generating referral message:", error);
    return NextResponse.json(
      { error: "Failed to generate referral message" },
      { status: 500 }
    );
  }
}
