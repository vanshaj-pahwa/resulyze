'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'resulyze-step-progress'

export function useStepProgress() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setCompletedSteps(new Set(parsed))
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const markComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.add(stepId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCompletedSteps(new Set())
  }, [])

  return { completedSteps, markComplete, reset, mounted }
}
