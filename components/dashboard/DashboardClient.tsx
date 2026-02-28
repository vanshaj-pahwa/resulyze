'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import LatexEditor from '@/components/latex/LatexEditor'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import InterviewPrep from '@/components/interview/InterviewPrep'
import { FileText, Code2, PenSquare, Zap, Check, Lock } from 'lucide-react'
import ConnectionStatus from '@/components/ui/connection-status'
import { StepsGuide } from '@/components/ui/steps-guide'
import { useApiKey } from '@/hooks/useApiKey'
import { ApiKeyDialog } from '@/components/ui/api-key-dialog'

interface Step {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ReactNode;
  requiredSteps: string[];
  component: React.ReactNode;
}

export default function DashboardClient() {
  const [currentStep, setCurrentStep] = useState<string>('job-analysis')
  const [jobData, setJobData] = useState<any>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)
  const { isKeySet, mounted } = useApiKey()
  const [showKeyDialog, setShowKeyDialog] = useState(false)

  // Show API key dialog if no key is set
  useEffect(() => {
    if (mounted && !isKeySet) {
      setShowKeyDialog(true)
    }
  }, [mounted, isKeySet])

  const handleResumeDataChange = useCallback((data: any) => {
    setResumeData(data)
    markStepComplete('resume-optimization')
  }, [])

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      newSet.add(stepId)
      return newSet
    })
  }, [])

  const handleJobDataExtracted = useCallback((data: any) => {
    setJobData(data)
    markStepComplete('job-analysis')
  }, [markStepComplete])

  const switchStep = useCallback((stepId: string) => {
    if (stepId !== currentStep) {
      setCurrentStep(stepId)
    }
  }, [currentStep])

  const steps: Step[] = [
    {
      id: 'job-analysis',
      title: 'Step 1: Job Description Analysis',
      shortTitle: 'Job Analysis',
      description: 'Upload or paste a job description to extract key requirements and skills',
      icon: <FileText className="w-4 h-4" />,
      requiredSteps: [],
      component: <JobDescriptionProcessor onJobDataExtracted={handleJobDataExtracted} />
    },
    {
      id: 'resume-optimization',
      title: 'Step 2: LaTeX Resume Editor',
      shortTitle: 'Resume',
      description: 'Write your resume in LaTeX and compile to PDF',
      icon: <Code2 className="w-4 h-4" />,
      requiredSteps: [],
      component: <LatexEditor jobData={jobData} onResumeDataChange={handleResumeDataChange} />
    },
    {
      id: 'cover-letter',
      title: 'Step 3: Cover Letter & Referrals',
      shortTitle: 'Cover Letter',
      description: 'Generate personalized cover letters and referral messages',
      icon: <PenSquare className="w-4 h-4" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
    },
    {
      id: 'interview-prep',
      title: 'Step 4: Interview Preparation',
      shortTitle: 'Interview',
      description: 'Get AI-generated interview questions based on the job and your resume',
      icon: <Zap className="w-4 h-4" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <InterviewPrep jobData={jobData} resumeData={resumeData} />
    }
  ]

  const isStepDisabled = (step: Step) => {
    return step.requiredSteps.some(reqStep => !completedSteps.has(reqStep))
  }

  const getMissingStepNames = (step: Step) => {
    return step.requiredSteps
      .filter(reqStep => !completedSteps.has(reqStep))
      .map(reqStep => steps.find(s => s.id === reqStep)?.shortTitle || reqStep)
  }

  useEffect(() => {
    const handleMoveToResumeOptimization = () => {
      if (jobData) {
        switchStep('resume-optimization')
      }
    }

    window.addEventListener('move-to-resume-optimization', handleMoveToResumeOptimization)
    return () => {
      window.removeEventListener('move-to-resume-optimization', handleMoveToResumeOptimization)
    }
  }, [jobData, switchStep])

  const currentStepData = steps.find(s => s.id === currentStep)

  return (
    <div>
      <ConnectionStatus />

      {/* API Key Dialog */}
      <ApiKeyDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
        dismissible={isKeySet}
      />

      {/* Dashboard Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="font-heading font-bold text-zinc-900 dark:text-zinc-100">
            Resume Optimizer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Follow the steps to create the perfect job application
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Step Navigation — Horizontal tab bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center overflow-x-auto no-scrollbar gap-1 border-b border-zinc-200 dark:border-zinc-800 -mb-px">
              {steps.map((step, index) => {
                const disabled = isStepDisabled(step)
                const isActive = currentStep === step.id
                const isCompleted = completedSteps.has(step.id)
                const missingSteps = getMissingStepNames(step)

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => !disabled && switchStep(step.id)}
                    disabled={disabled}
                    title={disabled ? `Complete ${missingSteps.join(' & ')} first` : step.shortTitle}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150
                      ${disabled
                        ? 'border-transparent text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                        : isActive
                          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                          : isCompleted
                            ? 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer'
                            : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer'
                      }
                    `}
                  >
                    {disabled ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : isCompleted ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      step.icon
                    )}
                    <span className="hidden sm:inline">{step.shortTitle}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </button>
                )
              })}
            </div>
            <StepsGuide />
          </div>
        </div>

        {/* Step Content */}
        <div ref={contentRef} className="step-content-enter">
          {currentStep === 'resume-optimization' ? (
            currentStepData?.component
          ) : (
            <Card>
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="!text-xl">{currentStepData?.title}</CardTitle>
                <CardDescription>{currentStepData?.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {currentStepData?.component}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
