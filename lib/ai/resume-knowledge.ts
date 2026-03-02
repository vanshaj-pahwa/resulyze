import fs from 'fs'
import path from 'path'

const KNOWLEDGE_PATH = path.join(process.cwd(), 'lib', 'knowledge', 'resume-rules.md')
const fullKnowledge = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8')

/**
 * Full resume knowledge base (~4K tokens).
 * Use for endpoints with large context budgets: chat-latex, review-resume.
 */
export function getFullResumeKnowledge(): string {
  return fullKnowledge
}

/**
 * Condensed resume knowledge (~1.5K tokens).
 * Keeps headings + rule bullets, strips examples and explanatory paragraphs.
 * Use for token-constrained endpoints: optimize-latex, generate-cover-letter.
 */
export function getCondensedResumeKnowledge(): string {
  const lines = fullKnowledge.split('\n')
  const condensed: string[] = []

  for (const line of lines) {
    // Skip example lines (Bad:/Good: comparisons)
    if (line.match(/^- (Bad|Good):/)) continue
    // Skip indented code/example blocks (but keep indented list items)
    if (line.startsWith('    ') && !line.startsWith('    -')) continue
    // Skip blank explanatory paragraphs (lines that don't start with #, -, or ---)
    if (line.trim() !== '' && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('---') && !line.match(/^\d+\./)) continue

    condensed.push(line)
  }

  return condensed.join('\n')
}
