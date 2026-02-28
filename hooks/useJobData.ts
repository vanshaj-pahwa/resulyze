'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'resulyze-job-data'

export function useJobData() {
  const [jobData, setJobDataState] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setJobDataState(JSON.parse(saved))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setJobData = useCallback((data: any) => {
    setJobDataState(data)
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const clearJobData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setJobDataState(null)
  }, [])

  return { jobData, setJobData, clearJobData, mounted }
}
