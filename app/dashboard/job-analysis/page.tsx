'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Job Description Analysis
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload or paste a job description to extract key requirements and skills.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <JobDescriptionProcessor
          onJobDataExtracted={handleJobDataExtracted}
          initialData={jobData}
          onClear={handleClear}
          history={history}
          onSelectHistory={handleSelectFromHistory}
          onRemoveHistory={removeFromHistory}
        />
      </div>
    </div>
  )
}
