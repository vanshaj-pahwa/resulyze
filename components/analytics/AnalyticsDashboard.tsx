'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import { FileText, PenSquare, Zap, Wrench, Trash2, Cloud, Clock, Activity, ArrowRight, Search } from 'lucide-react'
import { useAnalytics, type AnalyticsEvent } from '@/hooks/useAnalytics'

// ─── Quick Actions (with integrated stat counts) ─────────────────────────────

export function QuickActions({ stats }: { stats: { resumesCreated: number; coverLetters: number; interviewsPrepped: number; optimizationsApplied: number; jdsAnalyzed: number } }) {
  const actions = [
    { label: 'Job Analysis', href: '/dashboard/job-analysis', icon: Search, description: 'Extract skills & requirements', count: stats.jdsAnalyzed, countLabel: 'analyzed', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/80 dark:bg-blue-950/20', hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-950/40', border: 'border-blue-200/60 dark:border-blue-800/30', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
    { label: 'Resume Editor', href: '/dashboard/resume', icon: FileText, description: 'LaTeX editor with AI assistant', count: stats.resumesCreated, countLabel: 'created', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-950/20', hoverBg: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/40', border: 'border-emerald-200/60 dark:border-emerald-800/30', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
    { label: 'Cover Letter', href: '/dashboard/cover-letter', icon: PenSquare, description: 'Tailored to job & experience', count: stats.coverLetters, countLabel: 'generated', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-950/20', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-950/40', border: 'border-amber-200/60 dark:border-amber-800/30', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
    { label: 'Interview Prep', href: '/dashboard/interview-prep', icon: Zap, description: 'AI-generated questions & answers', count: stats.interviewsPrepped, countLabel: 'sessions', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50/80 dark:bg-purple-950/20', hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-950/40', border: 'border-purple-200/60 dark:border-purple-800/30', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`group relative flex flex-col justify-between gap-3 p-3.5 rounded-lg border ${action.border} ${action.bg} ${action.hoverBg} transition-all duration-150`}
        >
          <div className="flex items-center justify-between">
            <action.icon className={`w-4 h-4 ${action.color}`} />
            <ArrowRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 group-hover:translate-x-0.5 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-all duration-150" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{action.label}</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5 leading-snug">{action.description}</p>
          </div>
          {action.count > 0 && (
            <span className={`absolute top-2.5 right-2.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${action.badge}`}>
              {action.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}

// ─── Optimization Stat (inline) ──────────────────────────────────────────────

function OptimizationStat({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/30">
      <Wrench className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
      <span className="text-xs text-zinc-700 dark:text-zinc-300">
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{count}</span> optimization{count !== 1 ? 's' : ''} applied
      </span>
    </div>
  )
}

// ─── Skill Cloud ─────────────────────────────────────────────────────────────

const SKILL_COLORS = [
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30',
  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200/50 dark:border-purple-800/30',
  'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/30',
  'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200/50 dark:border-cyan-800/30',
]

function SkillCloud({ skillFrequencies, jdCount }: { skillFrequencies: Map<string, number>; jdCount: number }) {
  const skills = useMemo(() => {
    const entries = Array.from(skillFrequencies.entries())
    if (entries.length === 0) return []
    const maxCount = Math.max(...entries.map(([, count]) => count))
    const minCount = Math.min(...entries.map(([, count]) => count))
    const range = maxCount - minCount
    // If all skills have the same frequency, use badge/pill display instead of word-cloud sizing
    const isFlat = range === 0
    return entries
      .sort((a, b) => b[1] - a[1]) // sort by frequency desc
      .map(([skill, count], i) => {
        if (isFlat) {
          return { skill, count, fontSize: 0, opacity: 1, colorClass: SKILL_COLORS[i % SKILL_COLORS.length] }
        }
        const normalized = (count - minCount) / range
        const fontSize = 13 + normalized * 15
        const opacity = 0.45 + normalized * 0.55
        return { skill, count, fontSize, opacity, colorClass: '' }
      })
  }, [skillFrequencies])

  const isFlat = skills.length > 0 && skills[0].fontSize === 0

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Cloud className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <CardTitle className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Skill Cloud</CardTitle>
          {skills.length > 0 && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 ml-auto">{skills.length} skills &middot; {jdCount} JD{jdCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 ml-[22px]">Most in-demand skills across your analyzed JDs</p>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {skills.length === 0 ? (
          <div className="text-center py-4">
            <Link href="/dashboard/job-analysis" className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Analyze your first JD <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : isFlat ? (
          // Badge/pill display when all skills have equal frequency
          <div className="flex flex-wrap gap-1.5 py-1">
            {skills.map(({ skill, colorClass }) => (
              <span
                key={skill}
                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          // Word-cloud display when frequencies vary
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 py-1">
            {skills.map(({ skill, count, fontSize, opacity }) => (
              <span
                key={skill}
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-default"
                style={{ fontSize: `${fontSize}px`, opacity }}
                title={`${skill}: ${count} JD${count > 1 ? 's' : ''}`}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Optimization Timeline ──────────────────────────────────────────────────

function OptimizationTimeline({ history }: { history: AnalyticsEvent[] }) {
  const items = history.slice(0, 50)

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <CardTitle className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Optimization History</CardTitle>
          {items.length > 0 && (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 ml-auto">{history.length} total</span>
          )}
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 ml-[22px]">Applied AI suggestions and improvements</p>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        {items.length === 0 ? (
          <div className="text-center py-4">
            <Link href="/dashboard/resume" className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Open resume editor <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
        <div className="space-y-0 relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-300 dark:bg-zinc-600" />
          {items.map((event) => {
            const meta = event.metadata || {}
            const isChat = meta.source === 'chat'
            const isAuto = meta.source === 'auto'
            const jobLabel = meta.company
              ? `${meta.company}${meta.jobTitle ? ` — ${meta.jobTitle}` : ''}`
              : meta.jobTitle || null
            const changes: string[] = meta.changes || []

            return (
              <div key={event.id} className="flex items-start gap-3 py-2 relative">
                <div className={`w-[11px] h-[11px] rounded-full border-2 border-white dark:border-zinc-900 shrink-0 mt-0.5 z-10 ${isChat ? 'bg-blue-500 dark:bg-blue-400' : 'bg-purple-500 dark:bg-purple-400'}`} />
                <div className="flex-1 min-w-0">
                  {/* Source badge + JD context */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-px rounded ${isChat ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'}`}>
                      {isChat ? 'Chat' : isAuto ? 'Auto' : 'AI'}
                    </span>
                    {jobLabel && (
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                        {jobLabel}
                      </span>
                    )}
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 ml-auto shrink-0">
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  </div>
                  {/* Change descriptions */}
                  {changes.length > 0 && (
                    <ul className="mt-1 space-y-px">
                      {changes.slice(0, 5).map((desc, i) => (
                        <li key={i} className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug truncate pl-1.5 border-l border-zinc-300 dark:border-zinc-600">
                          {desc}
                        </li>
                      ))}
                      {changes.length > 5 && (
                        <li className="text-[10px] text-zinc-500 dark:text-zinc-500 pl-1.5">
                          +{changes.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Activity Feed ───────────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  resume_created: { label: 'Resume created', color: 'bg-blue-500' },
  cover_letter_generated: { label: 'Cover letter generated', color: 'bg-emerald-500' },
  interview_prepped: { label: 'Interview prep', color: 'bg-amber-500' },
  optimization_applied: { label: 'Optimization applied', color: 'bg-purple-500' },
  jd_analyzed: { label: 'JD analyzed', color: 'bg-zinc-400 dark:bg-zinc-500' },
}

function ActivityFeed({ events }: { events: AnalyticsEvent[] }) {
  const grouped = useMemo(() => {
    const recent = [...events].reverse().slice(0, 30)
    const groups: { date: string; items: AnalyticsEvent[] }[] = []
    for (const event of recent) {
      const dateStr = new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const last = groups[groups.length - 1]
      if (last && last.date === dateStr) {
        last.items.push(event)
      } else {
        groups.push({ date: dateStr, items: [event] })
      }
    }
    return groups
  }, [events])

  if (events.length === 0) return null

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
          <CardTitle className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1">
        <div className="space-y-3">
          {grouped.map((group) => (
            <div key={group.date}>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{group.date}</p>
              <div className="space-y-1">
                {group.items.map((event) => {
                  const info = EVENT_LABELS[event.type] || { label: event.type, color: 'bg-zinc-400' }
                  const meta = event.metadata || {}
                  const jobContext = meta.company
                    ? `${meta.company}${meta.jobTitle ? ` — ${meta.jobTitle}` : ''}`
                    : meta.jobTitle || null
                  const isOptimization = event.type === 'optimization_applied'
                  const changes: string[] = isOptimization ? (meta.changes || []) : []
                  const sourceLabel = isOptimization
                    ? (meta.source === 'chat' ? 'Chat optimization' : meta.source === 'auto' ? 'Auto-optimization' : 'Optimization applied')
                    : info.label

                  return (
                    <div key={event.id} className="flex items-start gap-2.5 py-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${info.color} shrink-0 mt-1.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate">
                            {sourceLabel}
                            {jobContext && <span className="text-zinc-500 dark:text-zinc-400"> &mdash; {jobContext}</span>}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-500 shrink-0 tabular-nums ml-auto">
                            {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                        {changes.length > 0 && (
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-px">
                            {changes.slice(0, 3).join(' · ')}{changes.length > 3 ? ` +${changes.length - 3} more` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const { events, stats, skillFrequencies, optimizationHistory, clearAnalytics } = useAnalytics()
  const hasActivity = events.length > 0

  return (
    <div className="space-y-3">
      {hasActivity && (
        <div className="flex items-center justify-end">
          <button
            onClick={clearAnalytics}
            className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      <OptimizationStat count={stats.optimizationsApplied} />
      <SkillCloud skillFrequencies={skillFrequencies} jdCount={stats.jdsAnalyzed} />
      <OptimizationTimeline history={optimizationHistory} />
      <ActivityFeed events={events} />
    </div>
  )
}

export { useAnalytics }
