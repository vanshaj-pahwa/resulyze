import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getFullResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'

export interface TrimItem {
  index: number
  lineNum: number
  raw: string      // Original LaTeX line (for applying changes)
  text: string     // Clean text (for AI and display)
  section: string  // Section context (e.g. "Experience at Google")
}

function stripLatexText(text: string): string {
  return text
    .replace(/\\resumeItem\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\textit\{([^}]*)\}/g, '$1')
    .replace(/\\emph\{([^}]*)\}/g, '$1')
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z@]+/g, '')
    .replace(/\$\$?([^$]*)\$\$?/g, '$1')
    .replace(/[{}$\\|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDocumentBody(source: string): string {
  const start = source.indexOf('\\begin{document}')
  const end = source.indexOf('\\end{document}')
  if (start !== -1 && end !== -1) {
    return source.slice(start, end + '\\end{document}'.length)
  }
  return source
}

function extractContentItems(source: string): TrimItem[] {
  const body = extractDocumentBody(source)
  const lines = body.split('\n')
  const items: TrimItem[] = []
  let currentSection = 'General'
  let currentEntry = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('%')) continue

    // Track section heading
    const secMatch = trimmed.match(/\\section\*?\{([^}]+)\}/)
    if (secMatch) {
      currentSection = secMatch[1]
      currentEntry = ''
      continue
    }

    // Track entry header (experience / project title lines)
    // Jake's: \resumeSubheading{Company}{Dates}{Title}{Location}
    const subheadingMatch = trimmed.match(/\\resumeSubheading\{([^}]*)\}/)
    if (subheadingMatch) {
      currentEntry = ` at ${subheadingMatch[1]}`
      continue
    }
    // Classic: \resentry{Title}{Dates}{Company}{Location}
    const resEntryMatch = trimmed.match(/\\resentry\{([^}]*)\}/)
    if (resEntryMatch) {
      currentEntry = ` at ${resEntryMatch[1]}`
      continue
    }
    // Minimal / sidebar: \textbf{Title,} {Company} -- Location \hfill Dates
    if (trimmed.includes('\\hfill') && (trimmed.includes('20') || trimmed.includes('Present'))) {
      const clean = stripLatexText(trimmed)
      // Only use as entry header if it looks like a job/project line (has hfill date)
      if (clean.length > 5 && !items.find(it => it.lineNum === i)) {
        currentEntry = clean.slice(0, 50)
      }
      continue
    }

    const sectionLabel = currentSection + (currentEntry ? ` — ${currentEntry}` : '')

    // ── Bullet points ─────────────────────────────────────────────────────────
    if (/^\\resumeItem\{/.test(trimmed)) {
      const text = stripLatexText(trimmed)
      if (text.length > 8) {
        items.push({ index: items.length, lineNum: i, raw: line, text, section: sectionLabel })
      }
      continue
    }

    if (/^\\item\s/.test(trimmed)) {
      const text = stripLatexText(trimmed)
      if (text.length > 8) {
        items.push({ index: items.length, lineNum: i, raw: line, text, section: sectionLabel })
      }
      continue
    }

    // ── Skill category lines ───────────────────────────────────────────────────
    if (
      currentSection.toLowerCase().includes('skill') &&
      /^\\textbf\{/.test(trimmed)
    ) {
      const text = stripLatexText(trimmed)
      if (text.length > 5) {
        items.push({ index: items.length, lineNum: i, raw: line, text, section: sectionLabel })
      }
      continue
    }
  }

  return items
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { latexSource, jobData, pageCount } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }

    const items = extractContentItems(latexSource)

    if (items.length === 0) {
      return NextResponse.json({ changes: [], items: [] })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 16384,
          responseMimeType: 'application/json',
        },
      },
      { apiVersion: 'v1beta' }
    )

    const jobContext = jobData
      ? '\n\nTARGET ROLE:\n' +
        '- Title: ' + (jobData.jobTitle || 'Not specified') + '\n' +
        '- Company: ' + (jobData.company || 'Not specified') + '\n' +
        '- Required Skills: ' + ((jobData.skills || []).join(', ') || 'Not specified')
      : ''

    const itemsList = items
      .map(item => `[${item.index}] (${item.section}) ${item.text}`)
      .join('\n')

    const minChanges = Math.max(3, Math.min(8, Math.ceil(items.length * 0.25)))

    const prompt = `You are an expert resume editor. This resume is ${pageCount || 2} pages and MUST fit on ONE page.

${getFullResumeKnowledge()}
${jobContext}

Here are the numbered content items from the resume (${items.length} total):

${itemsList}

⚠️ CRITICAL: You MUST return at least ${minChanges} changes. A ${pageCount || 2}-page resume ALWAYS needs trimming. Every bullet is a candidate — even good ones can be compressed to save space.

TRIMMING PRIORITY:
1. Remove bullets that are the weakest — least metrics, most passive voice, or least relevant to role
2. Compress long bullets (over 20 words) using the XYZ formula — shorter but still impactful
3. Remove redundant skill lines that overlap with others
4. Remove bullets from the oldest experience entry if still over budget

RULES:
- Do NOT suggest removing ALL bullets from any one experience entry (keep at least 2)
- Do NOT remove entire sections

Return a JSON object: { "changes": [...] }

Each change object must have:
- "id": unique string ("1", "2", etc.)
- "type": "remove" or "compress"
- "itemIndex": the [N] number from the list above (integer, not string)
- "section": the section label from the list
- "reasoning": one sentence explaining why this specific item saves space
- "newText": (compress type only) the compressed plain text with NO LaTeX commands`

    const result = await generateWithRetry(model, prompt)

    let changes: any[] = []
    try {
      // Strip trailing commas (common AI mistake: last property in object ends with ,)
      const sanitized = result.replace(/,(\s*[}\]])/g, '$1')
      const parsed = JSON.parse(sanitized)
      const raw: any[] = Array.isArray(parsed) ? parsed : (parsed.changes ?? [])

      // Map to display-ready TrimChange, filtering invalid indices
      changes = raw
        .filter(
          (c: any) =>
            c &&
            typeof c.itemIndex === 'number' &&
            c.itemIndex >= 0 &&
            c.itemIndex < items.length &&
            (c.type === 'remove' || c.type === 'compress')
        )
        .map((c: any, i: number) => ({
          id: String(c.id ?? i + 1),
          type: c.type,
          itemIndex: c.itemIndex,
          section: items[c.itemIndex]?.section ?? c.section ?? '',
          reasoning: c.reasoning ?? '',
          displayText: items[c.itemIndex]?.text ?? '',
          newText: c.newText ?? undefined,
        }))
    } catch (e: any) {
      console.error('trim-resume: failed to parse AI JSON:', e.message, '\nResult:\n', result)
    }

    return NextResponse.json({ changes, items })
  } catch (error: any) {
    console.error('Error trimming resume:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to trim resume' },
      { status: 500 }
    )
  }
}
