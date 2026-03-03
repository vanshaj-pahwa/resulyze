const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function generateWithRetry(
  model: any,
  prompt: string | any[],
  maxRetries = 3,
  initialDelay = 1000
): Promise<string> {
  let lastError: any
  let retries = 0

  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch (error: any) {
      lastError = error
      const status = error.status || error.statusCode || (error.message?.includes('503') ? 503 : 0)
      if ((status >= 500 && status < 600) || status === 429) {
        await delay(initialDelay * Math.pow(2, retries))
        retries++
      } else {
        throw error
      }
    }
  }

  throw lastError
}
