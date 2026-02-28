'use client'

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'resulyze-resume-versions'
const MAX_VERSIONS = 20

export interface ResumeVersion {
  id: string
  title: string
  latex: string
  timestamp: number
  label: string
}

export function useResumeVersions() {
  const [versions, setVersions] = useState<ResumeVersion[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setVersions(JSON.parse(saved))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const persist = useCallback((updated: ResumeVersion[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setVersions(updated)
  }, [])

  const saveVersion = useCallback((latex: string, title: string, label: string) => {
    const version: ResumeVersion = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      latex,
      timestamp: Date.now(),
      label,
    }
    setVersions(prev => {
      const updated = [version, ...prev].slice(0, MAX_VERSIONS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    return version.id
  }, [])

  const deleteVersion = useCallback((id: string) => {
    setVersions(prev => {
      const updated = prev.filter(v => v.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateLabel = useCallback((id: string, label: string) => {
    setVersions(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, label } : v)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return { versions, saveVersion, deleteVersion, updateLabel }
}
