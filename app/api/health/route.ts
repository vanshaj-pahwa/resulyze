import { NextResponse } from 'next/server'
import { isMongoAvailable } from '@/lib/mongodb'

export async function GET() {
  try {
    const mongoAvailable = await isMongoAvailable()
    
    return NextResponse.json({
      status: 'ok',
      mongodb: mongoAvailable,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        mongodb: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

export async function HEAD() {
  try {
    const mongoAvailable = await isMongoAvailable()
    return new Response(null, { 
      status: mongoAvailable ? 200 : 503,
      headers: {
        'X-MongoDB-Status': mongoAvailable ? 'connected' : 'disconnected'
      }
    })
  } catch (error) {
    return new Response(null, { status: 503 })
  }
}