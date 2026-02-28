'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import { useJobData } from '@/hooks/useJobData'

export default function CoverLetterPage() {
  const { jobData } = useJobData()

  // Resume data is read from localStorage directly by the cover letter generator
  const resumeData = typeof window !== 'undefined'
    ? { latexSource: localStorage.getItem('resulyze-latex-source') || '' }
    : null

  return (
    <Card>
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="!text-xl">Step 3: Cover Letter & Referrals</CardTitle>
        <CardDescription>Generate personalized cover letters and referral messages</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
      </CardContent>
    </Card>
  )
}
