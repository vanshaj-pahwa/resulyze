'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  FileText, Code2, PenSquare, Zap, ArrowRight, Github,
  Shield, Key, CheckCircle2, AlertTriangle, ChevronDown,
  Target, History, Star, Lock, Globe, Sparkles, RotateCw,
  MessageSquare,
} from 'lucide-react'

// ─── Typing headline hook ───────────────────────────────────────────────────

const headlines = [
  { top: 'Land the role.', bottom: 'Not just the interview.' },
  { top: 'Your resume,', bottom: 'optimized by AI.' },
  { top: 'One job posting.', bottom: 'One perfect application.' },
  { top: 'Stop guessing.', bottom: 'Start getting callbacks.' },
  { top: 'Write less.', bottom: 'Get hired more.' },
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
          timer = setTimeout(() => setDisplayed(d => ({ ...d, top: target.top.slice(0, d.top.length + 1) })), typeSpeed)
        } else {
          timer = setTimeout(() => setPhase('typing-bottom'), 100)
        }
        break
      case 'typing-bottom':
        if (displayed.bottom.length < target.bottom.length) {
          timer = setTimeout(() => setDisplayed(d => ({ ...d, bottom: target.bottom.slice(0, d.bottom.length + 1) })), typeSpeed)
        } else {
          timer = setTimeout(() => setPhase('paused'), pauseMs)
        }
        break
      case 'paused':
        setPhase('deleting-bottom')
        break
      case 'deleting-bottom':
        if (displayed.bottom.length > 0) {
          timer = setTimeout(() => setDisplayed(d => ({ ...d, bottom: d.bottom.slice(0, -1) })), deleteSpeed)
        } else {
          setPhase('deleting-top')
        }
        break
      case 'deleting-top':
        if (displayed.top.length > 0) {
          timer = setTimeout(() => setDisplayed(d => ({ ...d, top: d.top.slice(0, -1) })), deleteSpeed)
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

// ─── Data ───────────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileText,
    title: 'Intelligent Job Analysis',
    description: 'Drop in any job posting. AI dissects it in seconds, surfacing the exact skills and keywords that matter to hiring teams.',
    bullets: [
      'Separates required, preferred, and bonus skills',
      'Normalizes 50+ skill aliases automatically',
      'Saves your last 5 JDs for quick re-use',
    ],
  },
  {
    icon: Code2,
    title: 'LaTeX Resume Editor',
    description: 'No LaTeX experience needed. Write or let AI handle the code. Preview in real time, build ATS-friendly output.',
    bullets: [
      'Live PDF preview with zoom and link support',
      'AI chat assistant for targeted edits',
      'Version history with one-click restore',
      'Page overflow detection with smart AI trimming',
    ],
  },
  {
    icon: PenSquare,
    title: 'Cover Letters & Referrals',
    description: 'Generate compelling, role-specific cover letters and referral messages that sound like you, not a template.',
    bullets: [
      'Company-aware tone calibration',
      'Cherry-picks achievements from your resume',
      'Export as PDF or plain text instantly',
    ],
  },
  {
    icon: Zap,
    title: 'Interview Preparation',
    description: 'Practice with AI-generated questions drawn from the actual job requirements, with model answers and company research.',
    bullets: [
      'Round-specific questions (technical, behavioral, system design)',
      'Model answers with reasoning walkthrough',
      'Company culture hints extracted from the JD',
    ],
  },
]

const steps = [
  {
    num: '01',
    title: 'Paste the job description',
    description: 'Skills, requirements, and keywords are extracted instantly. No manual matching. The AI understands context and intent.',
  },
  {
    num: '02',
    title: 'Edit and optimize your resume',
    description: 'Chat with AI to rewrite bullets, fix ATS issues, and align every detail to the role. Preview as PDF in real time.',
  },
  {
    num: '03',
    title: 'Generate everything else',
    description: 'Cover letter, referral message, and full interview prep kit, all tailored to the specific posting. Minutes, not hours.',
  },
]

const trustPills = [
  { icon: Lock, label: 'No account required' },
  { icon: Globe, label: 'Runs in your browser' },
  { icon: Key, label: 'Your API key, your data' },
  { icon: Star, label: 'Open source · MIT' },
]

const faqs = [
  {
    q: 'Do I need a Gemini API key?',
    a: 'Yes. Resulyze runs on a bring-your-own-key model using Google Gemini. The key is free to obtain from Google AI Studio, and typical usage costs less than $0.01 per session. Your key is stored only in your browser and never sent to any Resulyze server.',
  },
  {
    q: 'Do I need to know LaTeX?',
    a: 'No. The editor\'s AI chat handles all the LaTeX for you. Just describe what you want ("add a skills section", "shorten this bullet", "make it one page") and the AI updates the code. You can also paste in an existing LaTeX resume and work from there.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your resume, job descriptions, chat history, and API key are stored exclusively in your browser\'s localStorage. Nothing is sent to any Resulyze server. The only outbound requests are to Google\'s Gemini API and a LaTeX compilation service for PDF preview.',
  },
  {
    q: 'Is this actually free?',
    a: 'Resulyze itself is free and open-source (MIT license). You pay only for Gemini API usage, which is extremely low for resume work, typically a few cents per month at most. There are no subscriptions, no freemium tiers, and no upsells.',
  },
  {
    q: 'What browsers are supported?',
    a: 'Any modern browser: Chrome, Firefox, Safari, Edge. No installation or extension required. The PDF preview uses pdf.js and renders entirely in-browser.',
  },
]

// ─── FAQ Item ───────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-[15px] font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  )
}

// ─── Faux Score Panel ────────────────────────────────────────────────────────

