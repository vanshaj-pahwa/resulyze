'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import { useJobData } from '@/hooks/useJobData'
import { useStepProgress } from '@/hooks/useStepProgress'
import { useJdHistory } from '@/hooks/useJdHistory'

export default function JobAnalysisPage() {
  const router = useRouter()
  const { jobData, setJobData, clearJobData } = useJobData()
  const { markComplete, resetStep } = useStepProgress()
  const { history, addToHistory, removeFromHistory } = useJdHistory()

  const handleJobDataExtracted = useCallback((data: any) => {
    setJobData(data)
    markComplete('job-analysis')
    addToHistory(data)
  }, [setJobData, markComplete, addToHistory])

  const handleClear = useCallback(() => {
    clearJobData()
    resetStep('job-analysis')
  }, [clearJobData, resetStep])

  const handleSelectFromHistory = useCallback((historyJobData: any) => {
    setJobData(historyJobData)
    markComplete('job-analysis')
  }, [setJobData, markComplete])

  return (
    <Card>
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="!text-xl">Job Description Analysis</CardTitle>
        <CardDescription>Upload or paste a job description to extract key requirements and skills</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <JobDescriptionProcessor
          onJobDataExtracted={handleJobDataExtracted}
          initialData={jobData}
          onClear={handleClear}
          history={history}
          onSelectHistory={handleSelectFromHistory}
          onRemoveHistory={removeFromHistory}
        />
      </CardContent>
    </Card>
  )
}
