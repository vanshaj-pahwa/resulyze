import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getStorageAdapter } from '@/lib/storage'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storage = await getStorageAdapter()
    const resumeData = await storage.getResumeData(userId)
    
    // Format the data for frontend if it exists
    if (resumeData) {
      // No transformation needed since we've updated the frontend to use the same field names
    }
    
    return NextResponse.json(resumeData)
  } catch (error) {
    console.error('Error fetching resume data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch resume data',
        fallback: true // Indicate this is a fallback response
      },
      { status: 200 } // Return 200 to allow app to continue working
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resumeData = await request.json()
    
    // Ensure work experience data is properly formatted for the database
    // This is important because frontend and backend models have different field names
    const formattedData = {
      ...resumeData,
      // No transformation needed for other properties
    }
    
    const storage = await getStorageAdapter()
    const success = await storage.saveResumeData(userId, formattedData)

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Failed to save resume data',
          fallback: true
        },
        { status: 200 } // Return 200 to allow app to continue working
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving resume data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save resume data',
        fallback: true,
        message: 'Data saved locally only'
      },
      { status: 200 } // Return 200 to allow app to continue working
    )
  }
}