'use client'

import { useState } from 'react'
import { Keyboard, X } from 'lucide-react'

const shortcuts = [
  { keys: ['Ctrl', 'Enter'], description: 'Compile LaTeX to PDF' },
  { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle AI chat panel' },
  { keys: ['Ctrl', 'Z'], description: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
  { keys: ['Ctrl', '/'], description: 'Toggle % comment' },
  { keys: ['Ctrl', 'Shift', 'D'], description: 'Duplicate line' },
  { keys: ['Alt', '↑ / ↓'], description: 'Move line up / down' },
  { keys: ['Ctrl', 'Shift', 'K'], description: 'Delete line' },
  { keys: ['Tab'], description: 'Indent selection' },
  { keys: ['Shift', 'Tab'], description: 'Dedent selection' },
  { keys: ['Ctrl', 'F'], description: 'Find & Replace' },
  { keys: ['Ctrl', 'Shift', 'O'], description: 'Document outline' },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
      {children}
    </kbd>
  )
}

export function ShortcutsDialog({ compact = false }: { compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] ${compact ? 'px-1.5 py-1' : 'px-2 py-1'}`}
        title="Keyboard shortcuts"
      >
        <Keyboard className="w-3.5 h-3.5 shrink-0" />
        {!compact && <span>Keys</span>}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />

          {/* Dialog */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts list */}
            <div className="px-4 py-3 space-y-2.5">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{s.description}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {s.keys.map((key, j) => (
                      <span key={j} className="flex items-center gap-0.5">
                        <Kbd>{key}</Kbd>
                        {j < s.keys.length - 1 && <span className="text-zinc-400 text-[10px] px-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-400">
                On macOS, use <Kbd>Cmd</Kbd> instead of <Kbd>Ctrl</Kbd>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
