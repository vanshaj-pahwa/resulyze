'use client'

import { useState } from 'react'
import {
  X, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2,
  Loader2, MessageSquare, RefreshCw, Target, FileSearch,
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
  if (score >= 90) return 'text-emerald-500'
  if (score >= 80) return 'text-zinc-600 dark:text-zinc-300'
  if (score >= 70) return 'text-yellow-500'
  if (score >= 60) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20'
  if (score >= 80) return 'bg-zinc-500/10 border-zinc-500/20'
  if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20'
  if (score >= 60) return 'bg-orange-500/10 border-orange-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

function ScoreBadge({ score, grade, large }: { score: number; grade?: string; large?: boolean }) {
  const color = getScoreColor(score)
  const bg = getScoreBg(score)

  if (large) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bg}`}>
        <span className={`text-3xl font-bold tabular-nums ${color}`}>{score}</span>
        {grade && (
          <div className="flex flex-col">
            <span className={`text-lg font-bold ${color}`}>{grade}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Grade</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <span className={`text-xs font-bold tabular-nums ${color}`}>{score}</span>
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
    <div className="border border-zinc-200 dark:border-zinc-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
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
        <div className="px-3 pb-3 space-y-2 border-t border-zinc-200 dark:border-zinc-700/50">
          {section.findings.length > 0 && (
            <div className="mt-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">Findings</span>
              <ul className="mt-1 space-y-1">
                {section.findings.map((f, i) => (
                  <li key={i} className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                    <span className="text-zinc-400 dark:text-zinc-600 mt-0.5 shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.suggestions.length > 0 && (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">Suggestions</span>
              <ul className="mt-1 space-y-1.5">
                {section.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 group">
                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 flex-1">{s}</span>
                    <button
                      onClick={() => onSendToChat(s)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300 transition-all shrink-0"
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
    <div className="border border-zinc-200 dark:border-zinc-700/50 rounded-lg p-3 space-y-2">
      <div>
        <span className="text-[10px] uppercase tracking-wider text-red-400/70 font-medium">Original</span>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-through decoration-red-500/30">{bullet.text}</p>
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">Issue</span>
        <p className="text-[11px] text-zinc-500 mt-0.5">{bullet.reason}</p>
      </div>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-medium">Suggested rewrite</span>
        <p className="text-[11px] text-zinc-700 dark:text-zinc-300 mt-0.5">{bullet.rewrite}</p>
      </div>
      <button
        onClick={() => onSendToChat(`Rewrite this bullet: "${bullet.text}" to: "${bullet.rewrite}"`)}
        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
      >
        <MessageSquare className="w-2.5 h-2.5" />
        Send to chat
      </button>
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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-x border-zinc-200 dark:border-zinc-700/50">
      {/* Header */}
      <div className="h-10 bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-between px-3 border-b border-zinc-200 dark:border-zinc-700/50 shrink-0">
        <div className="flex items-center gap-2">
          <FileSearch className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-400" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Resume Review</span>
        </div>
        <div className="flex items-center gap-1">
          {review && (
            <button
              onClick={onReviewAgain}
              disabled={isReviewing}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 rounded transition-colors"
              title="Review again"
            >
              <RefreshCw className={`w-3 h-3 ${isReviewing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        {isReviewing && !review && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3">
            <Loader2 className="w-6 h-6 text-zinc-400 dark:text-zinc-500 animate-spin mb-3" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Analyzing your resume...</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={onReviewAgain}
              className="mt-3 px-3 py-1.5 text-xs text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded transition-colors"
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
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{review.verdict}</p>
              </div>
            </div>

            {/* Top Priorities */}
            {review.topPriorities?.length > 0 && (
              <div className="bg-zinc-100 dark:bg-zinc-800/60 rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">Top Priorities</span>
                <ol className="mt-1.5 space-y-1">
                  {review.topPriorities.map((priority, i) => (
                    <li key={i} className="flex items-start gap-2 group">
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">{i + 1}.</span>
                      <span className="text-[11px] text-zinc-700 dark:text-zinc-300 flex-1">{priority}</span>
                      <button
                        onClick={() => onSendToChat(priority)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300 transition-all shrink-0"
                        title="Send to chat"
                      >
                        <MessageSquare className="w-3 h-3" />
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

            {/* Relevance (if job data provided) */}
            {review.relevance && (
              <SectionAccordion
                title="Job Relevance"
                icon={Target}
                section={review.relevance}
                defaultOpen
                onSendToChat={onSendToChat}
              />
            )}

            {/* Section Reviews */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-medium">Section Breakdown</span>
              <div className="mt-1.5 space-y-1.5">
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
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-medium">Weak Bullets</span>
                <div className="mt-1.5 space-y-2">
                  {review.contentQuality.weakBullets.map((bullet, i) => (
                    <WeakBulletCard key={i} bullet={bullet} onSendToChat={onSendToChat} />
                  ))}
                </div>
              </div>
            )}

            {/* Missing Metrics */}
            {review.contentQuality?.missingMetrics?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-medium">Missing Metrics</span>
                <ul className="mt-1 space-y-1">
                  {review.contentQuality.missingMetrics.map((m, i) => (
                    <li key={i} className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-yellow-500/60 shrink-0 mt-0.5" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vague Claims */}
            {review.contentQuality?.vagueClaims?.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600 font-medium">Vague Claims</span>
                <ul className="mt-1 space-y-1">
                  {review.contentQuality.vagueClaims.map((c, i) => (
                    <li key={i} className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                      <span className="text-zinc-400 dark:text-zinc-600 mt-0.5 shrink-0">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
