'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Resume } from '@/types/resume'
import { generateId } from '@/lib/utils'
import { detectActiveTemplate } from '@/lib/templates'

const RESUMES_KEY = 'resulyze-resumes'
const ACTIVE_KEY = 'resulyze-active-resume-id'

function loadResumes(): Resume[] {
  try {
    const saved = localStorage.getItem(RESUMES_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    localStorage.removeItem(RESUMES_KEY)
  }
  return []
}

function persistResumes(resumes: Resume[]) {
  localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes))
}

/** Migrate from the old single-resume localStorage keys to the new multi-resume structure. */
function migrateFromSingleResume(): { resumes: Resume[]; activeId: string } | null {
  if (localStorage.getItem(RESUMES_KEY)) return null // already migrated

  const oldLatex = localStorage.getItem('resulyze-latex-source')
  if (!oldLatex) return null // nothing to migrate

  const oldTitle = localStorage.getItem('resulyze-resume-title') || 'My Resume'
  const id = generateId()

  const resume: Resume = {
    id,
    title: oldTitle,
    latexSource: oldLatex,
    templateId: detectActiveTemplate(oldLatex),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  // Migrate version history
  const oldVersions = localStorage.getItem('resulyze-resume-versions')
  if (oldVersions) {
    localStorage.setItem(`resulyze-versions-${id}`, oldVersions)
    localStorage.removeItem('resulyze-resume-versions')
  }

  // Migrate chat history
  const oldChat = localStorage.getItem('resulyze-chat-history')
  if (oldChat) {
    localStorage.setItem(`resulyze-chat-${id}`, oldChat)
    localStorage.removeItem('resulyze-chat-history')
  }

  // Save new structure
  const resumes = [resume]
  persistResumes(resumes)
  localStorage.setItem(ACTIVE_KEY, id)

  // Clean up old keys
  localStorage.removeItem('resulyze-latex-source')
  localStorage.removeItem('resulyze-resume-title')

  return { resumes, activeId: id }
}

export function useResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Load on mount + migration
  useEffect(() => {
    const migrated = migrateFromSingleResume()
    if (migrated) {
      setResumes(migrated.resumes)
      setActiveResumeId(migrated.activeId)
    } else {
      const saved = loadResumes()
      // Repair any resumes with unknown templateId
      const KNOWN_IDS = ['modern', 'classic', 'minimal', 'sidebar', 'developer', 'professional', 'bold', 'compact']
      let repaired = false
      for (const r of saved) {
        if (!KNOWN_IDS.includes(r.templateId)) {
          r.templateId = detectActiveTemplate(r.latexSource)
          repaired = true
        }
      }
      if (repaired) persistResumes(saved)
      setResumes(saved)
      const activeId = localStorage.getItem(ACTIVE_KEY)
      if (activeId && saved.some(r => r.id === activeId)) {
        setActiveResumeId(activeId)
      } else if (saved.length > 0) {
        setActiveResumeId(saved[0].id)
        localStorage.setItem(ACTIVE_KEY, saved[0].id)
      }
    }
    setMounted(true)
  }, [])

  const activeResume = resumes.find(r => r.id === activeResumeId) ?? null

  const createResume = useCallback((title: string, templateId: string, latexSource: string): Resume => {
    const resume: Resume = {
      id: generateId(),
      title,
      latexSource,
      templateId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setResumes(prev => {
      const updated = [...prev, resume]
      persistResumes(updated)
      return updated
    })
    setActiveResumeId(resume.id)
    localStorage.setItem(ACTIVE_KEY, resume.id)
    return resume
  }, [])

  const switchResume = useCallback((id: string) => {
    setActiveResumeId(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }, [])

  const deleteResume = useCallback((id: string) => {
    setResumes(prev => {
      const updated = prev.filter(r => r.id !== id)
      persistResumes(updated)

      // Clean up namespaced keys
      localStorage.removeItem(`resulyze-versions-${id}`)
      localStorage.removeItem(`resulyze-chat-${id}`)

      // If deleting active resume, switch to first remaining or null
      if (id === activeResumeId) {
        const next = updated[0]?.id ?? null
        setActiveResumeId(next)
        if (next) {
          localStorage.setItem(ACTIVE_KEY, next)
        } else {
          localStorage.removeItem(ACTIVE_KEY)
        }
      }

      return updated
    })
  }, [activeResumeId])

  const renameResume = useCallback((id: string, title: string) => {
    setResumes(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, title, updatedAt: Date.now() } : r)
      persistResumes(updated)
      return updated
    })
  }, [])

  const updateLatex = useCallback((latex: string) => {
    if (!activeResumeId) return
    // Debounce persistence — update state immediately, persist after 500ms
    setResumes(prev => {
      const updated = prev.map(r =>
        r.id === activeResumeId ? { ...r, latexSource: latex, updatedAt: Date.now() } : r
      )
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => persistResumes(updated), 500)
      return updated
    })
  }, [activeResumeId])

  const linkJob = useCallback((resumeId: string, jobId: string) => {
    setResumes(prev => {
      const updated = prev.map(r => r.id === resumeId ? { ...r, linkedJobId: jobId } : r)
      persistResumes(updated)
      return updated
    })
  }, [])

  return {
    resumes,
    activeResume,
    activeResumeId,
    mounted,
    createResume,
    switchResume,
    deleteResume,
    renameResume,
    updateLatex,
    linkJob,
  }
}

export type ResumeManager = ReturnType<typeof useResumeManager>
