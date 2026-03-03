'use client'

import { X, Check } from 'lucide-react'
import { TEMPLATES, type ResumeTemplate } from '@/lib/templates'
import { DEFAULT_LATEX_SOURCE } from './defaultTemplate'

// ─── Document preview mockups ────────────────────────────────────────────────

function ModernPreview() {
  return (
    <div className="w-full aspect-[8.5/11] bg-white dark:bg-zinc-950 rounded p-2.5 overflow-hidden flex flex-col gap-1.5">
      {/* Centered header */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-14 h-2 bg-zinc-800 dark:bg-zinc-100 rounded-[2px]" />
        <div className="w-20 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-[2px]" />
      </div>
      {/* Profile section */}
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-8 h-1.5 bg-zinc-700 dark:bg-zinc-200 rounded-[1px]" />
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
        <div className="w-3/4 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px] mt-0.5" />
      </div>
      {/* Skills section */}
      <div>
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-6 h-1.5 bg-zinc-700 dark:bg-zinc-200 rounded-[1px]" />
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="space-y-0.5">
          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
          <div className="w-5/6 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
          <div className="w-4/5 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
        </div>
      </div>
      {/* Experience section */}
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-0.5">
          <div className="w-10 h-1.5 bg-zinc-700 dark:bg-zinc-200 rounded-[1px]" />
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="space-y-1">
          <div>
            <div className="flex justify-between mb-0.5">
              <div className="w-14 h-1.5 bg-zinc-600 dark:bg-zinc-300 rounded-[1px]" />
              <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-5/6 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-4/5 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-0.5">
              <div className="w-12 h-1.5 bg-zinc-600 dark:bg-zinc-300 rounded-[1px]" />
              <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
            </div>
            <div className="space-y-0.5 pl-1">
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-4/5 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClassicPreview() {
  return (
    <div className="w-full aspect-[8.5/11] bg-white dark:bg-zinc-950 rounded p-2.5 overflow-hidden flex flex-col gap-1.5">
      {/* Large centered name */}
      <div className="flex flex-col items-center gap-0.5 pb-1 border-b border-zinc-200 dark:border-zinc-700">
        <div className="w-18 h-2.5 bg-zinc-800 dark:bg-zinc-100 rounded-[1px]" style={{ width: '72px' }} />
        <div className="w-24 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-[1px]" />
      </div>
      {/* ALL CAPS sections with full-width rules */}
      {['', '', ''].map((_, i) => (
        <div key={i}>
          <div className="w-10 h-1.5 bg-zinc-700 dark:bg-zinc-200 rounded-[1px] mb-0.5" />
          <div className="w-full h-px bg-zinc-400 dark:bg-zinc-500 mb-1" />
          {i === 0 && (
            <div className="space-y-0.5">
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-3/4 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
            </div>
          )}
          {i === 1 && (
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <div className="w-12 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-[1px]" />
                <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
              </div>
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-5/6 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-4/5 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
            </div>
          )}
          {i === 2 && (
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <div className="w-10 h-1.5 bg-zinc-500 dark:bg-zinc-400 rounded-[1px]" />
                <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
              </div>
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
              <div className="w-3/4 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function MinimalPreview() {
  return (
    <div className="w-full aspect-[8.5/11] bg-white dark:bg-zinc-950 rounded p-2.5 overflow-hidden flex flex-col gap-1.5">
      {/* Name left-aligned + contact right */}
      <div className="flex justify-between items-baseline mb-1">
        <div className="w-14 h-2 bg-zinc-800 dark:bg-zinc-100 rounded-[1px]" />
        <div className="w-16 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-[1px]" />
      </div>
      {/* Thin rule sections */}
      {[10, 8, 6, 5].map((lines, i) => (
        <div key={i}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-7 h-1 bg-zinc-500 dark:bg-zinc-400 rounded-[1px]" />
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" style={{ height: '0.3px' }} />
          </div>
          <div className="space-y-0.5">
            {i < 2 && (
              <div className="flex justify-between mb-0.5">
                <div className="w-12 h-1.5 bg-zinc-600 dark:bg-zinc-300 rounded-[1px]" />
                <div className="w-8 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
              </div>
            )}
            {Array.from({ length: Math.min(lines, 3) }).map((_, j) => (
              <div
                key={j}
                className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]"
                style={{ width: `${100 - j * 10}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarPreview() {
  return (
    <div className="w-full aspect-[8.5/11] bg-white dark:bg-zinc-950 rounded overflow-hidden flex flex-col">
      {/* Full-width header */}
      <div className="px-2.5 pt-2.5 pb-1.5 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex justify-between items-start">
          <div className="w-16 h-2.5 bg-zinc-800 dark:bg-zinc-100 rounded-[1px]" />
          <div className="w-10 h-1.5 bg-blue-500/60 rounded-[1px]" />
        </div>
        <div className="w-24 h-1 bg-zinc-400 dark:bg-zinc-500 rounded-[1px] mt-0.5" />
      </div>
      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[30%] bg-zinc-50 dark:bg-zinc-900 px-1.5 py-1.5 flex flex-col gap-1.5 border-r border-zinc-200 dark:border-zinc-800">
          {['Skills', 'Education', 'Certs'].map((label, i) => (
            <div key={i}>
              <div className="flex items-center gap-0.5 mb-0.5">
                <div className="w-5 h-1 bg-blue-500/70 rounded-[1px]" />
                <div className="flex-1 h-px bg-blue-300/50 dark:bg-blue-700/50" />
              </div>
              <div className="space-y-0.5">
                {Array.from({ length: i === 0 ? 4 : 2 }).map((_, j) => (
                  <div key={j} className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-[1px]" />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Right main */}
        <div className="flex-1 px-1.5 py-1.5 flex flex-col gap-1.5">
          {['Profile', 'Experience', 'Projects'].map((label, i) => (
            <div key={i} className="flex-1">
              <div className="flex items-center gap-0.5 mb-0.5">
                <div className="w-6 h-1.5 bg-blue-500/70 rounded-[1px]" />
                <div className="flex-1 h-px bg-blue-300/50 dark:bg-blue-700/50" />
              </div>
              <div className="space-y-0.5">
                {i > 0 && (
                  <div className="flex justify-between mb-0.5">
                    <div className="w-10 h-1.5 bg-zinc-600 dark:bg-zinc-300 rounded-[1px]" />
                    <div className="w-7 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-[1px]" />
                  </div>
                )}
                {Array.from({ length: i === 1 ? 3 : 2 }).map((_, j) => (
                  <div key={j} className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-[1px]" style={{ width: `${95 - j * 8}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PREVIEWS: Record<string, React.FC> = {
  modern: ModernPreview,
  classic: ClassicPreview,
  minimal: MinimalPreview,
  sidebar: SidebarPreview,
}

// ─── Detect which template is currently active ───────────────────────────────

function detectActiveTemplate(source: string): string {
  // Normalize for comparison
  const trimmed = source.trim()
  for (const t of TEMPLATES) {
    if (trimmed === t.source.trim()) return t.id
  }
  // Partial heuristics
  if (trimmed.includes('\\usepackage{palatino}')) return 'classic'
  if (trimmed.includes('\\begin{minipage}[t]{0.30')) return 'sidebar'
  if (trimmed.includes('\\usepackage{XCharter}') || trimmed.includes('\\minsec{')) return 'minimal'
  return 'modern'
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TemplatePickerModalProps {
  currentSource: string
  onApply: (template: ResumeTemplate) => void
  onClose: () => void
}

export default function TemplatePickerModal({ currentSource, onApply, onClose }: TemplatePickerModalProps) {
  const activeId = detectActiveTemplate(currentSource)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#111111] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Choose a Template</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Your current resume will be saved to history before switching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 overflow-y-auto">
          {TEMPLATES.map((template) => {
            const Preview = PREVIEWS[template.id]
            const isActive = template.id === activeId
            return (
              <button
                key={template.id}
                onClick={() => onApply(template)}
                className={`group relative flex flex-col rounded-lg border-2 transition-all duration-150 overflow-hidden text-left
                  ${isActive
                    ? 'border-blue-500 dark:border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                    : 'border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }
                `}
              >
                {/* Active checkmark */}
                {isActive && (
                  <div className="absolute top-2 right-2 z-10 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Preview thumbnail */}
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                  <Preview />
                </div>

                {/* Card footer */}
                <div className="p-2.5 bg-white dark:bg-zinc-900">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
                      {template.name}
                    </p>
                    {isActive && (
                      <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1 py-0.5 rounded shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-0.5 mt-1.5">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
            Click any template to apply it. Content from different people is sample data only.
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.08] rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
