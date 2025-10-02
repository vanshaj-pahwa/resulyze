'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import ResumeBuilder from '@/components/resume/ResumeBuilder'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import InterviewPrep from '@/components/interview/InterviewPrep'
import { FileText, FileUp, PenSquare, MessageSquare, Zap, CheckCircle } from 'lucide-react'
import DashboardStats from './DashboardStats'
import ConnectionStatus from '@/components/ui/connection-status'
import { Button } from '@/components/ui/button'
import { StepsGuide } from '@/components/ui/steps-guide'

interface Step {
  id: string;
  title: string;
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
      description: 'Upload or paste a job description to extract key requirements and skills',
      icon: <FileText className="w-5 h-5" />,
      requiredSteps: [],
      component: <JobDescriptionProcessor onJobDataExtracted={handleJobDataExtracted} />
    },
    {
      id: 'resume-optimization',
      title: 'Step 2: Resume Optimization',
      description: 'Upload your resume and optimize it based on the job requirements',
      icon: <FileUp className="w-5 h-5" />,
      requiredSteps: [],
      component: <ResumeBuilder jobData={jobData} onResumeDataChange={handleResumeDataChange} />
    },
    {
      id: 'cover-letter',
      title: 'Step 3: Cover Letter Generator',
      description: 'Generate a personalized cover letter based on your resume and the job',
      icon: <PenSquare className="w-5 h-5" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
    },
    {
      id: 'interview-prep',
      title: 'Step 4: Interview Preparation',
      description: 'Get AI-generated interview questions based on the job and your resume',
      icon: <Zap className="w-5 h-5" />,
      requiredSteps: ['job-analysis', 'resume-optimization'],
      component: <InterviewPrep jobData={jobData} resumeData={resumeData} />
    }
  ];

  const isStepDisabled = (step: Step) => {
    return step.requiredSteps.some(reqStep => !completedSteps.has(reqStep));
  };

  // Add event listener for moving to resume optimization when user clicks the button
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

  return (
    <div>
      <ConnectionStatus />

      <div className="bg-gradient-to-b from-blue-50 to-white py-8 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Resume Optimizer</h1>
          <p className="text-lg text-gray-600">Follow the steps below to create the perfect job application</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <DashboardStats resumeData={resumeData} jobData={jobData} />
        
        <div className="mt-10">
          {/* Timeline Steps Navigation */}
          <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Application Process</h3>
              <StepsGuide />
            </div>
            {/* Desktop view - visible only on large screens */}
            <div className="hidden lg:flex lg:flex-row lg:items-center gap-8">
              {steps.map((step, index) => (
                <div 
                  key={`desktop-${step.id}`} 
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <Button
                    variant={currentStep === step.id ? "default" : "ghost"}
                    className={`group flex items-center gap-2 
                      ${isStepDisabled(step) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50 hover:border hover:border-blue-200'}
                      ${currentStep === step.id ? 'border border-blue-200 bg-blue-50' : ''}
                      ${completedSteps.has(step.id) && currentStep !== step.id ? 'border border-green-200' : ''}
                    `}
                    onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                    disabled={isStepDisabled(step)}
                  >
                    <div className={`rounded-full w-8 h-8 flex items-center justify-center 
                      ${completedSteps.has(step.id) ? 'bg-green-100 text-green-600' : 
                        currentStep === step.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                      {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                    </div>
                    <span className={`text-sm group-hover:text-blue-700 ${currentStep === step.id ? 'text-blue-700 font-medium' : ''}`}>
                      {step.title}
                    </span>
                  </Button>
                  
                  {/* Connector line between steps */}
                  {index < steps.length - 1 && (
                    <div className="h-0.5 bg-gray-200 flex-grow mx-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Tablet view - visible only on medium screens */}
            <div className="hidden md:flex lg:hidden justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                {steps.map((step, index) => (
                  <div 
                    key={`tablet-${step.id}`} 
                    className="flex flex-col items-center relative"
                  >
                    <Button
                      variant="ghost"
                      className={`
                        group flex flex-col items-center justify-center gap-1 p-2 h-auto
                        ${isStepDisabled(step) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                        ${completedSteps.has(step.id) && currentStep !== step.id ? 'border border-green-200' : ''}
                        ${currentStep === step.id ? 'bg-blue-50 border border-blue-200' : ''}
                        rounded-lg min-w-[80px]
                      `}
                      onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                      disabled={isStepDisabled(step)}
                    >
                      <div className="relative">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center 
                          ${completedSteps.has(step.id) ? 'bg-green-100 text-green-600' : 
                            currentStep === step.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                          {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        {/* Overlay the step number to ensure it remains visible in any state */}
                        {!completedSteps.has(step.id) && (
                          <div className="absolute bottom-0 right-0 bg-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center border border-gray-200">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-1 text-center group-hover:text-blue-700 ${currentStep === step.id ? 'text-blue-700' : ''}`}>
                        Step {index + 1}
                      </span>
                    </Button>

                    {/* Connector between steps (visible only on wider tablets) */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block lg:hidden xl:block absolute right-[-24px] top-[40%] h-0.5 bg-gray-200 w-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mobile view - visible only on small screens */}
            <div className="flex md:hidden justify-center">
              <div className="grid grid-cols-4 gap-2 w-full max-w-md">
                {steps.map((step, index) => (
                  <div key={`mobile-${step.id}`} className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`
                        group w-full p-2 h-auto flex flex-col items-center justify-center gap-1 rounded-md
                        ${isStepDisabled(step) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50 hover:border hover:border-blue-200'}
                        ${completedSteps.has(step.id) && currentStep !== step.id ? 'border border-green-200' : ''}
                        ${currentStep === step.id ? 'bg-blue-50 border border-blue-200' : ''}
                      `}
                      onClick={() => !isStepDisabled(step) && setCurrentStep(step.id)}
                      disabled={isStepDisabled(step)}
                    >
                      <div className="relative">
                        <div className={`rounded-full w-10 h-10 flex items-center justify-center 
                          ${completedSteps.has(step.id) ? 'bg-green-100 text-green-600' : 
                            currentStep === step.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                          {completedSteps.has(step.id) ? <CheckCircle className="w-5 h-5" /> : step.icon}
                        </div>
                        {/* Overlay the step number to ensure it remains visible in any state */}
                        {!completedSteps.has(step.id) && (
                          <div className="absolute bottom-0 right-0 bg-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center border border-gray-200">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-1 group-hover:text-blue-700 ${currentStep === step.id ? 'text-blue-700' : ''}`}>
                        Step {index + 1}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current Step Content */}
          <Card className="border border-gray-200 shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl text-gray-800">{steps.find(s => s.id === currentStep)?.title}</CardTitle>
              <CardDescription>
                {steps.find(s => s.id === currentStep)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {steps.find(s => s.id === currentStep)?.component}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}