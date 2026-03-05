'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  FileText, Code2, PenSquare, Zap, ArrowRight, Github,
  Key, CheckCircle2, AlertTriangle, ChevronDown,
  Target, History, Star, Lock, Globe, Sparkles, RotateCw,
  LayoutGrid, BarChart3,
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
    num: '01',
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
    num: '02',
    title: 'LaTeX Resume Editor',
    description: 'No LaTeX experience needed. Write or let AI handle the code. Preview in real time, build ATS-friendly output.',
    bullets: [
      '8 professional templates with real PDF previews',
      'AI chat assistant, autocomplete, and real-time linting',
      'ATS compatibility scoring on the compiled PDF',
      'Multi-resume management with per-resume history',
    ],
  },
  {
    icon: PenSquare,
    num: '03',
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
    num: '04',
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
    description: 'Skills, requirements, and keywords are extracted instantly. No manual matching.',
  },
  {
    num: '02',
    title: 'Edit and optimize your resume',
    description: 'Chat with AI to rewrite bullets, fix ATS issues, and align every detail to the role.',
  },
  {
    num: '03',
    title: 'Generate everything else',
    description: 'Cover letter, referral message, and full interview prep kit. Minutes, not hours.',
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
    a: 'Yes. Resulyze uses a bring-your-own-key model with Google Gemini. The key is free from Google AI Studio, and typical usage costs less than $0.01 per session. Your key is stored only in your browser.',
  },
  {
    q: 'Do I need to know LaTeX?',
    a: 'No. The AI chat handles all the LaTeX for you. Just describe what you want ("add a skills section", "shorten this bullet", "make it one page") and the AI updates the code.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your resume, job descriptions, chat history, and API key are stored exclusively in your browser\'s localStorage. Nothing is sent to any Resulyze server.',
  },
  {
    q: 'Is this actually free?',
    a: 'Resulyze is free and open-source (MIT). You pay only for Gemini API usage, which is extremely low for resume work. No subscriptions, no freemium tiers.',
  },
  {
    q: 'What browsers are supported?',
    a: 'Any modern browser: Chrome, Firefox, Safari, Edge. No installation required. The PDF preview uses pdf.js and renders entirely in-browser.',
  },
]

