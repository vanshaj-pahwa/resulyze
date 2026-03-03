'use client'

import { useMemo } from 'react'
import { X, ChevronRight } from 'lucide-react'

interface OutlineEntry {
  label: string
  level: number     // 1 = \section, 2 = \subsection, 3 = \subsubsection
  line: number      // 1-based line number in the source
}

/** Parse \section, \subsection, \subsubsection (starred and normal) from LaTeX source. */
function parseOutline(source: string): OutlineEntry[] {
  const entries: OutlineEntry[] = []
  const lines = source.split('\n')

  const SECTION_RE = /^\\(section|subsection|subsubsection)\*?\{([^}]*)\}/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimStart()
    // Skip comment lines
    if (line.startsWith('%')) continue

    const m = SECTION_RE.exec(line)
    if (m) {
      const cmd = m[1]
      const label = m[2].trim()
      const level = cmd === 'section' ? 1 : cmd === 'subsection' ? 2 : 3
      entries.push({ label, level, line: i + 1 })
    }
  }

  return entries
}

interface OutlinePanelProps {
  latexSource: string
  onNavigate: (line: number) => void
  onClose: () => void
}

export default function OutlinePanel({ latexSource, onNavigate, onClose }: OutlinePanelProps) {
  const outline = useMemo(() => parseOutline(latexSource), [latexSource])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Outline
        </span>
        <button
          onClick={onClose}
          className="p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {outline.length === 0 ? (
          <p className="px-3 py-4 text-xs text-zinc-400 dark:text-zinc-600 text-center">
            No sections found.
            <br />
            Add <code className="font-mono">\section{'{Title}'}</code> to your document.
          </p>
        ) : (
          outline.map((entry, i) => (
            <button
              key={i}
              onClick={() => onNavigate(entry.line)}
              className="w-full flex items-center gap-1.5 px-3 py-1 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
              style={{ paddingLeft: `${8 + (entry.level - 1) * 14}px` }}
            >
              <ChevronRight
                className="w-3 h-3 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400"
                style={{ opacity: entry.level === 1 ? 1 : 0.5 }}
              />
              <span
                className={`truncate text-xs leading-5 ${
                  entry.level === 1
                    ? 'font-semibold text-zinc-700 dark:text-zinc-200'
                    : entry.level === 2
                    ? 'text-zinc-500 dark:text-zinc-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {entry.label}
              </span>
              <span className="ml-auto text-[10px] text-zinc-300 dark:text-zinc-700 shrink-0 group-hover:text-zinc-400">
                {entry.line}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
