'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'resulyze-gemini-key'

export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setApiKeyState(localStorage.getItem(STORAGE_KEY))
  }, [])

  const setKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKeyState(key)
  }, [])

  const clearKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setApiKeyState(null)
  }, [])

  const validateKey = useCallback(async (key: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      })
      const data = await res.json()
      return { valid: data.valid, error: data.error }
    } catch {
      return { valid: false, error: 'Failed to validate key. Check your connection.' }
    }
  }, [])

  return {
    apiKey,
    isKeySet: mounted && !!apiKey,
    mounted,
    setKey,
    clearKey,
    validateKey,
  }
}
