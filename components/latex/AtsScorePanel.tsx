'use client'

import { useState } from 'react'
import {
  X, ScanText, AlertTriangle, Info, CheckCircle2, Loader2,
  ChevronDown, ChevronRight, MessageSquare, Tag, Layout, FileText, List,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import type { AtsAnalysis, AtsSuggestion, AtsCategory } from '@/lib/latex/ats-analyzer'

interface AtsScorePanelProps {
  analysis: AtsAnalysis | null
  isAnalyzing: boolean
  error: string | null
  previousScore?: number | null
  onClose: () => void
  onSendToChat?: (message: string) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.85) return 'text-emerald-700 dark:text-emerald-300'
  if (pct >= 0.60) return 'text-amber-700 dark:text-amber-300'
  return 'text-red-700 dark:text-red-300'
}

function barColor(score: number, max: number): string {
  const pct = score / max
  if (pct >= 0.85) return 'bg-emerald-500'
  if (pct >= 0.60) return 'bg-amber-500'
  return 'bg-red-500'
}

function overallBg(score: number): string {
  if (score >= 85) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
  if (score >= 60) return 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'
  return 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'
}

function overallLabel(score: number): { text: string; color: string } {
  if (score >= 85) return { text: 'ATS Ready',  color: 'text-emerald-700 dark:text-emerald-300' }
  if (score >= 70) return { text: 'Needs Work', color: 'text-amber-700 dark:text-amber-300' }
  if (score >= 50) return { text: 'At Risk',    color: 'text-orange-700 dark:text-orange-300' }
  return               { text: 'High Risk',  color: 'text-red-700 dark:text-red-300' }
}

// ─── Dimension config ─────────────────────────────────────────────────────────

const DIMENSION_CONFIG: {
  key: AtsCategory
  label: string
  desc: string
  Icon: React.ElementType
}[] = [
  { key: 'sections',   label: 'Section Completeness', desc: 'Required resume sections', Icon: List },
  { key: 'keywords',   label: 'Keyword Match',         desc: 'Job-relevant terms',       Icon: Tag },
  { key: 'formatting', label: 'Formatting',            desc: 'ATS-compatible layout',    Icon: Layout },
  { key: 'structure',  label: 'Document Structure',    desc: 'LaTeX document validity',  Icon: FileText },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
      {children}
    </span>
  )
}

function SeverityIcon({ severity }: { severity: AtsSuggestion['severity'] }) {
  if (severity === 'error')   return <AlertTriangle className="w-3 h-3 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
  if (severity === 'warning') return <AlertTriangle className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
  return <Info className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
}

