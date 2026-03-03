'use client'

import { useState, useCallback, useRef } from 'react'
import { SendHorizonal, Sparkles } from 'lucide-react'

interface ChatFloatingBarProps {
  onSend: (message: string) => void
  onExpand: () => void
  disabled: boolean
}

export default function ChatFloatingBar({ onSend, onExpand, disabled }: ChatFloatingBarProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleFocus = useCallback(() => {
    setFocused(true)
    onExpand()
  }, [onExpand])

  return (
    <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-900/80 shrink-0">
      <div className={`flex items-center gap-2 bg-white dark:bg-zinc-800/95 border rounded-lg px-3 py-2 transition-all shadow-sm ${
        focused
          ? 'border-zinc-400 dark:border-zinc-500 shadow-md'
          : 'border-zinc-300 dark:border-zinc-600'
      }`}>
        <Sparkles className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          placeholder="Ask anything"
          disabled={disabled}
          className="flex-1 bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none disabled:opacity-50"
        />
        {value.trim() && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-30 transition-colors"
          >
            <SendHorizonal className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
