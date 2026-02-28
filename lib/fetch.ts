import { getApiKey } from '@/hooks/useApiKey'

export async function fetchWithKey(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = getApiKey()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (apiKey) {
    headers.set('x-gemini-api-key', apiKey)
  }

  return fetch(url, { ...options, headers })
}
