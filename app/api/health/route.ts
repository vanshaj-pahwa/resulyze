import { NextResponse } from 'next/server'
import { isMongoAvailable, connectToDB } from '@/lib/mongodb'

export async function GET() {
  try {
    // First try to connect explicitly to ensure connection is established
    await connectToDB();
    
    // Then check if MongoDB is available
    const mongoAvailable = await isMongoAvailable()
    
    console.log(`Health check: MongoDB is ${mongoAvailable ? 'available' : 'unavailable'}`);
    
    if (!mongoAvailable) {
      // If MongoDB is not available after explicit connection attempt, return error
      return NextResponse.json(
        {
          status: 'error',
          mongodb: false,
          error: 'MongoDB connection check failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json({
      status: 'ok',
      mongodb: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        mongodb: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    )
  }
}

export async function HEAD() {
  try {
    // First try to connect explicitly to ensure connection is established
    await connectToDB();
    
    // Then check if MongoDB is available
    const mongoAvailable = await isMongoAvailable()
    
    console.log(`Health check (HEAD): MongoDB is ${mongoAvailable ? 'available' : 'unavailable'}`);
    
    return new Response(null, { 
      status: mongoAvailable ? 200 : 503,
      headers: {
        'X-MongoDB-Status': mongoAvailable ? 'connected' : 'disconnected',
        'X-Health-Check-Time': new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Health check (HEAD) error:', error);
    return new Response(null, { 
      status: 503,
      headers: {
        'X-MongoDB-Status': 'error',
        'X-Health-Check-Time': new Date().toISOString()
      }
    })
  }
}