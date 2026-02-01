import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  FileText,
  MessageSquare,
  Users,
  Zap,
  Upload,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Shield
} from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/80 bg-blue-50/50 mb-8 animate-fade-up">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wider">AI-Powered Career Tools</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold tracking-tight mb-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <span className="block text-gray-900">Resumes that</span>
              <span className="heading-gradient">get you hired</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
              Build ATS-optimized resumes, generate tailored cover letters, and prepare for interviews with AI that understands what recruiters look for.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-glow-md hover:shadow-glow-lg transition-all duration-300 text-base px-8 py-3 gap-2">
                  Start Building Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features" scroll={false}>
                <Button size="lg" variant="outline" className="rounded-lg text-base px-8 py-3 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
              {[
                { icon: Shield, text: 'Free to use' },
                { icon: Zap, text: 'AI-powered' },
                { icon: Target, text: 'ATS optimized' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-gray-500">
                  <item.icon className="w-4 h-4 text-blue-500/70" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 relative bg-white/50">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200/60 bg-blue-50/30 mb-6">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Everything you need</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Your complete career toolkit
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From resume building to interview prep, every tool works together to maximize your chances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 stagger-children">
            {[
              {
                icon: Target,
                title: 'ATS Score Analysis',
                description: 'Get detailed feedback on how well your resume passes through Applicant Tracking Systems.',
                color: 'from-blue-100 to-blue-50',
                iconColor: 'text-blue-600',
                href: '/dashboard',
              },
              {
                icon: FileText,
                title: 'Resume Builder',
                description: 'Create professional resumes with AI-powered suggestions for skills and experience.',
                color: 'from-emerald-100 to-emerald-50',
                iconColor: 'text-emerald-600',
                href: '/dashboard',
              },
              {
                icon: Users,
                title: 'Cover Letters',
                description: 'Generate personalized cover letters tailored to specific job descriptions.',
                color: 'from-violet-100 to-violet-50',
                iconColor: 'text-violet-600',
                href: '/dashboard?tab=cover-letter',
              },
              {
                icon: MessageSquare,
                title: 'Referral Messages',
                description: 'Craft professional networking messages to request referrals from connections.',
                color: 'from-cyan-100 to-cyan-50',
                iconColor: 'text-cyan-600',
                href: '/dashboard?tab=cover-letter',
              },
              {
                icon: Zap,
                title: 'Interview Prep',
                description: 'Practice with AI-generated questions based on your resume and target role.',
                color: 'from-orange-100 to-orange-50',
                iconColor: 'text-orange-600',
                href: '/dashboard?tab=interview',
              },
            ].map((feature) => (
              <Link key={feature.title} href={feature.href} className="group">
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 text-base mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Try it now <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200/60 bg-blue-50/30 mb-6">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Simple process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Three steps to your dream job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload, optimize, and apply with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Resume',
                description: 'Upload your existing resume or create a new one from scratch with our intuitive builder.',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'Get AI Feedback',
                description: 'Receive instant analysis and optimization suggestions tailored to your target job.',
              },
              {
                step: '03',
                icon: TrendingUp,
                title: 'Land Interviews',
                description: 'Apply with your optimized resume, tailored cover letter, and interview preparation.',
              },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="glass-card rounded-xl p-8 h-full text-center">
                  <div className="text-6xl font-heading font-bold text-gray-100 mb-6 group-hover:text-blue-100 transition-colors duration-300">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-blue-100 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-heading font-semibold text-gray-900 text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 relative bg-white/50">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200/60 bg-blue-50/30 mb-6">
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Trusted by professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Success stories from people who transformed their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto stagger-children">
            {[
              {
                id: 'testimonial-1',
                text: "Resulyze helped me optimize my resume and prepare for interviews. I landed a job at a top tech company within 2 weeks of using the platform!",
                name: "Sarah Johnson",
                role: "Software Engineer",
                initials: "SJ",
              },
              {
                id: 'testimonial-2',
                text: "The ATS optimization feature is incredible. My application response rate increased by over 70% after using Resulyze.",
                name: "Michael Chen",
                role: "Marketing Manager",
                initials: "MC",
              },
              {
                id: 'testimonial-3',
                text: "The interview preparation tool helped me feel confident and prepared. The AI-generated questions were spot on!",
                name: "Jessica Williams",
                role: "Data Analyst",
                initials: "JW",
              }
            ].map((testimonial) => (
              <div key={testimonial.id} className="glass-card rounded-xl p-8">
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={`star-${testimonial.id}-${star}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border border-gray-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto relative">
            <div className="rounded-2xl p-10 md:p-16 text-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
              {/* Background effects */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl" />

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                  Ready to land your dream job?
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                  Join professionals who have transformed their careers with AI-powered resume optimization.
                </p>

                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-base px-8 py-3 gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Free to get started</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
