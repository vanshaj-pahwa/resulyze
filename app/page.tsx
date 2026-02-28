'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { FileText, Code2, PenSquare, Zap, ArrowRight, Github } from 'lucide-react'

const headlines = [
  { top: 'Land the role.', bottom: 'Not just the interview.' },
  { top: 'Your resume,', bottom: 'optimized by AI.' },
  { top: 'One job posting.', bottom: 'One perfect application.' },
  { top: 'Stop guessing.', bottom: 'Start getting callbacks.' },
  { top: 'Write less.', bottom: 'Get hired more.' },
]

const features = [
  {
    icon: FileText,
    title: 'Intelligent Job Analysis',
    description: 'Drop in any job posting. Our AI dissects it in seconds, surfacing the exact skills, qualifications, and keywords that matter to hiring teams.',
  },
  {
    icon: Code2,
    title: 'LaTeX Resume Editor',
    description: 'Write in LaTeX, preview in real time. One click optimizes your resume against the job description so every bullet point earns its place.',
  },
  {
    icon: PenSquare,
    title: 'Cover Letters & Referrals',
    description: 'Generate compelling, role-specific cover letters and concise referral messages that sound like you, not a template.',
  },
  {
    icon: Zap,
    title: 'Interview Preparation',
    description: 'Practice with AI-generated questions drawn from the actual job requirements, complete with model answers and company research.',
  },
]

const steps = [
  {
    num: 1,
    title: 'Paste the job description',
    description: 'Skills, requirements, and keywords are extracted automatically.',
  },
  {
    num: 2,
    title: 'Refine your resume',
    description: 'AI suggestions align every detail to the specific role.',
  },
  {
    num: 3,
    title: 'Prepare with confidence',
    description: 'Cover letters, referral messages, and interview questions, ready in minutes.',
  },
]

function useTypingHeadlines(items: typeof headlines, typeSpeed = 50, deleteSpeed = 30, pauseMs = 3000) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * items.length))
  const [displayed, setDisplayed] = useState({ top: '', bottom: '' })
  const [phase, setPhase] = useState<'typing-top' | 'typing-bottom' | 'paused' | 'deleting-bottom' | 'deleting-top'>('typing-top')

  useEffect(() => {
    const target = items[idx]
    let timer: ReturnType<typeof setTimeout>

    switch (phase) {
      case 'typing-top':
        if (displayed.top.length < target.top.length) {
          timer = setTimeout(() => {
            setDisplayed(d => ({ ...d, top: target.top.slice(0, d.top.length + 1) }))
          }, typeSpeed)
        } else {
          timer = setTimeout(() => setPhase('typing-bottom'), 100)
        }
        break

      case 'typing-bottom':
        if (displayed.bottom.length < target.bottom.length) {
          timer = setTimeout(() => {
            setDisplayed(d => ({ ...d, bottom: target.bottom.slice(0, d.bottom.length + 1) }))
          }, typeSpeed)
        } else {
          timer = setTimeout(() => setPhase('paused'), pauseMs)
        }
        break

      case 'paused':
        setPhase('deleting-bottom')
        break

      case 'deleting-bottom':
        if (displayed.bottom.length > 0) {
          timer = setTimeout(() => {
            setDisplayed(d => ({ ...d, bottom: d.bottom.slice(0, -1) }))
          }, deleteSpeed)
        } else {
          setPhase('deleting-top')
        }
        break

      case 'deleting-top':
        if (displayed.top.length > 0) {
          timer = setTimeout(() => {
            setDisplayed(d => ({ ...d, top: d.top.slice(0, -1) }))
          }, deleteSpeed)
        } else {
          setIdx(prev => (prev + 1) % items.length)
          setPhase('typing-top')
        }
        break
    }

    return () => clearTimeout(timer)
  }, [phase, displayed, idx, items, typeSpeed, deleteSpeed, pauseMs])

  return displayed
}

export default function Home() {
  const revealRef = useScrollReveal()
  const typed = useTypingHeadlines(headlines)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1] min-h-[2.4em]">
            {typed.top}
            {typed.bottom ? (
              <>
                <span className="inline-block w-[3px] h-[0.9em] bg-transparent ml-0 align-baseline" />
                <br />
                {typed.bottom}
                <span className="inline-block w-[3px] h-[0.9em] bg-zinc-900 dark:bg-zinc-100 ml-1 align-baseline animate-pulse" />
              </>
            ) : (
              <span className="inline-block w-[3px] h-[0.9em] bg-zinc-900 dark:bg-zinc-100 ml-1 align-baseline animate-pulse" />
            )}
          </h1>
          <p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Resulyze turns every job posting into a tailored resume, a polished cover letter, and a full interview prep kit. One workflow, zero guesswork.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start optimizing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/vansh-codes/resulyze"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="w-4 h-4" />
                View on GitHub
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-400 dark:text-zinc-500">
            Free, open-source, and powered by your own API key.
          </p>
        </div>
      </section>

      {/* Features */}
      <section ref={revealRef} className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-4 reveal">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mb-12 max-w-lg mx-auto reveal">
            Four focused tools that take you from job posting to interview-ready.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="reveal group p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-card-hover transition-shadow duration-200"
              >
                <feature.icon className="w-5 h-5 text-zinc-400 mb-4" />
                <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-12">
            Three steps. That&apos;s it.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.num}
                </div>
                <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Built in the open
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-lg mx-auto leading-relaxed">
            Resulyze is fully open-source and runs on a bring-your-own-key model. Your Gemini API key never leaves your browser. No accounts, no tracking, no servers in between.
          </p>
          <a
            href="https://github.com/vansh-codes/resulyze"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2">
              <Github className="w-4 h-4" />
              Star on GitHub
            </Button>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-zinc-900 dark:bg-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white dark:text-zinc-900 mb-4">
            Your next application deserves better
          </h2>
          <p className="text-zinc-400 dark:text-zinc-600 mb-8">
            No sign-up required. Free forever. Start in under a minute.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-600 bg-transparent text-white hover:bg-zinc-800 hover:text-white dark:border-zinc-300 dark:bg-transparent dark:text-zinc-900 dark:hover:bg-zinc-200 gap-2"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
