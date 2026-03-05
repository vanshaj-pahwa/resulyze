'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Briefcase, ArrowRight, Plus, FileText } from 'lucide-react'
import { useResumeManagerContext } from '@/contexts/ResumeManagerContext'
import { TEMPLATES } from '@/lib/templates'
import { formatRelativeTime } from '@/lib/utils'

const TEMPLATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  modern:  { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/60 dark:border-emerald-800/30' },
  classic: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200/60 dark:border-amber-800/30' },
  minimal: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/60 dark:border-blue-800/30' },
  sidebar: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200/60 dark:border-purple-800/30' },
  developer: { bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200/60 dark:border-sky-800/30' },
  professional: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/60 dark:border-rose-800/30' },
  bold: { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/60 dark:border-orange-800/30' },
  compact: { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200/60 dark:border-teal-800/30' },
}
const DEFAULT_COLOR = { bg: 'bg-zinc-50 dark:bg-zinc-800/50', text: 'text-zinc-500 dark:text-zinc-400', border: 'border-zinc-200/60 dark:border-zinc-700/30' }

export default function ResumeList() {
  const resumeManager = useResumeManagerContext()
  const router = useRouter()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!resumeManager.mounted) return null
  if (resumeManager.resumes.length === 0) return null

  const handleOpen = (id: string) => {
    resumeManager.switchResume(id)
    router.push('/dashboard/resume')
  }

  const handleDelete = (id: string) => {
    resumeManager.deleteResume(id)
    setConfirmDeleteId(null)
  }

  const sorted = resumeManager.resumes.slice().sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">My Resumes</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {resumeManager.resumes.length} resume{resumeManager.resumes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="#templates"
          className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <Plus className="w-3 h-3" />
          New Resume
        </a>
      </div>

      <div className={`grid gap-2.5 ${sorted.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {sorted.map(resume => {
          const template = TEMPLATES.find(t => t.id === resume.templateId)
          const colors = TEMPLATE_COLORS[resume.templateId] || DEFAULT_COLOR
          const isConfirming = confirmDeleteId === resume.id

          return (
            <div
              key={resume.id}
              className={`group relative flex items-center gap-3.5 p-3.5 rounded-lg border ${colors.border} ${colors.bg} hover:brightness-[0.97] dark:hover:brightness-110 transition-all cursor-pointer overflow-hidden`}
              onClick={() => handleOpen(resume.id)}
            >
              <div className={`shrink-0 w-9 h-9 rounded-lg bg-white/70 dark:bg-black/10 flex items-center justify-center`}>
                <FileText className={`w-4 h-4 ${colors.text}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100 truncate leading-tight">
                  {resume.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium ${colors.text}`}>
                    {template?.name ?? 'Default'}
                  </span>
                  {resume.linkedJobId && (
                    <>
                      <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">&middot;</span>
                      <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        <Briefcase className="w-2.5 h-2.5" />
                        Linked
                      </span>
                    </>
                  )}
                  <span className="text-zinc-300 dark:text-zinc-600 text-[10px]">&middot;</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {formatRelativeTime(resume.updatedAt)}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(resume.id) }}
                  className="p-1.5 rounded-md text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 hover:!text-red-500 dark:hover:!text-red-400 hover:bg-white/50 dark:hover:bg-black/10 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Delete confirmation overlay */}
              {isConfirming && (
                <div
                  className="absolute inset-0 flex items-center justify-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm z-10 rounded-lg"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Delete this resume?</span>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-[11px] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
