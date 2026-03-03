'use client'

import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react'
import { SKILL_ALIASES as TAXONOMY, normalizeSkill } from '@/lib/ai/skill-taxonomy'

interface SkillMatchPanelProps {
  jobData: {
    skills?: string[]
    keywords?: string[]
  }
  latexSource: string
}

// Build a reverse lookup: canonical → all aliases (including itself)
const CANONICAL_TO_ALIASES: Record<string, string[]> = {}
for (const [alias, canonical] of Object.entries(TAXONOMY)) {
  const key = canonical.toLowerCase()
  if (!CANONICAL_TO_ALIASES[key]) CANONICAL_TO_ALIASES[key] = [canonical.toLowerCase()]
  if (!CANONICAL_TO_ALIASES[key].includes(alias)) CANONICAL_TO_ALIASES[key].push(alias)
}

function skillMatchesInSource(source: string, skill: string): boolean {
  const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Use word boundary matching to prevent "Java" matching "JavaScript"
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
  if (pattern.test(source)) return true

  // Normalize and check all aliases of the canonical form
  const canonical = normalizeSkill(skill).toLowerCase()
  const aliases = CANONICAL_TO_ALIASES[canonical] || []
  for (const alias of aliases) {
    const aliasEscaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (new RegExp(`\\b${aliasEscaped}\\b`, 'i').test(source)) return true
  }

  return false
}

export default function SkillMatchPanel({ jobData, latexSource }: SkillMatchPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const { matched, missing, total, percentage } = useMemo(() => {
    const allSkills = [
      ...(jobData.skills || []),
      ...(jobData.keywords || []),
    ]
    // Deduplicate (case-insensitive)
    const unique = Array.from(
      new Map(allSkills.map(s => [s.toLowerCase().trim(), s.trim()])).values()
    ).filter(Boolean)

    const matched: string[] = []
    const missing: string[] = []

    for (const skill of unique) {
      if (skillMatchesInSource(latexSource, skill)) {
        matched.push(skill)
      } else {
        missing.push(skill)
      }
    }

    const total = unique.length
    const percentage = total > 0 ? Math.round((matched.length / total) * 100) : 0

    return { matched, missing, total, percentage }
  }, [jobData.skills, jobData.keywords, latexSource])

  if (total === 0) return null

  // Color-coded by score
  const barFill =
    percentage >= 80 ? 'bg-emerald-500 dark:bg-emerald-500' :
    percentage >= 50 ? 'bg-amber-400 dark:bg-amber-400' :
    'bg-rose-400 dark:bg-rose-500'

  const scoreColor =
    percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
    percentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
    'text-rose-600 dark:text-rose-400'

  return (
    <div className="bg-zinc-50 dark:bg-[#111111] border-t border-zinc-200 dark:border-latex-border shrink-0">
      {/* Summary bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wide uppercase">
            JD Match
          </span>
          {/* Progress bar */}
          <div className="w-24 h-1 bg-zinc-200 dark:bg-zinc-700/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barFill}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Score */}
          <span className={`text-[11px] font-semibold tabular-nums ${scoreColor}`}>
            {matched.length}/{total}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            skills
          </span>
          <span className={`text-[11px] font-medium ${scoreColor}`}>
            ({percentage}%)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        ) : (
          <ChevronUp className="w-3 h-3 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        )}
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3 pb-2.5 max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-1">
            {matched.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              >
                <Check className="w-2.5 h-2.5 shrink-0" />
                {skill}
              </span>
            ))}
            {missing.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 text-zinc-400 border border-zinc-200/70 dark:bg-zinc-800/50 dark:text-zinc-500 dark:border-zinc-700/40"
              >
                <X className="w-2.5 h-2.5 shrink-0" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
