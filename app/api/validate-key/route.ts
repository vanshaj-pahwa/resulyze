import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ valid: false, error: 'API key is required' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    await model.generateContent('Say "ok"')

    return NextResponse.json({ valid: true })
  } catch (error: any) {
    const message = error?.message || 'Invalid API key'
    return NextResponse.json({ valid: false, error: message })
  }
}
