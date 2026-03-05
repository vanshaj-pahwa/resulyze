'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'resulyze-analytics'
const MAX_EVENTS = 500

export type AnalyticsEventType =
  | 'resume_created'
  | 'cover_letter_generated'
  | 'interview_prepped'
  | 'optimization_applied'
  | 'jd_analyzed'

export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  timestamp: number
  metadata?: Record<string, any>
}

function loadEvents(): AnalyticsEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return []
}

/** Standalone track function — use in callbacks without the full hook */
export function trackAnalyticsEvent(type: AnalyticsEventType, metadata?: Record<string, any>) {
  if (typeof window === 'undefined') return
  const events = loadEvents()
  const event: AnalyticsEvent = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type,
    timestamp: Date.now(),
    metadata,
  }
  const updated = [...events, event].slice(-MAX_EVENTS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function useAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEvents(loadEvents())
    }
  }, [])

  const persist = useCallback((updated: AnalyticsEvent[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setEvents(updated)
  }, [])

  const trackEvent = useCallback((type: AnalyticsEventType, metadata?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type,
      timestamp: Date.now(),
      metadata,
    }
    setEvents(prev => {
      const updated = [...prev, event].slice(-MAX_EVENTS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const stats = useMemo(() => ({
    resumesCreated: events.filter(e => e.type === 'resume_created').length,
    coverLetters: events.filter(e => e.type === 'cover_letter_generated').length,
    interviewsPrepped: events.filter(e => e.type === 'interview_prepped').length,
    optimizationsApplied: events.filter(e => e.type === 'optimization_applied').length,
    jdsAnalyzed: events.filter(e => e.type === 'jd_analyzed').length,
  }), [events])

  const skillFrequencies = useMemo(() => {
    const freq = new Map<string, number>()
    for (const event of events) {
      if (event.type === 'jd_analyzed' && event.metadata?.skills) {
        for (const skill of event.metadata.skills as string[]) {
          freq.set(skill, (freq.get(skill) || 0) + 1)
        }
      }
    }
    return freq
  }, [events])

  const optimizationHistory = useMemo(
    () => events.filter(e => e.type === 'optimization_applied').reverse(),
    [events]
  )

  const clearAnalytics = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEvents([])
  }, [])

  return {
    events,
    trackEvent,
    stats,
    skillFrequencies,
    optimizationHistory,
    clearAnalytics,
  }
}
