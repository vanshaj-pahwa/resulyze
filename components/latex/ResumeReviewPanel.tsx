'use client'

import { useState } from 'react'
import {
  X, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Loader2, MessageSquare, RotateCw, Target, FileSearch,
  ArrowRight,
  type LucideIcon
} from 'lucide-react'
import type { ResumeReview, SectionReview, WeakBullet } from '@/hooks/useResumeReview'

interface ResumeReviewPanelProps {
  review: ResumeReview | null
  isReviewing: boolean
  error: string | null
  onReviewAgain: () => void
  onSendToChat: (message: string) => void
  onClose: () => void
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-700 dark:text-emerald-300'
  if (score >= 80) return 'text-zinc-700 dark:text-zinc-200'
  if (score >= 70) return 'text-amber-700 dark:text-amber-300'
  if (score >= 60) return 'text-orange-700 dark:text-orange-300'
  return 'text-red-700 dark:text-red-300'
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-500/30'
  if (score >= 80) return 'bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
  if (score >= 70) return 'bg-amber-50 border-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30'
  if (score >= 60) return 'bg-orange-50 border-orange-300 dark:bg-orange-500/15 dark:border-orange-500/30'
  return 'bg-red-50 border-red-300 dark:bg-red-500/15 dark:border-red-500/30'
}

// Section label component — consistent heading style
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </span>
  )
}

