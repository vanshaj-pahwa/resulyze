import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

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

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash'
    })

    const prompt = `
    Analyze the following job description and extract key information. Return your response as a valid JSON object with the following structure:

    {
      "jobTitle": "extracted job title",
      "company": "company name if mentioned",
      "skills": ["skill1", "skill2", "skill3"],
      "qualifications": ["qualification1", "qualification2"],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "experience": "required experience level",
      "location": "job location if mentioned",
      "summary": "brief summary of the role"
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

    Return ONLY the JSON object, no additional text or formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
    
    try {
      const parsedData = JSON.parse(cleanedText)
      
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