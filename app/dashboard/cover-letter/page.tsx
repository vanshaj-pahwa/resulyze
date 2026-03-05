'use client'

import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import { useJobData } from '@/hooks/useJobData'

export default function CoverLetterPage() {
  const { jobData } = useJobData()

  const resumeData = typeof window !== 'undefined'
    ? { latexSource: localStorage.getItem('resulyze-latex-source') || '' }
    : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Cover Letter & Referrals
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Generate personalized cover letters and referral messages.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
      </div>
    </div>
  )
}
