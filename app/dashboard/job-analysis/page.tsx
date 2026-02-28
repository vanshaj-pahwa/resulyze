'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import { useJobData } from '@/hooks/useJobData'
import { useStepProgress } from '@/hooks/useStepProgress'

export default function JobAnalysisPage() {
  const router = useRouter()
  const { setJobData } = useJobData()
  const { markComplete } = useStepProgress()

  const handleJobDataExtracted = useCallback((data: any) => {
    setJobData(data)
    markComplete('job-analysis')
  }, [setJobData, markComplete])

  return (
    <Card>
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="!text-xl">Step 1: Job Description Analysis</CardTitle>
        <CardDescription>Upload or paste a job description to extract key requirements and skills</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <JobDescriptionProcessor onJobDataExtracted={handleJobDataExtracted} />
      </CardContent>
    </Card>
  )
}
