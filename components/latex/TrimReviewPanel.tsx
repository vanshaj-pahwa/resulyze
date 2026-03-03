'use client'

import { useState } from 'react'
import { X, Scissors, ArrowRight, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import type { TrimProposal, TrimChange } from './TrimReviewModal'

interface TrimReviewPanelProps {
  proposal: TrimProposal
  onApply: (approvedIds: string[]) => void
  onClose: () => void
  onSendToChat: (message: string) => void
}

function ChangeCard({
  change,
  isApproved,
  onToggle,
  onSendToChat,
}: {
  change: TrimChange
  isApproved: boolean
  onToggle: () => void
  onSendToChat: (msg: string) => void
}) {
  const chatMsg =
    change.type === 'remove'
      ? `Remove this bullet from my resume: "${change.displayText}"`
      : `Compress this bullet to be shorter (suggested: "${change.newText}"): "${change.displayText}"`

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-150
        ${isApproved
          ? 'border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40'
          : 'border-zinc-100 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/20 opacity-50'
        }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide
              ${change.type === 'remove'
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}
          >
            {change.type}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{change.section}</span>
        </div>

        <button
          onClick={onToggle}
          className={`ml-2 shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md transition-colors
            ${isApproved
              ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
            }`}
        >
          {isApproved
            ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Approved</>
            : <><XCircle className="w-3 h-3 text-zinc-400" /> Rejected</>
          }
        </button>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-start gap-2">
          <p
            className={`flex-1 text-[11px] leading-relaxed
              ${change.type === 'remove'
                ? 'line-through text-red-500 dark:text-red-400/80'
                : 'text-zinc-600 dark:text-zinc-400'
              }`}
          >
            {change.displayText}
          </p>

          {change.type === 'compress' && change.newText && (
            <>
              <ArrowRight className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
              <p className="flex-1 text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                {change.newText}
              </p>
            </>
          )}
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
          {change.reasoning}
        </p>

        <button
          onClick={() => onSendToChat(chatMsg)}
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Ask AI in chat
        </button>
      </div>
    </div>
  )
}

export default function TrimReviewPanel({ proposal, onApply, onClose, onSendToChat }: TrimReviewPanelProps) {
  const { changes } = proposal
  const [approved, setApproved] = useState<Set<string>>(() => new Set(changes.map(c => c.id)))

  function toggle(id: string) {
    setApproved(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const approvedCount = approved.size

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center justify-between px-2.5 border-b border-zinc-200 dark:border-latex-border shrink-0">
        <div className="flex items-center gap-2">
          <Scissors className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">Trim Proposals</span>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{changes.length} suggestions</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Change list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {changes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">No changes identified.</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Use the AI chat to trim manually.
            </p>
          </div>
        ) : (
          changes.map(change => (
            <ChangeCard
              key={change.id}
              change={change}
              isApproved={approved.has(change.id)}
              onToggle={() => toggle(change.id)}
              onSendToChat={onSendToChat}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {changes.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {approvedCount} of {changes.length} approved
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(Array.from(approved))}
              disabled={approvedCount === 0}
              className="px-3 py-1 text-[11px] font-medium text-white bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply {approvedCount}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
