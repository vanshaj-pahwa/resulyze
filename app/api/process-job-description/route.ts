import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { deduplicateSkills, normalizeSkill } from '@/lib/ai/skill-taxonomy'

// Function to fetch job description from URL
async function fetchJobDescriptionFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }
    
    const contentType = response.headers.get('Content-Type') || ''
    
    // Handle HTML content
    if (contentType.includes('text/html')) {
      const html = await response.text()
      
      // Simple HTML cleaning - extract text from the body
      // This is a basic approach - a more sophisticated HTML parser would be better for production
      const bodyContent = html.replace(/<head>[\s\S]*?<\/head>/, '')
                             .replace(/<script>[\s\S]*?<\/script>/g, '')
                             .replace(/<style>[\s\S]*?<\/style>/g, '')
                             .replace(/<[^>]*>/g, ' ')
                             .replace(/\s+/g, ' ')
                             .trim()
      
      return bodyContent
    }
    
    // For plain text or other formats
    return await response.text()
    
  } catch (error) {
    console.error('Error fetching job description from URL:', error)
    throw new Error('Failed to fetch job description from the provided URL')
  }
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { jobDescription, jobDescriptionUrl } = await request.json()

    // Handle job description from URL if provided
    let jobDescriptionText = jobDescription
    if (jobDescriptionUrl && !jobDescription) {
      try {
        jobDescriptionText = await fetchJobDescriptionFromUrl(jobDescriptionUrl)
      } catch (error) {
        console.error('Error fetching from URL:', error)
        return NextResponse.json(
          { error: 'Failed to fetch job description from the provided URL' },
          { status: 400 }
        )
      }
    }

    if (!jobDescriptionText || jobDescriptionText.trim() === '') {
      return NextResponse.json(
        { error: 'No job description provided' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel(
      { model: 'gemini-3-flash-preview' },
      { apiVersion: 'v1beta' }
    )

    const prompt = `
    Analyze the following job description and extract key information. Return your response as a valid JSON object with the following structure:

    {
      "jobTitle": "extracted job title",
      "company": "company name if mentioned",
      "seniorityLevel": "intern|junior|mid|senior|staff|principal|lead|manager|director",
      "skills": ["skill1", "skill2", "skill3"],
      "skillPriorities": [
        { "skill": "skill1", "priority": "required", "mentions": 3 },
        { "skill": "skill2", "priority": "preferred", "mentions": 1 },
        { "skill": "skill3", "priority": "bonus", "mentions": 1 }
      ],
      "qualifications": ["qualification1", "qualification2"],
      "responsibilities": ["responsibility1", "responsibility2"],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "experience": "required experience level",
      "location": "job location if mentioned",
      "summary": "brief summary of the role",
      "cultureSignals": ["signal1", "signal2"],
      "redFlags": ["red flag1"]
    }

    Job Description:
    ${jobDescriptionText}

    Focus on:
    - Technical skills and technologies mentioned
    - Required qualifications and certifications
    - Important keywords that should be included in a resume
    - Years of experience required (be specific and include the exact requirement like "3+ years of experience")
    - Job location and work arrangement (be specific about office location, remote/hybrid status, etc.)
    - Soft skills mentioned
    - Seniority level: infer from title, years required, and responsibility scope
    - Skill priorities: classify each skill as "required" (must-have, mentioned multiple times), "preferred" (nice-to-have), or "bonus" (mentioned once, not emphasized). Count how many times each skill is mentioned.
    - Responsibilities: extract key job responsibilities
    - Culture signals: phrases like "fast-paced", "collaborative", "autonomous", "startup mentality", etc.
    - Red flags: unrealistic requirements (e.g. 10+ years for a junior role), too many required skills (>15), vague descriptions, unpaid/below-market signals

    Return ONLY the JSON object, no additional text or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()

    try {
      const parsedData = JSON.parse(cleanedText)

      // Normalize and deduplicate skills using taxonomy
      if (parsedData.skills) {
        parsedData.skills = deduplicateSkills(parsedData.skills)
      }
      if (parsedData.skillPriorities) {
        for (const sp of parsedData.skillPriorities) {
          sp.skill = normalizeSkill(sp.skill)
        }
      }

      // If the job description was fetched from a URL, include it in the response
      if (jobDescriptionUrl && !jobDescription) {
        parsedData.jobDescription = jobDescriptionText
      }

      return NextResponse.json(parsedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', text)
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        jobTitle: "Unable to extract",
        company: "Unable to extract",
        skills: [],
        qualifications: [],
        keywords: [],
        experience: "Unable to extract",
        location: "Unable to extract",
        summary: "Unable to process job description"
      })
    }

  } catch (error) {
    console.error('Error processing job description:', error)
    return NextResponse.json(
      { error: 'Failed to process job description' },
      { status: 500 }
    )
  }
}