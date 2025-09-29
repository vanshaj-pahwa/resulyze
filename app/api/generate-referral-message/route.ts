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
Write a short, professional referral request in FIRST PERSON that I (${resumeData.personalInfo.name}) can send to ${contactName || "a contact"} about the ${jobData.jobTitle} role at ${jobData.company}.

Key points to weave in naturally:
- Who I am: ${resumeData.personalInfo.name}, ${resumeData.workExperience[0]?.title || "recent graduate"}.
- The exact role + company I’m targeting.
- 2–3 of my strongest, most relevant skills or achievements (pick from: ${resumeData.technicalSkills.languages?.slice(0, 3).join(", ")}, ${resumeData.profile?.slice(0, 150)}…).
- A polite, direct ask: “Would you be open to referring me?” or “Could you forward my résumé to the hiring team?”
- Offer to make it easy: attach résumé, job link, or quick blurb they can forward.
- Thank them for their time; keep it to ~120–150 words total.
- Tone: friendly, confident, grateful.
- Start with “${greeting}” and end with “Best regards, ${resumeData.personalInfo.name}”.
- Do NOT mention how long the contact has been at the company or any generic admiration lines.
- Do NOT include subject lines, placeholders, or notes—only the message body.
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
