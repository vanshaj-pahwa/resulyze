import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  MessageSquare, 
  Users, 
  Zap, 
  Upload, 
  Star, 
  CheckCircle, 
  Award, 
  ChevronRight
} from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                <span className="block">Land your dream job</span>
                <span className="text-blue-600">with AI-powered resumes</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Create ATS-optimized resumes and cover letters in minutes. Get tailored feedback and stand out to recruiters.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="lg" className="rounded-md px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                      Create Your Resume Now
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="rounded-md px-6 py-3 text-base bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
                <Link href="#features" scroll={false}>
                  <Button size="lg" variant="outline" className="rounded-md px-6 py-3 text-base border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto">
                    See Features
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl animate-pulse" />
              <div className="relative shadow-2xl rounded-xl overflow-hidden border border-gray-200 bg-white">
                {/* This would be a screenshot or mockup of the resume builder */}
                <div className="aspect-[4/3] bg-white p-4">
                  <div className="h-full rounded bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Resume Builder</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Professional resumes that stand out and get noticed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/30 rounded-full blur-3xl" />
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-24 h-24 bg-yellow-100 rounded-full blur-2xl opacity-60" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-purple-100 rounded-full blur-2xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need For Your Job Search</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your job application process with our comprehensive suite of tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold">ATS Score Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Get detailed feedback on how well your resume passes through ATS systems with actionable improvements
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button variant="link" className="text-blue-600 p-0 h-auto font-medium flex items-center">
                      Try it now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Resume Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Create professional resumes with AI-powered suggestions to highlight your skills and experience
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button variant="link" className="text-blue-600 p-0 h-auto font-medium flex items-center">
                      Try it now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Cover Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Generate personalized cover letters tailored to specific job descriptions in seconds
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard?tab=cover-letter">
                    <Button variant="link" className="text-blue-600 p-0 h-auto font-medium flex items-center">
                      Try it now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-semibold">Interview Prep</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Practice with AI-generated questions based on your resume and target role to ace your interviews
                </CardDescription>
                <div className="mt-4">
                  <Link href="/dashboard?tab=interview">
                    <Button variant="link" className="text-blue-600 p-0 h-auto font-medium flex items-center">
                      Try it now <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to create professional, ATS-optimized resumes and land more interviews
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Resume</h3>
              <p className="text-gray-600">
                Upload your existing resume or create a new one from scratch with our easy-to-use builder
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get AI Feedback</h3>
              <p className="text-gray-600">
                Receive instant analysis and optimization suggestions tailored to your target job
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-md">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Land Interviews</h3>
              <p className="text-gray-600">
                Apply with confidence using your optimized resume and tailored cover letter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Success stories from professionals who found their dream jobs with Resulyze
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                id: 'testimonial-1',
                text: "Resulyze helped me optimize my resume and prepare for interviews. I landed a job at a top tech company within 2 weeks of using the platform!",
                name: "Sarah Johnson",
                role: "Software Engineer"
              },
              {
                id: 'testimonial-2',
                text: "The ATS optimization feature is incredible. My application response rate increased by over 70% after using Resulyze.",
                name: "Michael Chen",
                role: "Marketing Manager"
              },
              {
                id: 'testimonial-3',
                text: "The interview preparation tool helped me feel confident and prepared. The AI-generated questions were spot on!",
                name: "Jessica Williams",
                role: "Data Analyst"
              }
            ].map((testimonial) => (
              <Card key={testimonial.id} className="border border-gray-200 shadow-md bg-white">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={`star-${testimonial.id}-${star}`} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Start Your Job Search Journey Today
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join thousands of professionals who have transformed their careers with Resulyze
            </p>
            
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="rounded-md px-8 py-3 text-lg bg-white text-blue-600 hover:bg-blue-50">
                  Create Your Free Account
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="rounded-md px-8 py-3 text-lg bg-white text-blue-600 hover:bg-blue-50">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
            
            <div className="mt-6 text-blue-100 flex flex-wrap justify-center gap-x-6 gap-y-2">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Free to get started</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}