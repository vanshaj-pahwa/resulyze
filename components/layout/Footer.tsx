import React from "react"
import Link from "next/link"
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 sm:px-6 py-6">
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
