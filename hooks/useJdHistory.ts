'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'resulyze-jd-history'
const MAX_ENTRIES = 5

export interface JdHistoryEntry {
  id: string
  company: string
  jobTitle: string
  timestamp: number
  jobData: any
}

export function useJdHistory() {
  const [history, setHistory] = useState<JdHistoryEntry[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const addToHistory = useCallback((jobData: any) => {
    const entry: JdHistoryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      company: jobData.company || 'Unknown Company',
      jobTitle: jobData.jobTitle || 'Unknown Title',
      timestamp: Date.now(),
      jobData,
    }
    setHistory(prev => {
      // Deduplicate: remove existing entry with same company+title
      const filtered = prev.filter(
        e => !(e.company === entry.company && e.jobTitle === entry.jobTitle)
      )
      const updated = [entry, ...filtered].slice(0, MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { history, addToHistory, removeFromHistory }
}
