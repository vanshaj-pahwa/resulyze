'use client'

import { useEffect, useRef } from 'react'
import { X, Trash2, Bot, Sparkles } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatLatex'

interface ChatPanelProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSendMessage: (content: string) => void
  onApplyProposal: (messageId: string) => void
  onDismissProposal: (messageId: string) => void
  onUndoChanges: () => void
  onClearChat: () => void
  onClose: () => void
}

export default function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  onApplyProposal,
  onDismissProposal,
  onUndoChanges,
  onClearChat,
  onClose,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-x border-zinc-700/50">
      {/* Header */}
      <div className="h-10 bg-zinc-800/80 flex items-center justify-between px-3 border-b border-zinc-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300">Resulyze AI</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50 rounded transition-colors"
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
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2.5">
              <Sparkles className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-xs font-medium text-zinc-400 mb-0.5">Resulyze AI</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed max-w-[220px]">
              Ask about LaTeX or request changes to your resume.
            </p>
            <div className="mt-3 space-y-1 w-full max-w-[240px]">
              {[
                'Add Python to my skills',
                'Make the margins wider',
                'Rewrite my profile section',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSendMessage(suggestion)}
                  className="w-full text-left text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 px-2.5 py-1.5 rounded border border-zinc-800 transition-colors"
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
            onUndo={onUndoChanges}
          />
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="shrink-0 w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
              <Bot className="w-2.5 h-2.5 text-zinc-300" />
            </div>
            <div className="bg-zinc-800/60 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  )
}
