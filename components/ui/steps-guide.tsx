'use client'

import { useState } from 'react'
import { Button } from './button'
import { Info, X, FileText, Code2, PenSquare, Zap, CheckCircle2, Lock } from 'lucide-react'

const steps = [
  { num: 1, icon: FileText, title: 'Job Analysis', desc: 'Paste or upload a job description to extract key requirements and skills.' },
  { num: 2, icon: Code2, title: 'Resume Editor', desc: 'Edit your LaTeX resume with AI optimization tailored to the role.' },
  { num: 3, icon: PenSquare, title: 'Cover Letter', desc: 'Generate a personalized cover letter and referral message.' },
  { num: 4, icon: Zap, title: 'Interview Prep', desc: 'Practice with AI-generated questions and company research.' },
]

export function StepsGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">Guide</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="fixed sm:absolute top-1/2 left-1/2 sm:top-full sm:left-auto sm:right-0 -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0 sm:mt-2 w-[90vw] max-w-xs sm:w-80 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Workflow</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-4 py-3 space-y-0">
              {steps.map((step, i) => (
                <div key={step.num} className="flex gap-3 relative">
                  {/* Vertical connector */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-[13px] top-7 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
                  )}
                  {/* Icon circle */}
                  <div className="relative z-10 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <step.icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  {/* Content */}
                  <div className="pb-4 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-tight">
                      <span className="text-zinc-400 dark:text-zinc-500 mr-1.5">{step.num}.</span>
                      {step.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-900 dark:border-zinc-100" />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Locked</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