function FauxScorePanel() {
  const sections = [
    { label: 'ATS Compliance', score: 91 },
    { label: 'Experience', score: 76 },
    { label: 'Skills', score: 84 },
    { label: 'Formatting', score: 95 },
  ]

  const getColor = (s: number) =>
    s >= 90 ? 'text-emerald-700 dark:text-emerald-300' :
    s >= 70 ? 'text-amber-700 dark:text-amber-300' :
    'text-red-700 dark:text-red-300'

  const getBar = (s: number) =>
    s >= 90 ? 'bg-emerald-500' :
    s >= 70 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden select-none">
      {/* Header */}
      <div className="h-9 bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800 flex items-center px-3 gap-2">
        <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Resume Review</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Score badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25">
          <span className="text-4xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300 font-heading">84</span>
          <div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-heading">B+</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Grade</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-[140px]">
              Strong fundamentals. Add 2–3 metrics to push past 90.
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Section Breakdown
          </span>
          {sections.map(({ label, score }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-600 dark:text-zinc-300">{label}</span>
                <span className={`text-[12px] font-bold tabular-nums ${getColor(score)}`}>{score}</span>
              </div>
              <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBar(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Weak bullet example */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700/60 overflow-hidden">
          <div className="px-3 pt-2.5 pb-2 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-300">Weak Bullet</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-through decoration-red-500">
              Worked on backend APIs using Node.js.
            </p>
          </div>
          <div className="px-3 pt-2 pb-2.5 bg-emerald-50 dark:bg-emerald-500/10">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Suggested Rewrite</span>
            <p className="text-[11px] text-zinc-800 dark:text-zinc-100 mt-0.5 font-medium leading-relaxed">
              Engineered 12 REST APIs in Node.js, reducing avg. response time by 34%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const featuresRef = useScrollReveal()
  const intelligenceRef = useScrollReveal()
  const stepsRef = useScrollReveal()
  const faqRef = useScrollReveal()
  const typed = useTypingHeadlines(headlines)
  const [hasResume, setHasResume] = useState(false)

  useEffect(() => {
    setHasResume(!!localStorage.getItem('resulyze-latex-source'))
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
            Resulyze turns every job posting into a tailored resume, a polished cover letter, and a full interview prep kit. Powered by AI, running entirely in your browser.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start optimizing
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="https://github.com/vanshaj-pahwa/resulyze" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="w-4 h-4" />
                View on GitHub
              </Button>
            </a>
          </div>

          {hasResume && (
            <div className="mt-4 animate-fade-in">
              <Link href="/dashboard/resume">
                <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <Code2 className="w-3.5 h-3.5" />
                  Continue editing your resume
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          )}

          {/* Trust pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {trustPills.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-[12px] text-zinc-500 dark:text-zinc-400"
              >
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="reveal font-heading text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Four tools. One workflow.
            </h2>
            <p className="reveal text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Use any tool in any order. Each one works standalone or together as a complete pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="reveal group p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <feature.icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                  {feature.description}
                </p>
                <ul className="space-y-1.5">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[12px] text-zinc-500 dark:text-zinc-500">
                      <span className="mt-0.5 w-3.5 h-3.5 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resume Intelligence ───────────────────────────────────────────── */}
      <section ref={intelligenceRef} className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Text */}
            <div>
              <span className="reveal inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                <Sparkles className="w-3 h-3" />
                Resume Intelligence
              </span>
              <h2 className="reveal font-heading text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 leading-tight">
                Know exactly what's wrong. And how to fix it.
              </h2>
              <p className="reveal text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Resume Review scores your resume 0–100 with a letter grade, then breaks it down section by section: ATS compliance, content quality, and skill matching, all in one panel.
              </p>

              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, text: 'ATS compliance check with specific findings and fixes', color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: Target, text: 'Skill match % against the job description you analyzed', color: 'text-zinc-400 dark:text-zinc-500' },
                  { icon: AlertTriangle, text: 'Weak bullets flagged with AI-suggested rewrites', color: 'text-amber-600 dark:text-amber-400' },
                  { icon: History, text: 'Version history to compare and restore any previous draft', color: 'text-zinc-400 dark:text-zinc-500' },
                ].map(({ icon: Icon, text, color }) => (
                  <li key={text} className="reveal flex items-start gap-3">
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faux UI */}
            <div className="reveal">
              <FauxScorePanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section ref={stepsRef} className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="reveal font-heading text-2xl sm:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-14">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map(({ num, title, description }) => (
              <div key={num} className="reveal">
                <span className="font-heading text-6xl font-bold text-zinc-100 dark:text-zinc-800 leading-none select-none">
                  {num}
                </span>
                <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mt-2 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy / Open Source ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy */}
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Shield className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Your data never leaves your browser
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No backend, no database, no accounts. Your resume, API key, and job history are stored only in localStorage. The only outbound request is from your browser directly to Google's Gemini API.
              </p>
            </div>

            {/* Open source */}
            <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Github className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Fully open source · MIT license
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                Read the code, audit the prompts, self-host it, or contribute. Everything is in the open with no proprietary black box between you and your application materials.
              </p>
              <a href="https://github.com/vanshaj-pahwa/resulyze" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-3.5 h-3.5" />
                  Star on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section ref={faqRef} className="py-20 border-t border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <h2 className="reveal font-heading text-2xl sm:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-10">
            Common questions
          </h2>
          <div className="reveal">
            {faqs.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-zinc-900 dark:bg-zinc-100">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white dark:text-zinc-900 mb-3">
            Your next application deserves better
          </h2>
          <p className="text-zinc-400 dark:text-zinc-600 mb-8">
            No sign-up. No subscription. No data collection. Start in under a minute.
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
