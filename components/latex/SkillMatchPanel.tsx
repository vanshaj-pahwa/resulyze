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

  const barColor =
    percentage >= 80 ? 'bg-zinc-700 dark:bg-zinc-900' :
    percentage >= 50 ? 'bg-zinc-400 dark:bg-zinc-500' :
    'bg-zinc-300'

  const scoreColor =
    percentage >= 80 ? 'text-zinc-700 dark:text-zinc-200' :
    percentage >= 50 ? 'text-zinc-500 dark:text-zinc-400' :
    'text-zinc-400 dark:text-zinc-500'

  return (
    <div className="bg-zinc-50 dark:bg-[#111111] border-t border-zinc-200 dark:border-latex-border shrink-0">
      {/* Summary bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            JD Match:
          </span>
          {/* Mini progress bar */}
          <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={`text-xs font-mono font-medium ${scoreColor}`}>
            {matched.length}/{total} skills ({percentage}%)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
        )}
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3 pb-2 max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {matched.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-700 rounded-full border border-zinc-300/50 dark:bg-zinc-700/40 dark:text-zinc-300 dark:border-zinc-600/30"
              >
                <Check className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
            {missing.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-400 rounded-full border border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-zinc-700/30"
              >
                <X className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
