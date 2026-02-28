'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import InterviewPrep from '@/components/interview/InterviewPrep'
import { useJobData } from '@/hooks/useJobData'

export default function InterviewPrepPage() {
  const { jobData } = useJobData()

  const resumeData = typeof window !== 'undefined'
    ? { latexSource: localStorage.getItem('resulyze-latex-source') || '' }
    : null

  return (
    <Card>
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="!text-xl">Step 4: Interview Preparation</CardTitle>
        <CardDescription>Get AI-generated interview questions based on the job and your resume</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <InterviewPrep jobData={jobData} resumeData={resumeData} />
      </CardContent>
    </Card>
  )
}
