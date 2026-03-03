'use client'

import { useState, useCallback, useRef } from 'react'
import { fetchWithKey } from '@/lib/fetch'

export interface WeakBullet {
  text: string
  reason: string
  rewrite: string
}

export interface SectionReview {
  score: number
  findings: string[]
  suggestions: string[]
}

export interface ResumeReview {
  overallScore: number
  letterGrade: string
  verdict: string
  sections: {
    contactInfo: SectionReview
    experience: SectionReview
    skills: SectionReview
    education: SectionReview
    projects: SectionReview
    formatting: SectionReview
  }
  atsCompliance: SectionReview
  contentQuality: {
    weakBullets: WeakBullet[]
    missingMetrics: string[]
    vagueClaims: string[]
  }
  topPriorities: string[]
  relevance?: SectionReview
}

export function useResumeReview() {
  const [review, setReview] = useState<ResumeReview | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const requestReview = useCallback(async (latexSource: string, jobData?: any) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setIsReviewing(true)
    setError(null)

    try {
      const response = await fetchWithKey('/api/review-resume', {
        method: 'POST',
        body: JSON.stringify({ latexSource, jobData }),
        signal: controller.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to review resume')
      }

      setReview(data)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Failed to review resume')
    } finally {
      setIsReviewing(false)
    }
  }, [])

  const clearReview = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setReview(null)
    setError(null)
  }, [])

  return { review, isReviewing, error, requestReview, clearReview }
}