/** One compliance dimension row: bar + inline issues accordion */
function DimensionRow({
  dimKey,
  label,
  desc,
  Icon,
  score,
  suggestions,
  onSendToChat,
}: {
  dimKey: AtsCategory
  label: string
  desc: string
  Icon: React.ElementType
  score: number
  suggestions: AtsSuggestion[]
  onSendToChat?: (msg: string) => void
}) {
  // Auto-open if there are errors
  const [open, setOpen] = useState(() => suggestions.some(s => s.severity === 'error'))
  const hasSuggestions = suggestions.length > 0
  const isPerfect = score === 25

  return (
    <div className="border border-zinc-200 dark:border-zinc-700/60 rounded-lg overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => hasSuggestions && setOpen(o => !o)}
        className={`w-full px-3 py-2.5 ${hasSuggestions ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer' : 'cursor-default'} transition-colors`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">{label}</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 hidden sm:inline">— {desc}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-bold tabular-nums ${scoreColor(score, 25)}`}>
              {score}
              <span className="text-zinc-300 dark:text-zinc-600 font-normal">/25</span>
            </span>
            {isPerfect && <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 shrink-0" />}
            {hasSuggestions && (
              open
                ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                : <ChevronRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor(score, 25)}`}
            style={{ width: `${(score / 25) * 100}%` }}
          />
        </div>
      </button>

      {/* Inline suggestions */}
      {hasSuggestions && open && (
        <ul className="px-3 pb-3 pt-1 space-y-2 border-t border-zinc-100 dark:border-zinc-700/40">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 group">
              <SeverityIcon severity={s.severity} />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed flex-1">{s.message}</span>
              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(s.message)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-all shrink-0"
                  title="Ask AI to fix this"
                >
                  <MessageSquare className="w-3 h-3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SkeletonBar() {
  return (
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg p-3 space-y-1.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
        <div className="h-2.5 w-10 bg-zinc-200 dark:bg-zinc-700 rounded" />
      </div>
      <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800" />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AtsScorePanel({
  analysis,
  isAnalyzing,
  error,
  previousScore,
  onClose,
  onSendToChat,
}: AtsScorePanelProps) {
  const totalKeywords =
    (analysis?.matchedKeywords?.length ?? 0) + (analysis?.missingKeywords?.length ?? 0)

  const scoreDelta = (analysis?.score != null && previousScore != null)
    ? analysis.score - previousScore
    : null

  // Group suggestions by category for inline display
  const byCategory = (cat: AtsCategory): AtsSuggestion[] =>
    (analysis?.suggestions ?? []).filter(s => s.category === cat)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center justify-between px-2.5 border-b border-zinc-200 dark:border-latex-border shrink-0">
        <div className="flex items-center gap-2">
          <ScanText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-200">ATS Score</span>
          {isAnalyzing ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-[9px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Analyzing
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              AI
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">

        {/* Loading skeleton — shown whenever analyzing, including re-analysis */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5">
              <Loader2 className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-200">Analyzing PDF…</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Scanning what ATS bots see</p>
              </div>
              {previousScore != null && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                  Previous: {previousScore}
                </span>
              )}
            </div>
            <SkeletonBar /><SkeletonBar /><SkeletonBar /><SkeletonBar />
          </div>
        )}

        {/* Error state */}
        {error && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <AlertTriangle className="w-7 h-7 text-red-400 dark:text-red-500 mb-3" />
            <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">Analysis failed</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!analysis && !isAnalyzing && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <ScanText className="w-7 h-7 text-zinc-200 dark:text-zinc-700 mb-3" />
            <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400">Compile your resume to run ATS analysis</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1 leading-relaxed">
              Analyzes the compiled PDF — exactly what ATS bots see
            </p>
          </div>
        )}


        {/* Results */}
        {analysis && !isAnalyzing && (
          <>
            {/* ── Overall score badge ─────────────────────────────────────── */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${overallBg(analysis.score)}`}>
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-bold tabular-nums font-heading ${scoreColor(analysis.score, 100)}`}>
                  {analysis.score}
                </span>
                {scoreDelta != null && scoreDelta !== 0 && (
                  <span className={`flex items-center gap-0.5 text-[10px] font-semibold mt-0.5 ${scoreDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {scoreDelta > 0 ? (
                      <><TrendingUp className="w-3 h-3" />+{scoreDelta}</>
                    ) : (
                      <><TrendingDown className="w-3 h-3" />{scoreDelta}</>
                    )}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className={`text-[12px] font-semibold ${overallLabel(analysis.score).color}`}>
                  {overallLabel(analysis.score).text}
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">out of 100</div>
              </div>
              {analysis.score >= 85 && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              )}
            </div>

            {/* ── Compliance dimensions (bar + inline issues) ─────────────── */}
            <div className="space-y-1.5">
              <SectionLabel>Compliance Dimensions</SectionLabel>
              <div className="mt-1.5 space-y-1.5">
                {DIMENSION_CONFIG.map(({ key, label, desc, Icon }) => (
                  <DimensionRow
                    key={key}
                    dimKey={key}
                    label={label}
                    desc={desc}
                    Icon={Icon}
                    score={analysis.breakdown[key]}
                    suggestions={byCategory(key)}
                    onSendToChat={onSendToChat}
                  />
                ))}
              </div>
            </div>

            {/* ── Keyword coverage (only when JD loaded) ──────────────────── */}
            {totalKeywords > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <SectionLabel>Keyword Coverage</SectionLabel>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {analysis.matchedKeywords.length}/{totalKeywords} matched
                  </span>
                </div>

                {/* Coverage progress bar */}
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      analysis.matchedKeywords.length / totalKeywords >= 0.7
                        ? 'bg-emerald-500'
                        : analysis.matchedKeywords.length / totalKeywords >= 0.4
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(analysis.matchedKeywords.length / totalKeywords) * 100}%` }}
                  />
                </div>

                {/* Matched keywords */}
                {(analysis.matchedKeywords?.length ?? 0) > 0 && (
                  <div>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Matched ({analysis.matchedKeywords.length})
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {analysis.matchedKeywords.map(kw => (
                        <span
                          key={kw}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing keywords — clickable to send to chat */}
                {(analysis.missingKeywords?.length ?? 0) > 0 && (
                  <div>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Missing ({analysis.missingKeywords.length})
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {analysis.missingKeywords.map(kw => (
                        <span
                          key={kw}
                          onClick={() =>
                            onSendToChat?.(
                              `Add the keyword "${kw}" naturally to my resume in a relevant context`
                            )
                          }
                          className={`px-2 py-0.5 rounded-full text-[10px] border transition-colors
                            bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60
                            ${onSendToChat
                              ? 'cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:hover:border-red-500/20'
                              : ''
                            }
                          `}
                          title={onSendToChat ? `Click to ask AI to add "${kw}"` : undefined}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    {onSendToChat && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1.5">
                        Click a keyword to ask AI to add it to your resume
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Detected sections ───────────────────────────────────────── */}
            {(analysis.detectedSections?.length ?? 0) > 0 && (
              <div>
                <SectionLabel>Detected Sections</SectionLabel>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {analysis.detectedSections.map(s => (
                    <span
                      key={s}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Purpose note ─────────────────────────────────────────────── */}
            <div className="px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-700/40">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                <span className="font-semibold text-zinc-500 dark:text-zinc-400">ATS Score</span> audits machine parsability — can bots read your resume, do keywords appear, will it pass automated screening?
                For content quality (weak bullets, vague claims, impact), use <span className="font-semibold text-zinc-500 dark:text-zinc-400">Resume Review</span>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
