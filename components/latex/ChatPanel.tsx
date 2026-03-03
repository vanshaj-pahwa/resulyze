'use client'

import { useEffect, useRef } from 'react'
import { X, Trash2, Bot, Sparkles, Hammer } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatLatex'

interface ChatPanelProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSendMessage: (content: string) => void
  onApplyProposal: (messageId: string) => void
  onDismissProposal: (messageId: string) => void
  onApplyChange: (messageId: string, changeIndex: number) => void
  onDismissChange: (messageId: string, changeIndex: number) => void
  onUndoChanges: () => void
  onClearChat: () => void
  onClose: () => void
  onStartBuilder?: () => void
}

export default function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  onApplyProposal,
  onDismissProposal,
  onApplyChange,
  onDismissChange,
  onUndoChanges,
  onClearChat,
  onClose,
  onStartBuilder,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="h-10 bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Resulyze AI</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5">
              <Sparkles className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">Resulyze AI</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-[220px]">
              Ask about LaTeX or request changes to your resume.
            </p>
            <div className="mt-3 space-y-1 w-full max-w-[240px]">
              {onStartBuilder && (
                <button
                  onClick={onStartBuilder}
                  className="w-full flex items-center gap-2 text-[11px] text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-2 rounded border border-zinc-200 dark:border-zinc-700 transition-colors font-medium"
                >
                  <Hammer className="w-3 h-3" />
                  Build resume from scratch
                </button>
              )}
              {[
                'Add Python to my skills',
                'Make the margins wider',
                'Rewrite my profile section',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="w-full text-left text-[11px] text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50 px-2.5 py-1.5 rounded border border-zinc-100 dark:border-zinc-800 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onApply={onApplyProposal}
            onDismiss={onDismissProposal}
            onApplyChange={onApplyChange}
            onDismissChange={onDismissChange}
            onUndo={onUndoChanges}
          />
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="shrink-0 w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-zinc-500 dark:text-zinc-300" />
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-500 animate-pulse [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-500 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick action chips */}
      <div className="flex flex-wrap gap-1 px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800/50 shrink-0">
        {[
          'Review my resume',
          'Add metrics',
          'Make concise',
          'Fix verbs',
          'Match JD keywords',
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => onSendMessage(chip)}
            disabled={isLoading}
            className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-300 text-zinc-500 hover:text-zinc-800 hover:border-zinc-500 hover:bg-zinc-100 dark:border-zinc-700/60 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-40"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  )
}
