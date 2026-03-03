// Pure client-side ATS analysis — no AI calls, runs on every debounced keystroke

export type AtsSeverity = 'error' | 'warning' | 'tip'
export type AtsCategory = 'sections' | 'keywords' | 'formatting' | 'structure'

export interface AtsSuggestion {
  severity: AtsSeverity
  category: AtsCategory
  message: string
}

export interface AtsBreakdown {
  sections: number    // 0–25
  keywords: number    // 0–25
  formatting: number  // 0–25
  structure: number   // 0–25
}

export interface AtsAnalysis {
  score: number
  breakdown: AtsBreakdown
  suggestions: AtsSuggestion[]
  detectedSections: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
}

// ─── Section patterns ────────────────────────────────────────────────────────

const SECTION_RE = /\\section\*?\{([^}]+)\}/g

const EXPERIENCE_RE = /\\section\*?\{[^}]*(experience|work|employment|career|professional)[^}]*\}/i
const EDUCATION_RE  = /\\section\*?\{[^}]*education[^}]*\}/i
const SKILLS_RE     = /\\section\*?\{[^}]*(skills?|technologies|technical|expertise|competenc)[^}]*\}/i

// ─── ATS-unfriendly patterns ─────────────────────────────────────────────────

const UNFRIENDLY: Array<{ pattern: RegExp; message: string; severity: AtsSeverity; penalty: number }> = [
  { pattern: /\\includegraphics/, message: 'Remove images — ATS systems cannot parse them', severity: 'error', penalty: 10 },
  { pattern: /\\begin\{multicol\}/, message: 'Avoid multi-column layouts — ATS reads text in the wrong order', severity: 'error', penalty: 10 },
  { pattern: /\\begin\{wrapfigure\}/, message: 'Remove wrapped figures — ATS cannot parse them', severity: 'error', penalty: 8 },
  { pattern: /\\textbox|\\colorbox|\\fbox/, message: 'Avoid text boxes — ATS may skip their content', severity: 'warning', penalty: 5 },
  { pattern: /\\fontspec|\\setmainfont/, message: 'Custom fonts via fontspec may cause parsing issues on some ATS platforms', severity: 'warning', penalty: 3 },
  { pattern: /\\begin\{tabular\}\{([|lcr ]{7,})\}/, message: 'Simplify complex tables — ATS systems may misread many-column layouts', severity: 'warning', penalty: 4 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasContactInfo(latex: string): boolean {
  const email = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(latex)
  const phone = /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}|\+\d{1,3}[-.\s]\d/.test(latex)
  return email || phone
}

function hasMetrics(latex: string): boolean {
  return /\d+\s*%|\$[\d,]+|\d+\s*(million|thousand|k\b)|increased|decreased|reduced|grew|saved|generated/i.test(latex)
}

function hasActionVerbs(latex: string): boolean {
  return /\b(led|built|developed|designed|implemented|created|managed|improved|optimized|launched|delivered|architected|engineered|spearheaded|orchestrated|reduced|increased|automated|streamlined|deployed|mentored|collaborated)\b/i.test(latex)
}

function hasDates(latex: string): boolean {
  return /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4}\s*[-–]\s*(\d{4}|present)/i.test(latex)
}

// ─── Main analyzer ───────────────────────────────────────────────────────────

