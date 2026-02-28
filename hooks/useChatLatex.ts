'use client'

import { useState, useCallback, useRef } from 'react'
import { fetchWithKey } from '@/lib/fetch'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  proposedLatex?: string
  changes?: Array<{ before: string; after: string }>
  status?: 'applied' | 'dismissed'
  timestamp: number
}

interface UseChatLatexOptions {
  latexSource: string
  jobData: any | null
  onApplyChanges: (newLatex: string) => void
}

export function useChatLatex({ latexSource, jobData, onApplyChanges }: UseChatLatexOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const latexRef = useRef(latexSource)
  latexRef.current = latexSource

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
  }, [messages, isLoading, jobData])

  const applyProposal = useCallback((messageId: string) => {
    setMessages(prev => {
      const msg = prev.find(m => m.id === messageId)
      if (msg?.proposedLatex) {
        onApplyChanges(msg.proposedLatex)
      }
      return prev.map(m =>
        m.id === messageId ? { ...m, status: 'applied' as const } : m
      )
    })
  }, [onApplyChanges])

  const dismissProposal = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, status: 'dismissed' as const } : m
      )
    )
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    applyProposal,
    dismissProposal,
    clearChat,
  }
}
