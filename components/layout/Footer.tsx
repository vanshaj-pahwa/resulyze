'use client'

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Github } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="font-heading font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Resulyze
          </Link>

          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <a
              href="https://github.com/vanshaj-pahwa/resulyze"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span>&copy; {new Date().getFullYear()} Resulyze</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
