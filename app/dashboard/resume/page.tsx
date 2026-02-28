'use client'

import { useCallback } from 'react'
import LatexEditor from '@/components/latex/LatexEditor'
import { useJobData } from '@/hooks/useJobData'
import { useStepProgress } from '@/hooks/useStepProgress'

export default function ResumePage() {
  const { jobData } = useJobData()
  const { markComplete } = useStepProgress()

  const handleResumeDataChange = useCallback((data: any) => {
    markComplete('resume-optimization')
  }, [markComplete])

  return (
    <LatexEditor jobData={jobData} onResumeDataChange={handleResumeDataChange} />
  )
}
