'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { fetchWithKey } from '@/lib/fetch'

const CHAT_STORAGE_KEY = 'resulyze-chat-history'

export interface ChangeItem {
  before: string
  after: string
  status?: 'applied' | 'dismissed'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  proposedLatex?: string
  changes?: ChangeItem[]
  status?: 'applied' | 'dismissed'
  timestamp: number
}

interface UseChatLatexOptions {
  latexSource: string
  jobData: any | null
  onApplyChanges: (newLatex: string) => void
}

function loadMessages(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }
  return []
}

export function useChatLatex({ latexSource, jobData, onApplyChanges }: UseChatLatexOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') return loadMessages()
    return []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [builderMode, setBuilderMode] = useState(false)
  const latexRef = useRef(latexSource)
  latexRef.current = latexSource

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      // Only persist text content, not proposed latex (saves space)
      const toSave = messages.map(({ proposedLatex, ...rest }) => rest)
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave))
    } else {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    }
  }, [messages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-user',
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const allMessages = [...messages, userMessage]
      const recentMessages = allMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetchWithKey('/api/chat-latex', {
        method: 'POST',
        body: JSON.stringify({
          messages: recentMessages,
          latexSource: latexRef.current,
          jobData,
          builderMode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-assistant',
        role: 'assistant',
        content: data.message,
        proposedLatex: data.proposedLatex,
        changes: data.changes,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      const errorMessage: ChatMessage = {
        id: 'msg-' + Date.now() + '-error',
        role: 'assistant',
        content: 'Sorry, I encountered an error: ' + (err.message || 'Something went wrong') + '. Please try again.',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, jobData, builderMode])

  const applyChange = useCallback((messageId: string, changeIndex: number) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === messageId)
      if (!msg?.changes?.[changeIndex]) return prev

      const change = msg.changes[changeIndex]
      if (change.status) return prev // already resolved

      const currentLatex = latexRef.current

      // Try exact string replacement first (works for single-line snippets)
      const replaced = currentLatex.replace(change.before, change.after)
      const replacementWorked = replaced !== currentLatex

      if (replacementWorked) {
        onApplyChanges(replaced)
        // Mark only this change as applied
        return prev.map(m => {
          if (m.id !== messageId) return m
          const updatedChanges = m.changes!.map((c, i) =>
            i === changeIndex ? { ...c, status: 'applied' as const } : c
          )
          const allResolved = updatedChanges.every(c => c.status)
          const anyApplied = updatedChanges.some(c => c.status === 'applied')
          return {
            ...m,
            changes: updatedChanges,
            status: allResolved ? (anyApplied ? 'applied' as const : 'dismissed' as const) : m.status,
          }
        })
      }

      // Replacement failed (abbreviated snippet didn't match) — fall back to proposedLatex
      if (msg.proposedLatex) {
        onApplyChanges(msg.proposedLatex)
        // Mark ALL pending changes as applied since proposedLatex contains all of them
        return prev.map(m => {
          if (m.id !== messageId) return m
          return {
            ...m,
            status: 'applied' as const,
            changes: m.changes!.map(c => ({ ...c, status: c.status || 'applied' as const })),
          }
        })
      }

      // No proposedLatex either — just mark as applied (UI feedback) without source change
      return prev.map(m => {
        if (m.id !== messageId) return m
        const updatedChanges = m.changes!.map((c, i) =>
          i === changeIndex ? { ...c, status: 'applied' as const } : c
        )
        const allResolved = updatedChanges.every(c => c.status)
        const anyApplied = updatedChanges.some(c => c.status === 'applied')
        return {
          ...m,
          changes: updatedChanges,
          status: allResolved ? (anyApplied ? 'applied' as const : 'dismissed' as const) : m.status,
        }
      })
    })
  }, [onApplyChanges])

  const dismissChange = useCallback((messageId: string, changeIndex: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const updatedChanges = m.changes!.map((c, i) =>
        i === changeIndex ? { ...c, status: 'dismissed' as const } : c
      )
      const allResolved = updatedChanges.every(c => c.status)
      const anyApplied = updatedChanges.some(c => c.status === 'applied')
      return {
        ...m,
        changes: updatedChanges,
        status: allResolved ? (anyApplied ? 'applied' as const : 'dismissed' as const) : m.status,
      }
    }))
  }, [])

  const applyProposal = useCallback((messageId: string) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === messageId)
      if (!msg?.changes) return prev

      // Prefer proposedLatex (authoritative full source) over sequential snippet replacements
      if (msg.proposedLatex) {
        onApplyChanges(msg.proposedLatex)
      } else {
        // Fall back to sequential string replacements (may partially fail for multi-line changes)
        let currentLatex = latexRef.current
        for (const change of msg.changes) {
          if (!change.status) {
            const newLatex = currentLatex.replace(change.before, change.after)
            currentLatex = newLatex
          }
        }
        onApplyChanges(currentLatex)
      }

      return prev.map(m =>
        m.id === messageId ? {
          ...m,
          status: 'applied' as const,
          changes: m.changes!.map(c => ({ ...c, status: c.status || 'applied' as const })),
        } : m
      )
    })
  }, [onApplyChanges])

  const dismissProposal = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? {
          ...m,
          status: 'dismissed' as const,
          changes: m.changes!.map(c => ({ ...c, status: c.status || 'dismissed' as const })),
        } : m
      )
    )
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    setBuilderMode(false)
  }, [])

  const startBuilder = useCallback(() => {
    setMessages([])
    setError(null)
    setBuilderMode(true)
    // Send initial builder prompt
    const initMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-assistant',
      role: 'assistant',
      content: 'Let\'s build your resume from scratch! I\'ll guide you through each section step by step.\n\nFirst — **what stage of your career are you in?**\n\n- Student / Recent graduate\n- Early career (0-2 years)\n- Mid-level (3-5 years)\n- Senior (6+ years)\n- Career change',
      timestamp: Date.now(),
    }
    setMessages([initMessage])
  }, [])

  return {
    messages,
    isLoading,
    error,
    builderMode,
    sendMessage,
    applyProposal,
    dismissProposal,
    applyChange,
    dismissChange,
    clearChat,
    startBuilder,
  }
}
