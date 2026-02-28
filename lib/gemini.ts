import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest } from 'next/server'

export function getGeminiClient(request: NextRequest): GoogleGenerativeAI {
  const apiKey = request.headers.get('x-gemini-api-key')
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Please provide your API key in settings.')
  }
  return new GoogleGenerativeAI(apiKey)
}
