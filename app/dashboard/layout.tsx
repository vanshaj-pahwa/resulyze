'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Code2, PenSquare, Zap } from 'lucide-react'
import ConnectionStatus from '@/components/ui/connection-status'
import { StepsGuide } from '@/components/ui/steps-guide'
import { useApiKey } from '@/hooks/useApiKey'
import { ApiKeyDialog } from '@/components/ui/api-key-dialog'

const TABS = [
  { id: 'job-analysis', path: '/dashboard/job-analysis', shortTitle: 'Job Analysis', icon: FileText },
  { id: 'resume', path: '/dashboard/resume', shortTitle: 'Resume', icon: Code2 },
  { id: 'cover-letter', path: '/dashboard/cover-letter', shortTitle: 'Cover Letter', icon: PenSquare },
  { id: 'interview-prep', path: '/dashboard/interview-prep', shortTitle: 'Interview', icon: Zap },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isKeySet, mounted } = useApiKey()
  const [showKeyDialog, setShowKeyDialog] = useState(false)

  useEffect(() => {
    if (mounted && !isKeySet) {
      setShowKeyDialog(true)
    }
  }, [mounted, isKeySet])

  const isActive = (tab: typeof TABS[0]) => {
    return pathname === tab.path || (pathname === '/dashboard' && tab.id === 'job-analysis')
  }

  return (
    <div>
      <ConnectionStatus />

      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        dismissible={isKeySet}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-4 max-w-[1800px] mx-auto">
        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-b border-zinc-200 dark:border-zinc-800 -mb-px">
              {TABS.map((tab) => {
                const active = isActive(tab)
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => router.push(tab.path)}
                    title={tab.shortTitle}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 cursor-pointer
                      ${active
                        ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.shortTitle}</span>
                  </button>
                )
              })}
            </div>
            <StepsGuide />
          </div>
        </div>

        {/* Content */}
        <div className="step-content-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
