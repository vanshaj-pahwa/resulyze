'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Code2, PenSquare, Zap, Check, Lock } from 'lucide-react'
import ConnectionStatus from '@/components/ui/connection-status'
import { StepsGuide } from '@/components/ui/steps-guide'
import { useApiKey } from '@/hooks/useApiKey'
import { ApiKeyDialog } from '@/components/ui/api-key-dialog'
import { useStepProgress } from '@/hooks/useStepProgress'

const STEPS = [
  { id: 'job-analysis', path: '/dashboard/job-analysis', shortTitle: 'Job Analysis', icon: FileText, requiredSteps: [] as string[] },
  { id: 'resume-optimization', path: '/dashboard/resume', shortTitle: 'Resume', icon: Code2, requiredSteps: [] as string[] },
  { id: 'cover-letter', path: '/dashboard/cover-letter', shortTitle: 'Cover Letter', icon: PenSquare, requiredSteps: ['job-analysis', 'resume-optimization'] },
  { id: 'interview-prep', path: '/dashboard/interview-prep', shortTitle: 'Interview', icon: Zap, requiredSteps: ['job-analysis', 'resume-optimization'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isKeySet, mounted } = useApiKey()
  const [showKeyDialog, setShowKeyDialog] = useState(false)
  const { completedSteps } = useStepProgress()

  useEffect(() => {
    if (mounted && !isKeySet) {
      setShowKeyDialog(true)
    }
  }, [mounted, isKeySet])

  const isStepDisabled = useCallback((step: typeof STEPS[0]) => {
    return step.requiredSteps.some(req => !completedSteps.has(req))
  }, [completedSteps])

  const getMissingStepNames = useCallback((step: typeof STEPS[0]) => {
    return step.requiredSteps
      .filter(req => !completedSteps.has(req))
      .map(req => STEPS.find(s => s.id === req)?.shortTitle || req)
  }, [completedSteps])

  const isActive = (step: typeof STEPS[0]) => {
    return pathname === step.path || (pathname === '/dashboard' && step.id === 'job-analysis')
  }

  return (
    <div>
      <ConnectionStatus />

      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        dismissible={isKeySet}
      />

      {/* Dashboard Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="font-heading font-bold text-zinc-900 dark:text-zinc-100">
            Resume Optimizer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Follow the steps to create the perfect job application
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Step Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-b border-zinc-200 dark:border-zinc-800 -mb-px">
              {STEPS.map((step, index) => {
                const disabled = isStepDisabled(step)
                const active = isActive(step)
                const completed = completedSteps.has(step.id)
                const missingSteps = getMissingStepNames(step)
                const Icon = step.icon

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (!disabled) router.push(step.path)
                    }}
                    disabled={disabled}
                    title={disabled ? `Complete ${missingSteps.join(' & ')} first` : step.shortTitle}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150
                      ${disabled
                        ? 'border-transparent text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                        : active
                          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                          : completed
                            ? 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer'
                            : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer'
                      }
                    `}
                  >
                    {disabled ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : completed ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{step.shortTitle}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </button>
                )
              })}
            </div>
            <StepsGuide />
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
