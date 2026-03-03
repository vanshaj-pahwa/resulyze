'use client'

import { useState } from 'react'
import { X, Scissors, ArrowRight, CheckCircle2, XCircle, Info } from 'lucide-react'

export interface TrimChange {
  id: string
  type: 'remove' | 'compress'
  section: string
  reasoning: string
  displayText: string  // Clean text of the item being changed
  itemIndex: number    // Index into TrimProposal.items
  newText?: string     // For compress: new plain text (no LaTeX)
}

export interface TrimItem {
  index: number
  lineNum: number
  raw: string
  text: string
  section: string
}

export interface TrimProposal {
  changes: TrimChange[]
  items: TrimItem[]
  originalSource: string
}

interface TrimReviewModalProps {
  proposal: TrimProposal
  onApply: (approvedIds: string[]) => void
  onCancel: () => void
}


export default function TrimReviewModal({ proposal, onApply, onCancel }: TrimReviewModalProps) {
  const { changes } = proposal
  const [approved, setApproved] = useState<Set<string>>(
    () => new Set(changes.map(c => c.id))
  )

  const approvedCount = approved.size
  const hasChanges = changes.length > 0

  function toggle(id: string) {
    setApproved(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleApply() {
    onApply(Array.from(approved))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#111111] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
              <Scissors className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Proposed Trim Changes
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {hasChanges
                  ? `${changes.length} change${changes.length !== 1 ? 's' : ''} identified — approve or reject before applying.`
                  : 'No specific changes could be identified.'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Change list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2.5">
          {!hasChanges && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
              <Info className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                The AI couldn't identify specific changes to suggest. Your resume content may already be close to fitting on one page. Try using the AI chat to trim manually.
              </p>
            </div>
          )}

          {changes.map(change => {
            const isApproved = approved.has(change.id)

            return (
              <div
                key={change.id}
                className={`rounded-lg border transition-all duration-150 overflow-hidden
                  ${isApproved
                    ? 'border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/40'
                    : 'border-zinc-100 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/20 opacity-60'
                  }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide
                      ${change.type === 'remove'
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {change.type === 'remove' ? 'Remove' : 'Compress'}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {change.section}
                    </span>
                  </div>

                  <button
                    onClick={() => toggle(change.id)}
                    className={`ml-2 shrink-0 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors
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
                <div className="px-3.5 py-2.5 space-y-2">
                  <div className="flex items-start gap-2">
                    <p className={`flex-1 text-[11px] leading-relaxed
                      ${change.type === 'remove'
                        ? 'line-through text-red-500 dark:text-red-400'
                        : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {change.displayText}
                    </p>

                    {change.type === 'compress' && change.newText && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <p className="flex-1 text-[11px] leading-relaxed text-emerald-600 dark:text-emerald-400">
                          {change.newText}
                        </p>
                      </>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic leading-relaxed">
                    {change.reasoning}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            {hasChanges ? `${approvedCount} of ${changes.length} selected` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              {hasChanges ? 'Cancel' : 'Close'}
            </button>
            {hasChanges && (
              <button
                onClick={handleApply}
                disabled={approvedCount === 0}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply {approvedCount} change{approvedCount !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
