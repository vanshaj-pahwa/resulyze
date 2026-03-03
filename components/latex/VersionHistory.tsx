'use client'

import { useState } from 'react'
import { X, RotateCcw, Trash2, Clock, Pencil, Check, Eye, EyeOff } from 'lucide-react'
import type { ResumeVersion } from '@/hooks/useResumeVersions'

interface VersionHistoryProps {
  versions: ResumeVersion[]
  onRestore: (latex: string) => void
  onDelete: (id: string) => void
  onUpdateLabel: (id: string, label: string) => void
  onClose: () => void
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today · ${time}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${time}`
}

function getLatexTitle(latex: string): string {
  const titleMatch = latex.match(/\\(?:name|title)\{([^}]+)\}/)
  if (titleMatch) return titleMatch[1].trim()
  return ''
}

export default function VersionHistory({ versions, onRestore, onDelete, onUpdateLabel, onClose }: VersionHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [previewId, setPreviewId] = useState<string | null>(null)

  const startEdit = (v: ResumeVersion) => {
    setEditingId(v.id)
    setEditValue(v.label)
  }

  const commitEdit = () => {
    if (editingId) {
      onUpdateLabel(editingId, editValue.trim())
      setEditingId(null)
    }
  }

  const totalVersions = versions.length

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header — matches toolbar height/style */}
      <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center justify-between px-2.5 border-b border-zinc-200 dark:border-latex-border shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">Version History</span>
          {totalVersions > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-700/60 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 tabular-nums">
              {totalVersions}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Clock className="w-7 h-7 text-zinc-200 dark:text-zinc-700 mb-3" />
            <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">No versions saved yet</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1 leading-relaxed">
              Versions are created automatically when you optimize or apply AI changes
            </p>
          </div>
        ) : (
          <div>
            {versions.map((v, index) => {
              const versionNum = totalVersions - index
              const isPreviewOpen = previewId === v.id
              const docTitle = getLatexTitle(v.latex)

              return (
                <div key={v.id} className="group border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
                  {/* Main row */}
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                    {/* Version badge */}
                    <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-600 w-7 text-right shrink-0 select-none">
                      v{versionNum}
                    </span>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      {editingId === v.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit()
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className="flex-1 text-[12px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-0.5 outline-none text-zinc-900 dark:text-zinc-100"
                            autoFocus
                          />
                          <button
                            onClick={commitEdit}
                            className="p-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {v.label || v.title || 'Untitled'}
                          </span>
                          {docTitle && v.label && (
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-600 truncate hidden group-hover:inline">
                              · {docTitle}
                            </span>
                          )}
                          <button
                            onClick={() => startEdit(v)}
                            className="shrink-0 p-0.5 text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Rename"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5 tabular-nums">
                        {formatTimestamp(v.timestamp)}
                      </p>
                    </div>

                    {/* Action icons — always visible, subtle until hover */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => setPreviewId(isPreviewOpen ? null : v.id)}
                        title={isPreviewOpen ? 'Hide preview' : 'Preview LaTeX'}
                        className={`p-1.5 rounded-md transition-all duration-150 ${
                          isPreviewOpen
                            ? 'text-zinc-700 bg-zinc-200/80 dark:text-zinc-200 dark:bg-white/10'
                            : 'text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        {isPreviewOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => onRestore(v.latex)}
                        title="Restore this version"
                        className="p-1.5 rounded-md text-zinc-300 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDelete(v.id)}
                        title="Delete this version"
                        className="p-1.5 rounded-md text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:text-zinc-700 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all duration-150"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Inline LaTeX preview */}
                  {isPreviewOpen && (
                    <div className="mx-3 mb-2 rounded-md border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-800/40 overflow-hidden">
                      <pre className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 p-3 overflow-auto max-h-48 whitespace-pre-wrap break-words leading-relaxed">
                        {v.latex}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
