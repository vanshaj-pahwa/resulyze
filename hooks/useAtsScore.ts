'use client'

import { useState, useEffect, useRef } from 'react'
import { fetchWithKey } from '@/lib/fetch'
import type { AtsAnalysis } from '@/lib/latex/ats-analyzer'

export interface UseAtsScoreResult {
  analysis: AtsAnalysis | null
  isAnalyzing: boolean
  error: string | null
}

/** Convert a blob: URL to a base64 string (chunked to avoid stack overflow on large PDFs). */
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192) as unknown as number[])
  }
  return btoa(binary)
}

/**
 * Triggers ATS analysis whenever a new compiled PDF is available.
 * Analyzes the actual PDF — exactly what ATS bots see — rather than LaTeX source.
 */
export function useAtsScore(pdfBlobUrl: string | null, jobKeywords: string[] = []): UseAtsScoreResult {
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController>()
  const keywordsRef = useRef(jobKeywords)
  keywordsRef.current = jobKeywords

  // Stringify dep so new array refs with same content don't re-trigger
  const keywordsKey = JSON.stringify(jobKeywords)

  useEffect(() => {
    if (!pdfBlobUrl) {
      abortRef.current?.abort()
      setAnalysis(null)
      setIsAnalyzing(false)
      setError(null)
      return
    }

    // Abort any in-flight request from a previous PDF
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsAnalyzing(true)
    setError(null)

    ;(async () => {
      try {
        const pdfBase64 = await blobUrlToBase64(pdfBlobUrl)

        if (controller.signal.aborted) return

        const response = await fetchWithKey('/api/analyze-ats', {
          method: 'POST',
          body: JSON.stringify({ pdfBase64, jobKeywords: keywordsRef.current }),
          signal: controller.signal,
        })

        if (controller.signal.aborted) return

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Analysis failed')
        }

        const data = await response.json()
        if (!controller.signal.aborted) {
          setAnalysis(data)
          setIsAnalyzing(false)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setError(err.message || 'ATS analysis failed')
          setIsAnalyzing(false)
        }
      }
    })()

    return () => {
      abortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfBlobUrl, keywordsKey])

  return { analysis, isAnalyzing, error }
}
