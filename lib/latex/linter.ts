import type { Diagnostic } from '@codemirror/lint'
import type { EditorView } from '@codemirror/view'

// ---------------------------------------------------------------------------
// Brace balance linter
// Detects: unclosed {, unexpected }, unclosed [, unexpected ]
// ---------------------------------------------------------------------------
function checkBraces(doc: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const curlyStack: number[] = []   // positions of unclosed {
  const squareStack: number[] = []  // positions of unclosed [

  for (let i = 0; i < doc.length; i++) {
    const ch = doc[i]

    // Skip escape sequences BEFORE comment check.
    // In LaTeX, \X where X is a non-letter is a single escaped character
    // (e.g. \% \$ \& \# \_ \{ \} \[ \]).  The % must NOT be treated as a
    // comment start when it follows a backslash.
    if (ch === '\\' && i + 1 < doc.length) {
      const next = doc[i + 1]
      if (!/[a-zA-Z]/.test(next)) {
        // Non-letter escape: skip both the backslash and the escaped char
        i++
      }
      // Letter-based commands (\textbf, \begin …): skip only the backslash;
      // the letters that follow are harmless for brace tracking
      continue
    }

    // Skip % line comments (only when NOT preceded by \, handled above)
    if (ch === '%') {
      while (i < doc.length && doc[i] !== '\n') i++
      continue
    }

    if (ch === '{') {
      curlyStack.push(i)
    } else if (ch === '}') {
      if (curlyStack.length === 0) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: 'Unexpected } — no matching { found',
        })
      } else {
        curlyStack.pop()
      }
    } else if (ch === '[') {
      squareStack.push(i)
    } else if (ch === ']') {
      if (squareStack.length === 0) {
        diagnostics.push({
          from: i,
          to: i + 1,
          severity: 'error',
          message: 'Unexpected ] — no matching [ found',
        })
      } else {
        squareStack.pop()
      }
    }
  }

  // Report any unclosed braces (report up to 5 to avoid noise)
  for (const pos of curlyStack.slice(-5)) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: 'Unclosed { — missing matching }',
    })
  }
  for (const pos of squareStack.slice(-5)) {
    diagnostics.push({
      from: pos,
      to: pos + 1,
      severity: 'error',
      message: 'Unclosed [ — missing matching ]',
    })
  }

  return diagnostics
}

// ---------------------------------------------------------------------------
// Environment mismatch linter
// Detects: \begin{X} without \end{X}, \end{Y} without \begin{Y}, mismatches
// ---------------------------------------------------------------------------
const BEGIN_RE = /\\begin\{([^}]*)\}/g
const END_RE = /\\end\{([^}]*)\}/g

interface EnvToken {
  name: string
  from: number
  to: number
}

function parseEnvTokens(doc: string): { begins: EnvToken[]; ends: EnvToken[] } {
  const begins: EnvToken[] = []
  const ends: EnvToken[] = []

  // Build a set of comment ranges to skip.
  // A % starts a comment only when NOT preceded by a backslash (\% is a
  // literal percent sign in LaTeX, not a comment).
  const commentRanges: Array<[number, number]> = []
  const commentRe = /(?<!\\)%(.*?)(\n|$)/g
  let m: RegExpExecArray | null
  while ((m = commentRe.exec(doc)) !== null) {
    commentRanges.push([m.index, m.index + m[0].length])
  }

  function isInComment(pos: number): boolean {
    return commentRanges.some(([s, e]) => pos >= s && pos < e)
  }

  BEGIN_RE.lastIndex = 0
  while ((m = BEGIN_RE.exec(doc)) !== null) {
    if (!isInComment(m.index)) {
      begins.push({ name: m[1], from: m.index, to: m.index + m[0].length })
    }
  }

  END_RE.lastIndex = 0
  while ((m = END_RE.exec(doc)) !== null) {
    if (!isInComment(m.index)) {
      ends.push({ name: m[1], from: m.index, to: m.index + m[0].length })
    }
  }

  return { begins, ends }
}

function checkEnvironments(doc: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const { begins, ends } = parseEnvTokens(doc)

  // Stack-based matching
  const stack: EnvToken[] = []

  // Merge begins and ends sorted by position
  const tokens = [...begins.map(t => ({ ...t, kind: 'begin' as const })),
                  ...ends.map(t => ({ ...t, kind: 'end' as const }))]
  tokens.sort((a, b) => a.from - b.from)

  for (const token of tokens) {
    if (token.kind === 'begin') {
      stack.push(token)
    } else {
      // end token
      if (stack.length === 0) {
        diagnostics.push({
          from: token.from,
          to: token.to,
          severity: 'error',
          message: `\\end{${token.name}} has no matching \\begin{${token.name}}`,
        })
      } else {
        const top = stack[stack.length - 1]
        if (top.name !== token.name) {
          diagnostics.push({
            from: token.from,
            to: token.to,
            severity: 'error',
            message: `Environment mismatch: \\begin{${top.name}} closed by \\end{${token.name}}`,
          })
          // Still pop to avoid cascading errors
          stack.pop()
        } else {
          stack.pop()
        }
      }
    }
  }

  // Remaining unclosed \begin{}
  for (const token of stack) {
    diagnostics.push({
      from: token.from,
      to: token.to,
      severity: 'error',
      message: `\\begin{${token.name}} has no matching \\end{${token.name}}`,
    })
  }

  return diagnostics
}