export function analyzeAts(latex: string, jobKeywords: string[] = []): AtsAnalysis {
  const suggestions: AtsSuggestion[] = []
  const detectedSections: string[] = []

  // Collect all section names
  for (const m of latex.matchAll(SECTION_RE)) {
    detectedSections.push(m[1].trim())
  }

  // ── 1. Section Completeness (0–25) ────────────────────────────────────────

  let sectionScore = 25

  if (!hasContactInfo(latex)) {
    sectionScore -= 8
    suggestions.push({ severity: 'error', category: 'sections', message: 'Add contact info (email and phone number) — ATS systems require it' })
  }

  if (!EXPERIENCE_RE.test(latex)) {
    sectionScore -= 8
    suggestions.push({ severity: 'error', category: 'sections', message: 'Add an Experience section — it is required by virtually all ATS systems' })
  }

  if (!EDUCATION_RE.test(latex)) {
    sectionScore -= 5
    suggestions.push({ severity: 'warning', category: 'sections', message: 'Add an Education section' })
  }

  if (!SKILLS_RE.test(latex)) {
    sectionScore -= 4
    suggestions.push({ severity: 'warning', category: 'sections', message: 'Add a Skills section — ATS systems keyword-match against it first' })
  }

  sectionScore = Math.max(0, sectionScore)

  // ── 2. Keyword Density (0–25) ─────────────────────────────────────────────

  let keywordScore: number
  const matchedKeywords: string[] = []
  const missingKeywords: string[] = []

  if (jobKeywords.length > 0) {
    const latexLower = latex.toLowerCase()
    for (const kw of jobKeywords.slice(0, 25)) {
      const normalized = kw.toLowerCase()
      // word-boundary aware match
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`\\b${escaped}\\b`)
      if (re.test(latexLower)) {
        matchedKeywords.push(kw)
      } else {
        missingKeywords.push(kw)
      }
    }
    const ratio = matchedKeywords.length / Math.min(jobKeywords.length, 25)
    keywordScore = Math.round(ratio * 25)

    if (missingKeywords.length > 0 && missingKeywords.length <= 5) {
      suggestions.push({
        severity: 'warning',
        category: 'keywords',
        message: `Missing JD keywords: ${missingKeywords.slice(0, 3).join(', ')}${missingKeywords.length > 3 ? ` and ${missingKeywords.length - 3} more` : ''}`,
      })
    } else if (missingKeywords.length > 5) {
      suggestions.push({
        severity: 'warning',
        category: 'keywords',
        message: `${missingKeywords.length} job keywords not found — check the Skill Match panel for details`,
      })
    }
  } else {
    // No JD loaded — score based on general resume quality signals
    keywordScore = 12
    if (hasMetrics(latex))     keywordScore += 7
    if (hasActionVerbs(latex)) keywordScore += 6
    keywordScore = Math.min(25, keywordScore)

    if (!hasMetrics(latex)) {
      suggestions.push({ severity: 'warning', category: 'keywords', message: 'Add quantifiable metrics (numbers, %, dollar amounts) to bullet points' })
    }
    if (!hasActionVerbs(latex)) {
      suggestions.push({ severity: 'tip', category: 'keywords', message: 'Start bullet points with strong action verbs: led, built, improved, delivered' })
    }
    suggestions.push({ severity: 'tip', category: 'keywords', message: 'Analyze a job description in Step 1 to get keyword-specific scoring' })
  }

  // ── 3. Formatting Compliance (0–25) ──────────────────────────────────────

  let formattingScore = 25

  for (const { pattern, message, severity, penalty } of UNFRIENDLY) {
    if (pattern.test(latex)) {
      formattingScore -= penalty
      suggestions.push({ severity, category: 'formatting', message })
    }
  }

  if (!/\\usepackage(\[.*?\])?\{hyperref\}/.test(latex)) {
    suggestions.push({ severity: 'tip', category: 'formatting', message: 'Add \\usepackage{hyperref} to make your email and LinkedIn URL clickable in the PDF' })
  }

  formattingScore = Math.max(0, formattingScore)

  // ── 4. Document Structure (0–25) ─────────────────────────────────────────

  let structureScore = 25

  if (!/\\documentclass/.test(latex)) {
    structureScore -= 10
    suggestions.push({ severity: 'error', category: 'structure', message: 'Missing \\documentclass declaration' })
  }

  if (!/\\begin\{document\}/.test(latex)) {
    structureScore -= 8
    suggestions.push({ severity: 'error', category: 'structure', message: 'Missing \\begin{document}' })
  }

  if (!/\\end\{document\}/.test(latex)) {
    structureScore -= 5
    suggestions.push({ severity: 'error', category: 'structure', message: 'Missing \\end{document}' })
  }

  // Check for a prominent name (common in resume templates)
  const hasName = /\\(?:name|Huge|huge|LARGE)\{[A-Z][^}]+\}|\\begin\{center\}[\s\S]{0,300}[A-Z][a-zA-Z]+ [A-Z][a-zA-Z]+/.test(latex)
  if (!hasName) {
    structureScore -= 4
    suggestions.push({ severity: 'warning', category: 'structure', message: 'Ensure your full name appears prominently at the top of the resume' })
  }

  if (EXPERIENCE_RE.test(latex) && !hasDates(latex)) {
    structureScore -= 3
    suggestions.push({ severity: 'warning', category: 'structure', message: 'Add date ranges to experience entries (e.g., Jan 2022 – Present)' })
  }

  structureScore = Math.max(0, structureScore)

  // ── Final score ───────────────────────────────────────────────────────────

  const score = sectionScore + keywordScore + formattingScore + structureScore

  // Sort: errors first, then warnings, then tips
  const order: Record<AtsSeverity, number> = { error: 0, warning: 1, tip: 2 }
  suggestions.sort((a, b) => order[a.severity] - order[b.severity])

  return {
    score,
    breakdown: { sections: sectionScore, keywords: keywordScore, formatting: formattingScore, structure: structureScore },
    suggestions,
    detectedSections,
    matchedKeywords,
    missingKeywords,
  }
}
