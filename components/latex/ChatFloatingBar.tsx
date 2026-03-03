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
    <div className="px-2.5 py-2 border-t border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-[#111111] shrink-0">
      <div className={`flex items-center gap-2 bg-white dark:bg-zinc-800/60 border rounded-lg px-3 py-1.5 transition-all duration-150 ${
        focused
          ? 'border-zinc-300 dark:border-zinc-500 shadow-sm'
          : 'border-zinc-200 dark:border-zinc-700/60'
      }`}>
        <Sparkles className="w-3 h-3 text-zinc-300 dark:text-zinc-600 shrink-0" />
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
          className="flex-1 bg-transparent text-[12px] text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
        />
        {value.trim() && (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 w-5 h-5 flex items-center justify-center rounded-md bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-white disabled:opacity-30 transition-colors"
          >
            <SendHorizonal className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}
