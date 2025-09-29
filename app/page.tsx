import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare, Users, Zap, Upload } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">RESULYZE</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <SignedOut>
              <SignInButton>
                <Button variant="outline" className="rounded-full px-3 md:px-6 text-sm md:text-base">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign In</span>
                </Button>
              </SignInButton>
              <SignInButton>
                <Button className="rounded-full px-3 md:px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm md:text-base">
                  <Upload className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            <span className="text-gray-700">Smart </span>
            <span className="text-black">feedback</span>
            <br />
            <span className="text-gray-500">for your </span>
            <span className="text-black">dream </span>
            <span className="text-blue-500">job</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-4">
            Drop your resume for an ATS score and improvement tips.
          </p>
          
          <SignedOut>
            <SignInButton>
              <Button size="lg" className="rounded-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Get Started Free
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">ATS Score Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get detailed feedback on how well your resume passes through ATS systems
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Smart Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered suggestions to improve your resume's content and structure
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Cover Letters</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate personalized cover letters tailored to specific job postings
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Interview Prep</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice with AI-generated questions based on your resume and target role
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}