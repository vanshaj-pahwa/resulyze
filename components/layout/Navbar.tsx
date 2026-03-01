'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Github, FileText, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isResumePage = pathname === '/dashboard/resume'

  useEffect(() => {
    setHasResume(!!localStorage.getItem('resulyze-latex-source'))
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
            Resulyze
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="https://github.com/vanshaj-pahwa/resulyze"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            {hasResume && !isResumePage && (
              <Link
                href="/dashboard/resume"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Your Resume</span>
              </Link>
            )}
            <ThemeToggle />
            {isDashboard ? (
              <Link href="/">
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Home className="w-3.5 h-3.5" />
                  Home
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 py-3 space-y-1 animate-fade-in">
            <a
              href="https://github.com/vanshaj-pahwa/resulyze"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            {hasResume && !isResumePage && (
              <Link
                href="/dashboard/resume"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <FileText className="w-4 h-4" />
                Your Resume
              </Link>
            )}
            <div className="px-3 pt-2">
              {isDashboard ? (
                <Link href="/" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gap-1.5" size="sm" variant="outline">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full" size="sm">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
