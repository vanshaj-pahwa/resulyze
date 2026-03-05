'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import LatexEditor from '@/components/latex/LatexEditor'
import { useJobData } from '@/hooks/useJobData'
import { useStepProgress } from '@/hooks/useStepProgress'
import { useResumeManagerContext } from '@/contexts/ResumeManagerContext'

export default function ResumePage() {
  const { jobData } = useJobData()
  const { markComplete } = useStepProgress()
  const resumeManager = useResumeManagerContext()
  const router = useRouter()

  const handleResumeDataChange = useCallback((data: any) => {
    markComplete('resume-optimization')
  }, [markComplete])

  // If no resumes exist, redirect to dashboard to pick a template
  if (resumeManager.mounted && resumeManager.resumes.length === 0) {
    router.replace('/dashboard')
    return null
  }

  return (
    <LatexEditor jobData={jobData} onResumeDataChange={handleResumeDataChange} />
  )
}
