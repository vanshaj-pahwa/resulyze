'use client'

import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Check, X, Undo2, Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatLatex'

interface ChatMessageProps {
  message: ChatMessageType
  onApply?: (id: string) => void
  onDismiss?: (id: string) => void
  onApplyChange?: (id: string, index: number) => void
  onDismissChange?: (id: string, index: number) => void
  onUndo?: () => void
}

export default memo(function ChatMessage({ message, onApply, onDismiss, onApplyChange, onDismissChange, onUndo }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const hasProposal = !!message.proposedLatex && message.changes && message.changes.length > 0
  const hasPendingChanges = message.changes?.some(c => !c.status) ?? false

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
        isUser ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-zinc-100 dark:bg-zinc-700'
      }`}>
        {isUser ? (
          <User className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
        ) : (
          <Bot className="w-3 h-3 text-zinc-500 dark:text-zinc-300" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg px-3 py-2 ${
          isUser
            ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-600/60 dark:text-zinc-100 text-[13px] leading-relaxed'
            : 'text-zinc-700 dark:text-zinc-300 text-[13px] leading-relaxed'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="[&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-medium [&_h1]:text-zinc-700 dark:[&_h1]:text-zinc-200 [&_h2]:text-zinc-700 dark:[&_h2]:text-zinc-200 [&_h3]:text-zinc-600 dark:[&_h3]:text-zinc-200 [&_code]:text-[11px] [&_code]:text-zinc-700 dark:[&_code]:text-zinc-200 [&_code]:bg-zinc-100 dark:[&_code]:bg-zinc-700/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_pre]:bg-zinc-100 dark:[&_pre]:bg-zinc-800 [&_pre]:rounded [&_pre]:p-2 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:text-zinc-600 dark:[&_a]:text-zinc-300 [&_a]:underline [&_ul]:pl-4 [&_ol]:pl-4 [&_li]:list-disc [&_strong]:text-zinc-700 dark:[&_strong]:text-zinc-200">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Proposal section */}
        {hasProposal && !message.status && (
          <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/40 p-2.5">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Proposed changes:</p>
            <div className="space-y-2">
              {message.changes!.map((change, i) => (
                <div key={i} className={`rounded border overflow-hidden ${
                  change.status === 'applied' ? 'border-zinc-300/60 dark:border-zinc-600/30 opacity-60' :
                  change.status === 'dismissed' ? 'border-zinc-200 dark:border-zinc-700/20 opacity-40' :
                  'border-zinc-300 dark:border-zinc-700/40'
                }`}>
                  <div className="text-[11px] font-mono">
                    {change.before && (
                      <div className="flex items-start gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-950/30 border-b border-zinc-200 dark:border-zinc-700/30">
                        <span className="text-red-500 dark:text-red-400 shrink-0 select-none leading-4">−</span>
                        <span className="text-red-700 dark:text-red-300/80 break-all leading-4">{change.before}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/30">
                      <span className="text-green-600 dark:text-green-400 shrink-0 select-none leading-4">+</span>
                      <span className="text-green-800 dark:text-green-300/80 break-all leading-4">{change.after}</span>
                    </div>
                  </div>
                  {/* Per-change actions */}
                  {!change.status && (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border-t border-zinc-200 dark:border-zinc-700/30">
                      <button
                        onClick={() => onApplyChange?.(message.id, i)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white transition-colors"
                      >
                        <Check className="w-2.5 h-2.5" />
                        Apply
                      </button>
                      <button
                        onClick={() => onDismissChange?.(message.id, i)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <X className="w-2.5 h-2.5" />
                        Skip
                      </button>
                    </div>
                  )}
                  {change.status === 'applied' && (
                    <div className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-700/30">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    </div>
                  )}
                  {change.status === 'dismissed' && (
                    <div className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-700/30">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center gap-1">
                        <X className="w-2.5 h-2.5" /> Skipped
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Apply All / Dismiss All — only when multiple pending */}
            {hasPendingChanges && message.changes!.length > 1 && (
              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-700/30">
                <button
                  onClick={() => onApply?.(message.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded bg-zinc-800 text-zinc-100 hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Apply All
                </button>
                <button
                  onClick={() => onDismiss?.(message.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Dismiss All
                </button>
              </div>
            )}
          </div>
        )}

        {/* Applied state */}
        {message.status === 'applied' && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <Check className="w-3 h-3" />
              Changes applied
            </span>
            {onUndo && (
              <button
                onClick={onUndo}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        )}

        {/* Dismissed state */}
        {message.status === 'dismissed' && (
          <span className="text-xs text-zinc-400 dark:text-zinc-600">Dismissed</span>
        )}
      </div>
    </div>
  )
})
