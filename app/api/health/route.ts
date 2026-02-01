import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  }
}

export async function HEAD() {
  return new Response(null, { 
    status: 200,
    headers: {
      'X-Health-Status': 'ok',
      'X-Health-Check-Time': new Date().toISOString()
    }
  })
}