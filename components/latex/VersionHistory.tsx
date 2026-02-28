'use client'

import { useState } from 'react'
import { X, RotateCcw, Trash2, Clock, Pencil, Check } from 'lucide-react'
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

export default function VersionHistory({ versions, onRestore, onDelete, onUpdateLabel, onClose }: VersionHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Version History</span>
          <span className="text-xs text-zinc-400">({versions.length})</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Clock className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-500">No versions yet</p>
            <p className="text-xs text-zinc-400 mt-1">Versions are saved when you optimize or apply AI changes</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {versions.map((v) => (
              <div key={v.id} className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                {/* Label */}
                <div className="flex items-start justify-between gap-2">
                  {editingId === v.id ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && commitEdit()}
                        className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-0.5 outline-none text-zinc-900 dark:text-zinc-100"
                        autoFocus
                      />
                      <button onClick={commitEdit} className="p-0.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {v.label || v.title || 'Untitled'}
                      </span>
                      <button
                        onClick={() => startEdit(v)}
                        className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-zinc-400 mt-0.5">{formatTimestamp(v.timestamp)}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onRestore(v.latex)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(v.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