// ---------------------------------------------------------------------------
// Missing package warnings + quick-fix action
// Detects commands that require specific packages not loaded in preamble
// ---------------------------------------------------------------------------
const PACKAGE_COMMANDS: Array<{ pattern: RegExp; pkg: string; cmd: string }> = [
  { pattern: /\\href\b/, pkg: 'hyperref', cmd: '\\href' },
  { pattern: /\\url\b/, pkg: 'hyperref', cmd: '\\url' },
  { pattern: /\\textcolor\b/, pkg: 'xcolor', cmd: '\\textcolor' },
  { pattern: /\\colorbox\b/, pkg: 'xcolor', cmd: '\\colorbox' },
  { pattern: /\\definecolor\b/, pkg: 'xcolor', cmd: '\\definecolor' },
  { pattern: /\\geometry\b/, pkg: 'geometry', cmd: '\\geometry' },
  { pattern: /\\includegraphics\b/, pkg: 'graphicx', cmd: '\\includegraphics' },
]

/** Find the best line position to insert a new \usepackage{} declaration. */
function findPackageInsertPos(doc: string): { pos: number; prefix: string; suffix: string } {
  // Prefer: after the last existing \usepackage line
  const pkgRe = /\\usepackage(?:\[[^\]]*\])?\{[^}]+\}/g
  let lastPkgEnd = -1
  let m: RegExpExecArray | null
  while ((m = pkgRe.exec(doc)) !== null) {
    const lineEnd = doc.indexOf('\n', m.index + m[0].length)
    lastPkgEnd = lineEnd !== -1 ? lineEnd : doc.length
  }
  if (lastPkgEnd !== -1) {
    return { pos: lastPkgEnd, prefix: '\n', suffix: '' }
  }

  // Fallback: after \documentclass line
  const docclass = /\\documentclass[^\n]*\n/.exec(doc)
  if (docclass) {
    return { pos: docclass.index + docclass[0].length, prefix: '', suffix: '\n' }
  }

  // Last resort: top of document
  return { pos: 0, prefix: '', suffix: '\n' }
}

function checkMissingPackages(doc: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = []

  // Extract loaded packages from \usepackage{...}
  const loadedPkgs = new Set<string>()
  const pkgRe = /\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g
  let m: RegExpExecArray | null
  while ((m = pkgRe.exec(doc)) !== null) {
    m[1].split(',').forEach(p => loadedPkgs.add(p.trim()))
  }

  for (const { pattern, pkg, cmd } of PACKAGE_COMMANDS) {
    if (loadedPkgs.has(pkg)) continue

    const re = new RegExp(pattern.source, 'g')
    while ((m = re.exec(doc)) !== null) {
      // Skip if in a comment line (% not preceded by \)
      const lineStart = doc.lastIndexOf('\n', m.index) + 1
      const linePrefix = doc.slice(lineStart, m.index)
      if (/(?<!\\)%/.test(linePrefix)) continue

      diagnostics.push({
        from: m.index,
        to: m.index + cmd.length,
        severity: 'warning',
        message: `${cmd} requires \\usepackage{${pkg}} in the preamble`,
        actions: [{
          name: `Add \\usepackage{${pkg}}`,
          apply(view) {
            const { pos, prefix, suffix } = findPackageInsertPos(view.state.doc.toString())
            view.dispatch({
              changes: { from: pos, to: pos, insert: `${prefix}\\usepackage{${pkg}}${suffix}` },
            })
          },
        }],
      })
      break // one warning per command type is enough
    }
  }

  return diagnostics
}

// ---------------------------------------------------------------------------
// Combined linter function — called by CodeMirror on every document change
// ---------------------------------------------------------------------------
export function latexLinter(view: EditorView): Diagnostic[] {
  const doc = view.state.doc.toString()

  // Skip linting on very large documents to avoid jank
  if (doc.length > 50_000) return []

  return [
    ...checkBraces(doc),
    ...checkEnvironments(doc),
    ...checkMissingPackages(doc),
  ]
}
