'use client'

import { AlertTriangle, Sparkles, X, Loader2 } from 'lucide-react'

interface OverflowBannerProps {
  pageCount: number
  isTrimming: boolean
  onTrim: () => void
  onDismiss: () => void
}

export default function OverflowBanner({ pageCount, isTrimming, onTrim, onDismiss }: OverflowBannerProps) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
      <AlertTriangle className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 flex-1">
        Your resume is <strong className="text-zinc-800 dark:text-zinc-200">{pageCount} pages</strong>. Most recruiters expect 1 page.
      </span>
      <button
        onClick={onTrim}
        disabled={isTrimming}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-white dark:text-zinc-900 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-zinc-300 rounded transition-colors disabled:opacity-50"
      >
        {isTrimming ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Sparkles className="w-3 h-3" />
        )}
        {isTrimming ? 'Trimming...' : 'Auto-trim'}
      </button>
      <button
        onClick={onDismiss}
        className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
