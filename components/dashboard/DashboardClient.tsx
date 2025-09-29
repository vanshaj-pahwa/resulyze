'use client'

import { useState, useCallback } from 'react'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobDescriptionProcessor from '@/components/job/JobDescriptionProcessor'
import ResumeBuilder from '@/components/resume/ResumeBuilder'
import CoverLetterGenerator from '@/components/cover-letter/CoverLetterGenerator'
import InterviewPrep from '@/components/interview/InterviewPrep'
import { FileText, MessageSquare, Zap, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DashboardStats from './DashboardStats'
import ConnectionStatus from '@/components/ui/connection-status'

export default function DashboardClient() {
  const [jobData, setJobData] = useState<any>(null)
  const [resumeData, setResumeData] = useState<any>(null)

  const handleResumeDataChange = useCallback((data: any) => {
    setResumeData(data)
  }, [])

  return (
    <div className="min-h-screen">
      <ConnectionStatus />
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Back to homepage</span>
                <span className="md:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-gray-800">RESULYZE</h1>
            </div>
          </div>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard: "bg-white/90 backdrop-blur-sm border-0 shadow-lg",
                  userButtonPopoverActionButton: "hover:bg-gray-100"
                }
              }}
              userProfileProps={{
                appearance: {
                  elements: {
                    card: "bg-white/90 backdrop-blur-sm"
                  }
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Resume Review</h2>
          <p className="text-sm md:text-base text-gray-600">Optimize your resume with AI-powered insights and feedback</p>
        </div>

        <DashboardStats resumeData={resumeData} jobData={jobData} />

        <Tabs defaultValue="job-description" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="job-description" 
              className="flex items-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md text-xs md:text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Job Analysis</span>
              <span className="sm:hidden">Job</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resume" 
              className="flex items-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md text-xs md:text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Resume</span>
            </TabsTrigger>
            <TabsTrigger 
              value="cover-letter" 
              className="flex items-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md text-xs md:text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Cover Letter</span>
              <span className="sm:hidden">Cover</span>
            </TabsTrigger>
            <TabsTrigger 
              value="interview" 
              className="flex items-center gap-1 md:gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md text-xs md:text-sm"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Interview Prep</span>
              <span className="sm:hidden">Interview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-description">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Job Description Analysis</CardTitle>
                <CardDescription>
                  Paste or upload a job description to extract key requirements and skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobDescriptionProcessor onJobDataExtracted={setJobData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Resume Builder</CardTitle>
                <CardDescription>
                  Create and customize your resume based on job requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeBuilder jobData={jobData} onResumeDataChange={handleResumeDataChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cover-letter">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Cover Letter & Referral Generator</CardTitle>
                <CardDescription>
                  Generate personalized cover letters and referral messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoverLetterGenerator jobData={jobData} resumeData={resumeData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview">
            <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Interview Preparation</CardTitle>
                <CardDescription>
                  Get AI-generated interview questions based on the job and your background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterviewPrep jobData={jobData} resumeData={resumeData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}