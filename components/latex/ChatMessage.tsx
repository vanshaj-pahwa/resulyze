'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Check, X, Undo2, Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatLatex'

interface ChatMessageProps {
  message: ChatMessageType
  onApply?: (id: string) => void
  onDismiss?: (id: string) => void
  onUndo?: () => void
}

export default memo(function ChatMessage({ message, onApply, onDismiss, onUndo }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const hasProposal = !!message.proposedLatex && message.changes && message.changes.length > 0

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
        isUser ? 'bg-zinc-600' : 'bg-zinc-700'
      }`}>
        {isUser ? (
          <User className="w-3 h-3 text-zinc-300" />
        ) : (
          <Bot className="w-3 h-3 text-zinc-300" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-zinc-600/60 text-zinc-100 text-[13px] leading-relaxed'
            : 'text-zinc-300 text-[13px] leading-relaxed'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_h1]:text-zinc-200 [&_h2]:text-zinc-200 [&_h3]:text-zinc-200 [&_code]:text-[11px] [&_code]:text-zinc-200 [&_code]:bg-zinc-700/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_pre]:bg-zinc-800 [&_pre]:rounded [&_pre]:p-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-zinc-300 [&_a]:underline [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:list-disc [&_strong]:text-zinc-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Proposal section */}
        {hasProposal && !message.status && (
          <div className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-2.5">
            <p className="text-xs font-medium text-zinc-400 mb-1.5">Proposed changes:</p>
            <div className="space-y-2 mb-2.5">
              {message.changes!.map((change, i) => (
                <div key={i} className="rounded border border-zinc-700/40 overflow-hidden text-[11px] font-mono">
                  {change.before && (
                    <div className="flex items-start gap-1.5 px-2 py-1 bg-red-950/30 border-b border-zinc-700/30">
                      <span className="text-red-400 shrink-0 select-none leading-4">−</span>
                      <span className="text-red-300/80 break-all leading-4">{change.before}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 px-2 py-1 bg-green-950/30">
                    <span className="text-green-400 shrink-0 select-none leading-4">+</span>
                    <span className="text-green-300/80 break-all leading-4">{change.after}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApply?.(message.id)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
              >
                <Check className="w-3 h-3" />
                Apply Changes
              </button>
              <button
                onClick={() => onDismiss?.(message.id)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded text-zinc-400 hover:bg-zinc-700/50 transition-colors"
              >
                <X className="w-3 h-3" />
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Applied state */}
        {message.status === 'applied' && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Check className="w-3 h-3" />
              Changes applied
            </span>
            {onUndo && (
              <button
                onClick={onUndo}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        )}

        {/* Dismissed state */}
        {message.status === 'dismissed' && (
          <span className="text-xs text-zinc-600">Dismissed</span>
        )}
      </div>
    </div>
  )
})
