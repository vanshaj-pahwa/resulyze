'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, Code2, PenSquare, Zap, Github } from 'lucide-react'
import ConnectionStatus from '@/components/ui/connection-status'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { StepsGuide } from '@/components/ui/steps-guide'
import { useApiKey } from '@/hooks/useApiKey'
import { ApiKeyDialog } from '@/components/ui/api-key-dialog'
import { ResumeManagerProvider } from '@/contexts/ResumeManagerContext'

const TABS = [
  { id: 'home', path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'job-analysis', path: '/dashboard/job-analysis', label: 'Job Analysis', icon: FileText },
  { id: 'resume', path: '/dashboard/resume', label: 'Resume', icon: Code2 },
  { id: 'cover-letter', path: '/dashboard/cover-letter', label: 'Cover Letter', icon: PenSquare },
  { id: 'interview-prep', path: '/dashboard/interview-prep', label: 'Interview', icon: Zap },
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
    if (tab.id === 'home') return pathname === '/dashboard'
    return pathname === tab.path
  }

  return (
    <ResumeManagerProvider>
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <ConnectionStatus />

      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        dismissible={isKeySet}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
            >
              Resulyze
            </Link>

            {/* Tabs — center */}
            <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => {
                const active = isActive(tab)
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => router.push(tab.path)}
                    title={tab.label}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-150 cursor-pointer
                      ${active
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1">
              <a
                href="https://github.com/vanshaj-pahwa/resulyze"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <ThemeToggle />
              <StepsGuide />
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="step-content-enter">
          {children}
        </div>
      </main>
    </div>
    </ResumeManagerProvider>
  )
}
