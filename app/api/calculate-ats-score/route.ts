import { NextRequest, NextResponse } from 'next/server'
import { calculateATSScore } from '@/lib/ats-calculator'

export async function POST(request: NextRequest) {
    try {
        const { resumeData, jobData } = await request.json()

        // Validate input data
        if (!resumeData) {
            return NextResponse.json(
                { error: 'Resume data is required' },
                { status: 400 }
            )
        }

        // Use our enhanced rule-based ATS calculator
        const atsScore = calculateATSScore(resumeData, jobData)

        return NextResponse.json(atsScore)

    } catch (error) {
        console.error('Error calculating ATS score:', error)
        return NextResponse.json(
            { 
                error: 'Failed to calculate ATS score',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}