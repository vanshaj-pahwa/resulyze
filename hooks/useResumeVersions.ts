'use client'

import { useState, useCallback, useEffect } from 'react'
import { generateId } from '@/lib/utils'

const MAX_VERSIONS = 20

export interface ResumeVersion {
  id: string
  title: string
  latex: string
  timestamp: number
  label: string
}

export function useResumeVersions(resumeId: string | null) {
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const storageKey = resumeId ? `resulyze-versions-${resumeId}` : null

  useEffect(() => {
    if (!storageKey) {
      setVersions([])
      return
    }
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setVersions(JSON.parse(saved))
      } else {
        setVersions([])
      }
    } catch {
      localStorage.removeItem(storageKey)
      setVersions([])
    }
  }, [storageKey])

  const saveVersion = useCallback((latex: string, title: string, label: string) => {
    if (!storageKey) return ''
    const version: ResumeVersion = {
      id: generateId(),
      title,
      latex,
      timestamp: Date.now(),
      label,
    }
    setVersions(prev => {
      const updated = [version, ...prev].slice(0, MAX_VERSIONS)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
    return version.id
  }, [storageKey])

  const deleteVersion = useCallback((id: string) => {
    if (!storageKey) return
    setVersions(prev => {
      const updated = prev.filter(v => v.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }, [storageKey])

  const updateLabel = useCallback((id: string, label: string) => {
    if (!storageKey) return
    setVersions(prev => {
      const updated = prev.map(v => v.id === id ? { ...v, label } : v)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }, [storageKey])

  return { versions, saveVersion, deleteVersion, updateLabel }
}
