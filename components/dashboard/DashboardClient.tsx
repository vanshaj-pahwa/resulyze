'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import ResumeBuilder from '@/components/resume/ResumeBuilder'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import InterviewPrep from '@/components/interview/InterviewPrep'
import { FileText, FileUp, PenSquare, Zap, CheckCircle } from 'lucide-react'
import ConnectionStatus from '@/components/ui/connection-status'
import { Button } from '@/components/ui/button'
import { StepsGuide } from '@/components/ui/steps-guide'

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
  const [currentStep, setCurrentStep] = useState<string>('job-analysis');
  const [jobData, setJobData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleResumeDataChange = useCallback((data: any) => {
    setResumeData(data);
    markStepComplete('resume-optimization');
  }, []);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(stepId);
      return newSet;
    });
  }, []);

  const handleJobDataExtracted = useCallback((data: any) => {
    setJobData(data);
    markStepComplete('job-analysis');
  }, [markStepComplete]);

  const steps: Step[] = [
    {
      id: 'job-analysis',
      title: 'Step 1: Job Description Analysis',
      shortTitle: 'Job Analysis',
      description: 'Upload or paste a job description to extract key requirements and skills',
      icon: <FileText className="w-5 h-5" />,
      requiredSteps: [],
      component: <JobDescriptionProcessor onJobDataExtracted={handleJobDataExtracted} />
    },
    {
      id: 'resume-optimization',
      title: 'Step 2: Resume Optimization',
      shortTitle: 'Resume',
      description: 'Upload your resume and optimize it based on the job requirements',
      icon: <FileUp className="w-5 h-5" />,
      requiredSteps: [],
      component: <ResumeBuilder jobData={jobData} onResumeDataChange={handleResumeDataChange} />
    },
    {
      id: 'cover-letter',
      title: 'Step 3: Cover Letter & Referrals',
      shortTitle: 'Cover Letter',
      description: 'Generate personalized cover letters and referral messages',
      icon: <PenSquare className="w-5 h-5" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
    },
    {
      id: 'interview-prep',
      title: 'Step 4: Interview Preparation',
      shortTitle: 'Interview',
      description: 'Get AI-generated interview questions based on the job and your resume',
      icon: <Zap className="w-5 h-5" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <InterviewPrep jobData={jobData} resumeData={resumeData} />
    }
  ];

  const isStepDisabled = (step: Step) => {
    return step.requiredSteps.some(reqStep => !completedSteps.has(reqStep));
  };

  useEffect(() => {
    const handleMoveToResumeOptimization = () => {
      if (jobData) {
        setCurrentStep('resume-optimization');
      }
    };

    window.addEventListener('move-to-resume-optimization', handleMoveToResumeOptimization);

    return () => {
      window.removeEventListener('move-to-resume-optimization', handleMoveToResumeOptimization);
    };
  }, [jobData]);

  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div>
      <ConnectionStatus />

      {/* Dashboard Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
            Resume <span className="heading-gradient">Optimizer</span>
          </h1>
          <p className="text-gray-600">Follow the steps below to create the perfect job application</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div>
          {/* Steps Navigation */}
          <div className="mb-8 glass-card rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-heading font-semibold text-gray-700 uppercase tracking-wider">Application Process</h3>
              <StepsGuide />
            </div>

            {/* Desktop view */}
            <div className="hidden lg:flex lg:flex-row lg:items-center gap-3">
              {steps.map((step, index) => (
                <div
                  key={`desktop-${step.id}`}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <Button
                    variant="ghost"
                    className={`group flex items-center gap-3 px-4 py-3 h-auto rounded-xl transition-all duration-300
                      ${isStepDisabled(step) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${currentStep === step.id
                        ? 'bg-blue-50 border border-blue-200 text-gray-900 shadow-glow-sm'
                        : completedSteps.has(step.id)
                          ? 'bg-green-50 border border-green-200 text-gray-900'
                          : 'hover:bg-gray-50 border border-transparent'
                      }
                    `}
                    onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                    disabled={isStepDisabled(step)}
                  >
                    <div className={`rounded-lg w-9 h-9 flex items-center justify-center transition-all duration-300
                      ${completedSteps.has(step.id)
                        ? 'bg-green-100 text-green-600'
                        : currentStep === step.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}>
                      {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {step.title}
                    </span>
                  </Button>

                  {index < steps.length - 1 && (
                    <div className={`h-px flex-grow mx-3 transition-colors duration-300 ${
                      completedSteps.has(step.id) ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Tablet view */}
            <div className="hidden md:flex lg:hidden justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                {steps.map((step, index) => (
                  <div key={`tablet-${step.id}`} className="flex flex-col items-center relative">
                    <Button
                      variant="ghost"
                      className={`group flex flex-col items-center justify-center gap-1.5 p-3 h-auto rounded-xl min-w-[90px] transition-all duration-300
                        ${isStepDisabled(step) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        ${currentStep === step.id
                          ? 'bg-blue-50 border border-blue-200 shadow-glow-sm'
                          : completedSteps.has(step.id)
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }
                      `}
                      onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                      disabled={isStepDisabled(step)}
                    >
                      <div className="relative">
                        <div className={`rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-300
                          ${completedSteps.has(step.id)
                            ? 'bg-green-100 text-green-600'
                            : currentStep === step.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                          {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        {!completedSteps.has(step.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-white text-xs font-medium w-4 h-4 rounded-full flex items-center justify-center border border-gray-200 text-gray-500">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-0.5 ${currentStep === step.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        {step.shortTitle}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile view */}
            <div className="flex md:hidden justify-center">
              <div className="grid grid-cols-4 gap-2 w-full max-w-md">
                {steps.map((step, index) => (
                  <div key={`mobile-${step.id}`} className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`group w-full p-2 h-auto flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-300
                        ${isStepDisabled(step) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                        ${currentStep === step.id
                          ? 'bg-blue-50 border border-blue-200 shadow-glow-sm'
                          : completedSteps.has(step.id)
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }
                      `}
                      onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                      disabled={isStepDisabled(step)}
                    >
                      <div className="relative">
                        <div className={`rounded-lg w-10 h-10 flex items-center justify-center transition-all duration-300
                          ${completedSteps.has(step.id)
                            ? 'bg-green-100 text-green-600'
                            : currentStep === step.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                          {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        {!completedSteps.has(step.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-white text-xs font-medium w-4 h-4 rounded-full flex items-center justify-center border border-gray-200 text-gray-500">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium group-hover:text-blue-700 ${currentStep === step.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        Step {index + 1}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="border-gray-200 bg-white shadow-soft">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <CardTitle className="text-xl font-heading text-gray-900">{currentStepData?.title}</CardTitle>
              <CardDescription className="text-gray-500">
                {currentStepData?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {currentStepData?.component}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