function ScoreBadge({ score, grade, large }: { score: number; grade?: string; large?: boolean }) {
  const color = getScoreColor(score)
  const bg = getScoreBg(score)

  if (large) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg}`}>
        <span className={`text-3xl font-bold tabular-nums ${color}`}>{score}</span>
        {grade && (
          <div className="flex flex-col">
            <span className={`text-xl font-bold ${color}`}>{grade}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Grade</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <span className={`text-[11px] font-bold tabular-nums ${color}`}>{score}</span>
  )
}

function SectionAccordion({
  title,
  icon: Icon,
  section,
  defaultOpen,
  onSendToChat,
}: {
  title: string
  icon: LucideIcon
  section: SectionReview
  defaultOpen?: boolean
  onSendToChat: (msg: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen ?? section.score < 70)

  return (
    <div className="border border-zinc-200 dark:border-zinc-700/60 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <span className="text-[12px] font-medium text-zinc-800 dark:text-zinc-200">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={section.score} />
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-zinc-100 dark:border-zinc-700/40">
          {section.findings.length > 0 && (
            <div className="mt-2.5">
              <SectionLabel>Findings</SectionLabel>
              <ul className="mt-1.5 space-y-1.5">
                {section.findings.map((f, i) => (
                  <li key={i} className="text-[12px] text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                    <span className="text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0 select-none">—</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.suggestions.length > 0 && (
            <div>
              <SectionLabel>Suggestions</SectionLabel>
              <ul className="mt-1.5 space-y-2">
                {section.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 group">
                    <span className="text-[12px] text-zinc-700 dark:text-zinc-200 flex-1 leading-relaxed">{s}</span>
                    <button
                      onClick={() => onSendToChat(s)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-all shrink-0"
                      title="Send to chat"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WeakBulletCard({ bullet, onSendToChat }: { bullet: WeakBullet; onSendToChat: (msg: string) => void }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 overflow-hidden">
      {/* Original */}
      <div className="px-3 pt-3 pb-2.5 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/20">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-red-600 dark:text-red-300">
          Original
        </span>
        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 mt-1 line-through decoration-red-500 leading-relaxed">
          {bullet.text}
        </p>
      </div>

      {/* Issue */}
      <div className="px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-700/60 bg-amber-50/50 dark:bg-amber-500/5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          Issue
        </span>
        <p className="text-[12px] text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
          {bullet.reason}
        </p>
      </div>

      {/* Rewrite */}
      <div className="px-3 pt-2.5 pb-3 bg-emerald-50 dark:bg-emerald-500/10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
          Suggested Rewrite
        </span>
        <p className="text-[12px] text-zinc-800 dark:text-zinc-100 mt-1 leading-relaxed font-medium">
          {bullet.rewrite}
        </p>
        <button
          onClick={() => onSendToChat(`Rewrite this bullet: "${bullet.text}" to: "${bullet.rewrite}"`)}
          className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200 dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Apply in chat
        </button>
      </div>
    </div>
  )
}

// Map section key names to display labels
const SECTION_CONFIG: Array<{ key: keyof ResumeReview['sections']; label: string; icon: LucideIcon }> = [
  { key: 'experience', label: 'Experience', icon: FileSearch },
  { key: 'skills', label: 'Skills', icon: Target },
  { key: 'education', label: 'Education', icon: FileSearch },
  { key: 'projects', label: 'Projects', icon: FileSearch },
  { key: 'contactInfo', label: 'Contact Info', icon: FileSearch },
  { key: 'formatting', label: 'Formatting', icon: FileSearch },
]

export default function ResumeReviewPanel({
  review,
  isReviewing,
  error,
  onReviewAgain,
  onSendToChat,
  onClose,
}: ResumeReviewPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center justify-between px-2.5 border-b border-zinc-200 dark:border-latex-border shrink-0">
        <div className="flex items-center gap-2">
          <FileSearch className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">Resume Review</span>
        </div>
        <div className="flex items-center gap-0.5">
          {review && (
            <button
              onClick={onReviewAgain}
              disabled={isReviewing}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150 disabled:opacity-40"
              title="Review again"
            >
              <RotateCw className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
              <span>Rerun</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {isReviewing && !review && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Loader2 className="w-6 h-6 text-zinc-400 dark:text-zinc-500 animate-spin mb-3" />
            <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">Analyzing your resume…</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
            <p className="text-[12px] text-red-500 dark:text-red-400 font-medium">{error}</p>
            <button
              onClick={onReviewAgain}
              className="mt-3 px-3 py-1.5 text-[11px] font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {review && (
          <>
            {/* Score + Verdict */}
            <div className="flex items-start gap-3">
              <ScoreBadge score={review.overallScore} grade={review.letterGrade} large />
              <div className="flex-1 min-w-0 pt-1.5">
                <p className="text-[12px] text-zinc-700 dark:text-zinc-200 leading-relaxed">{review.verdict}</p>
              </div>
            </div>

            {/* Top Priorities */}
            {review.topPriorities?.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 p-3">
                <SectionLabel>Top Priorities</SectionLabel>
                <ol className="mt-2 space-y-2">
                  {review.topPriorities.map((priority, i) => (
                    <li key={i} className="flex items-start gap-2.5 group">
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0 mt-px">{i + 1}.</span>
                      <span className="text-[12px] text-zinc-700 dark:text-zinc-200 flex-1 leading-relaxed">{priority}</span>
                      <button
                        onClick={() => onSendToChat(priority)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-all shrink-0"
                        title="Send to chat"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* ATS Compliance */}
            <SectionAccordion
              title="ATS Compliance"
              icon={CheckCircle2}
              section={review.atsCompliance}
              onSendToChat={onSendToChat}
            />

            {/* Relevance */}
            {review.relevance && (
              <SectionAccordion
                title="Job Relevance"
                icon={Target}
                section={review.relevance}
                defaultOpen
                onSendToChat={onSendToChat}
              />
            )}

            {/* Section Breakdown */}
            <div>
              <SectionLabel>Section Breakdown</SectionLabel>
              <div className="mt-2 space-y-1.5">
                {SECTION_CONFIG.map(({ key, label, icon }) => {
                  const section = review.sections[key]
                  if (!section) return null
                  return (
                    <SectionAccordion
                      key={key}
                      title={label}
                      icon={icon}
                      section={section}
                      onSendToChat={onSendToChat}
                    />
                  )
                })}
              </div>
            </div>

            {/* Weak Bullets */}
            {review.contentQuality?.weakBullets?.length > 0 && (
              <div>
                <SectionLabel>Weak Bullets</SectionLabel>
                <div className="mt-2 space-y-2">
                  {review.contentQuality.weakBullets.map((bullet, i) => (
                    <WeakBulletCard key={i} bullet={bullet} onSendToChat={onSendToChat} />
                  ))}
                </div>
              </div>
            )}

            {/* Missing Metrics */}
            {review.contentQuality?.missingMetrics?.length > 0 && (
              <div>
                <SectionLabel>Missing Metrics</SectionLabel>
                <ul className="mt-2 space-y-1.5">
                  {review.contentQuality.missingMetrics.map((m, i) => (
                    <li key={i} className="text-[12px] text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vague Claims */}
            {review.contentQuality?.vagueClaims?.length > 0 && (
              <div>
                <SectionLabel>Vague Claims</SectionLabel>
                <ul className="mt-2 space-y-1.5">
                  {review.contentQuality.vagueClaims.map((c, i) => (
                    <li key={i} className="text-[12px] text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
                      <span className="text-zinc-300 dark:text-zinc-600 mt-0.5 shrink-0 select-none">—</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purpose note */}
            <div className="px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/40">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">Resume Review</span> audits quality for human readers — writing strength, impact, and job relevance.
                For machine parsing, keyword coverage, and ATS pass rates, use <span className="font-semibold text-zinc-500 dark:text-zinc-400">ATS Score</span>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
