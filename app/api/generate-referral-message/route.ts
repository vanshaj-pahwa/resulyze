import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request);
    const { jobData, resumeData, contactName } = await request.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const resumeContent = resumeData.latexSource || JSON.stringify(resumeData);
    const greeting = contactName ? "Hi " + contactName + "," : "Hi there,";
    const role = jobData.jobTitle || "target";
    const company = jobData.company || "the company";

    const prompt = [
      "Write a short, professional referral request in FIRST PERSON based on the resume and job details below.",
      "",
      "Job Details:",
      "- Role: " + role + " at " + company,
      "",
      "My Resume:",
      resumeContent,
      "",
      "Instructions:",
      "- Extract my name, current role, and key skills from the resume above.",
      "- Write the message to " + (contactName || "a contact") + " about the " + role + " role at " + company + ".",
      "- Include 2-3 of my strongest, most relevant skills or achievements from the resume.",
      '- A polite, direct ask: "Would you be open to referring me?" or "Could you forward my resume to the hiring team?"',
      "- Offer to make it easy: attach resume, job link, or quick blurb they can forward.",
      "- Thank them for their time; keep it to ~120-150 words total.",
      "- Tone: friendly, confident, grateful.",
      '- Start with "' + greeting + '" and end with "Best regards, [my name from the resume]".',
      "- Do NOT mention how long the contact has been at the company or any generic admiration lines.",
      "- Do NOT include subject lines, placeholders, or notes - only the message body.",
    ].join("\n");

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