// ─── FAQ Item ───────────────────────────────────────────────────────────────

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 py-5 text-left group"
      >
        <span className="font-heading text-[11px] font-semibold text-zinc-300 dark:text-zinc-700 tabular-nums tracking-wider shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[15px] font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-400 dark:text-zinc-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 pl-[calc(11px+1rem+11px)] text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {a}
          </p>
        </div>
      </div>
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
    s >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
    s >= 70 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400'

  const getBar = (s: number) =>
    s >= 90 ? 'bg-emerald-500' :
    s >= 70 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden select-none transform rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
      {/* Header */}
      <div className="h-9 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-3.5 gap-2">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-600 ml-1">Resume Review</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Score badge */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200/60 dark:border-emerald-500/20">
          <span className="text-5xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 font-heading leading-none">84</span>
          <div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-heading leading-none">B+</div>
            <div className="text-[9px] uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">Grade</div>
          </div>
          <div className="ml-auto text-right max-w-[140px]">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Strong fundamentals. Add 2-3 metrics to push past 90.
            </div>
          </div>
        </div>

        {/* Section breakdown */}
        <div className="space-y-3">
          <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Section Breakdown
          </span>
          {sections.map(({ label, score }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-zinc-600 dark:text-zinc-400">{label}</span>
                <span className={`text-[12px] font-bold tabular-nums ${getColor(score)}`}>{score}</span>
              </div>
              <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className={`h-full rounded-full ${getBar(score)} transition-all duration-1000 ease-out`} style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Weak bullet example */}
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-3.5 pt-2.5 pb-2 bg-red-50/80 dark:bg-red-500/[0.06] border-b border-red-200/60 dark:border-red-500/15">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-red-600 dark:text-red-400">Weak Bullet</span>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5 line-through decoration-red-400/50">
              Worked on backend APIs using Node.js.
            </p>
          </div>
          <div className="px-3.5 pt-2 pb-2.5 bg-emerald-50/80 dark:bg-emerald-500/[0.06]">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-400">Suggested Rewrite</span>
            <p className="text-[11px] text-zinc-800 dark:text-zinc-200 mt-0.5 font-medium leading-relaxed">
              Engineered 12 REST APIs in Node.js, reducing avg. response time by 34%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section Label ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="reveal inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-6">
      {children}
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const featuresRef = useScrollReveal()
  const intelligenceRef = useScrollReveal()
  const templatesRef = useScrollReveal()
  const stepsRef = useScrollReveal()
  const privacyRef = useScrollReveal()
  const faqRef = useScrollReveal()
  const typed = useTypingHeadlines(headlines)
  const [hasResume, setHasResume] = useState(false)

  useEffect(() => {
    try {
      const resumes = JSON.parse(localStorage.getItem('resulyze-resumes') || '[]')
      setHasResume(resumes.length > 0)
    } catch { setHasResume(false) }
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 sm:py-36 lg:py-44 overflow-hidden">
        {/* Subtle radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]" />

        <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative">
          <div className="text-center">
            {/* Eyebrow */}
            <div className="flex items-center justify-center mb-8 animate-fade-in">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                AI-Powered Career Toolkit
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1] min-h-[2.4em] animate-fade-up">
              {typed.top}
              {typed.bottom ? (
                <>
                  <span className="inline-block w-[3px] h-[0.85em] bg-transparent ml-0 align-baseline" />
                  <br />
                  <span className="text-zinc-500 dark:text-zinc-400">{typed.bottom}</span>
                  <span className="inline-block w-[3px] h-[0.85em] bg-zinc-400 dark:bg-zinc-500 ml-1.5 align-baseline animate-pulse" />
                </>
              ) : (
                <span className="inline-block w-[3px] h-[0.85em] bg-zinc-900 dark:bg-zinc-100 ml-1.5 align-baseline animate-pulse" />
              )}
            </h2>

            {/* Subheadline */}
            <p className="mt-8 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: '100ms' }}>
              Resulyze turns every job posting into a tailored resume, a polished cover letter, and a full interview prep kit. Powered by AI, running entirely in your browser.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 h-12 px-8 text-[15px]">
                  Start optimizing
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="https://github.com/vanshaj-pahwa/resulyze" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2 h-12 px-8 text-[15px]">
                  <Github className="w-4 h-4" />
                  View on GitHub
                </Button>
              </a>
            </div>

            {hasResume && (
              <div className="mt-5 animate-fade-in" style={{ animationDelay: '400ms' }}>
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
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 animate-fade-up" style={{ animationDelay: '300ms' }}>
              {trustPills.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shadow-sm"
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-16">
            <SectionLabel>What you get</SectionLabel>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Four tools. One workflow.
            </h2>
            <p className="reveal text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
              Each tool works standalone or together as a complete pipeline. Use any tool in any order.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`reveal reveal-delay-${i < 4 ? i + 1 : 4} group bg-white dark:bg-zinc-900 p-7 transition-colors duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
              >
                {/* Number + Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-heading text-4xl font-extrabold text-zinc-300 dark:text-zinc-800 leading-none select-none">
                    {feature.num}
                  </span>
                  <feature.icon className="w-5 h-5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-600 transition-colors" />
                </div>

                <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[12px] text-zinc-500 dark:text-zinc-500">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 shrink-0" />
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
      <section ref={intelligenceRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

            {/* Text */}
            <div>
              <SectionLabel>
                <Sparkles className="w-3 h-3" />
                Resume Intelligence
              </SectionLabel>
              <h2 className="reveal font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-5 leading-tight">
                Know exactly what&apos;s wrong.<br className="hidden sm:block" /> And how to fix it.
              </h2>
              <p className="reveal text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                Resume Review scores your resume 0-100 with a letter grade, then breaks it down section by section: ATS compliance, content quality, and skill matching.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: CheckCircle2, text: 'ATS compliance check with specific findings and fixes', color: 'text-emerald-600 dark:text-emerald-400' },
                  { icon: Target, text: 'Skill match percentage against the analyzed job description', color: 'text-zinc-400 dark:text-zinc-500' },
                  { icon: AlertTriangle, text: 'Weak bullets flagged with AI-suggested rewrites', color: 'text-amber-600 dark:text-amber-400' },
                  { icon: History, text: 'Version history to compare and restore any previous draft', color: 'text-zinc-400 dark:text-zinc-500' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <li key={text} className={`reveal reveal-delay-${i + 1} flex items-start gap-3`}>
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Faux UI */}
            <div className="reveal reveal-delay-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                <FauxScorePanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates & Dashboard ────────────────────────────────────────── */}
      <section ref={templatesRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center mb-14">
            <SectionLabel>Built for speed</SectionLabel>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Start polished. Stay organized.
            </h2>
          </div>

          <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Templates */}
            <div className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-card-hover transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <LayoutGrid className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                8 professional templates
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                Modern, Classic, Minimal, Sidebar, Developer, Professional, Bold, and Compact. Each renders a real PDF preview so you see exactly what you get.
              </p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                Pick a template, name your resume, and start editing. Zero setup.
              </p>
            </div>

            {/* Analytics */}
            <div className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-card-hover transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <BarChart3 className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Activity dashboard
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                Manage multiple resumes, track your optimization history, and see which skills appear most across all the job descriptions you've analyzed.
              </p>
              <p className="text-[12px] text-zinc-400 dark:text-zinc-500">
                Skill cloud, optimization timeline, activity feed. All stored locally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section ref={stepsRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-16">
            <SectionLabel>How it works</SectionLabel>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Three steps to a better application
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {steps.map(({ num, title, description }, i) => (
              <div key={num} className={`reveal reveal-delay-${i + 1} relative p-8 text-center`}>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 right-0 w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
                )}
                <span className="font-heading text-7xl font-extrabold text-zinc-300 dark:text-zinc-800/80 leading-none select-none block mb-4">
                  {num}
                </span>
                <h3 className="font-heading font-semibold text-zinc-900 dark:text-zinc-100 mb-2.5">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy / Open Source ─────────────────────────────────────────── */}
      <section ref={privacyRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy */}
            <div className="reveal p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
                <Lock className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Your data never leaves your browser
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                No backend, no database, no accounts. Your resume, API key, and job history are stored only in localStorage. The only outbound request goes from your browser directly to Google's Gemini API.
              </p>
            </div>

            {/* Open source */}
            <div className="reveal reveal-delay-1 p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
                <Github className="w-4.5 h-4.5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">
                Fully open source
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                MIT license. Read the code, audit the prompts, self-host it, or contribute. No proprietary black box between you and your application materials.
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
      <section ref={faqRef} className="py-24 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
          <div className="text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              Common questions
            </h2>
          </div>
          <div className="reveal">
            {faqs.map(({ q, a }, i) => (
              <FaqItem key={q} q={q} a={a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative py-24 bg-zinc-900 dark:bg-zinc-100 overflow-hidden">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center relative">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white dark:text-zinc-900 mb-4">
            Your next application deserves better
          </h2>
          <p className="text-zinc-400 dark:text-zinc-600 mb-10 max-w-md mx-auto">
            No sign-up. No subscription. No data collection. Start in under a minute.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-600 bg-transparent text-white hover:bg-zinc-800 hover:text-white dark:border-zinc-300 dark:bg-transparent dark:text-zinc-900 dark:hover:bg-zinc-200 gap-2 h-12 px-8 text-[15px]"
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
