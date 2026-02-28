'use client'

import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react'

interface SkillMatchPanelProps {
  jobData: {
    skills?: string[]
    keywords?: string[]
  }
  latexSource: string
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

    const sourceLower = latexSource.toLowerCase()
    const matched: string[] = []
    const missing: string[] = []

    for (const skill of unique) {
      if (sourceLower.includes(skill.toLowerCase())) {
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
    percentage >= 80 ? 'bg-zinc-900' :
    percentage >= 50 ? 'bg-zinc-500' :
    'bg-zinc-300'

  return (
    <div className="bg-[#111111] border-t border-latex-border shrink-0">
      {/* Summary bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">
            JD Match:
          </span>
          {/* Mini progress bar */}
          <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={`text-xs font-mono font-medium ${
            percentage >= 80 ? 'text-zinc-200' :
            percentage >= 50 ? 'text-zinc-400' :
            'text-zinc-500'
          }`}>
            {matched.length}/{total} skills ({percentage}%)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
        )}
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-3 pb-2 max-h-32 overflow-y-auto">
          <div className="flex flex-wrap gap-1.5">
            {matched.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-zinc-700/40 text-zinc-300 rounded-full border border-zinc-600/30"
              >
                <Check className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
            {missing.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-zinc-800/40 text-zinc-500 rounded-full border border-zinc-700/30"
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
