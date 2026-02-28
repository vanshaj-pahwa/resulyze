'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ApiKeyIndicator } from '@/components/ui/api-key-indicator'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6">
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
            <ApiKeyIndicator />
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
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
            <div className="px-3 py-1">
              <ApiKeyIndicator />
            </div>
            <div className="px-3 pt-2">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button className="w-full" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
