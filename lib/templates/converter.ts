/**
 * Template converter — extracts user content from any template format and
 * rebuilds it using the target template's preamble and commands.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactInfo {
  name: string
  phone: string
  email: string
  linkedin: string
  github: string
}

interface NormalizedEntry {
  title: string
  organization: string
  dates: string
  location: string
  bullets: string[]
}

interface NormalizedProject {
  nameBlock: string // raw LaTeX for the name+tech part (already formatted nicely)
  link: string      // raw \href{...}{...} or URL
}

interface ParsedResume {
  contact: ContactInfo
  profileText: string
  skillsText: string
  experience: NormalizedEntry[]
  projects: NormalizedProject[]
  education: NormalizedEntry[]
  achievementsText: string
}

// ─── Brace-aware arg extractor ────────────────────────────────────────────────

function extractBraceContent(str: string, pos: number): { content: string; end: number } {
  if (pos >= str.length || str[pos] !== '{') return { content: '', end: pos }
  let depth = 1
  let i = pos + 1
  while (i < str.length && depth > 0) {
    if (str[i] === '\\') { i += 2; continue }
    if (str[i] === '{') depth++
    else if (str[i] === '}') depth--
    i++
  }
  return { content: str.substring(pos + 1, i - 1), end: i }
}

function getBraceArgs(str: string, startPos: number, n: number): string[] {
  const args: string[] = []
  let pos = startPos
  for (let i = 0; i < n; i++) {
    while (pos < str.length && /\s/.test(str[pos])) pos++
    if (pos >= str.length || str[pos] !== '{') break
    const { content, end } = extractBraceContent(str, pos)
    args.push(content)
    pos = end
  }
  return args
}

// ─── Contact extraction ───────────────────────────────────────────────────────

function extractContact(latex: string): ContactInfo {
  let name = 'Your Name'
  const namePatterns = [
    /\\textbf\{\\Huge\s+([^}\\]+(?:\\[^{]*\{[^}]*\}[^}]*)*)\}/,
    /\{\\LARGE\\textbf\{([^}]+)\}\}/,
    /\{\\large\\textbf\{([^}]+)\}\}/,
    /\\textbf\{\\LARGE\s+([^}]+)\}/,
  ]
  for (const p of namePatterns) {
    const m = latex.match(p)
    if (m) { name = m[1].trim(); break }
  }

  // Phone: digits/spaces/parens/dashes before a delimiter
  const phoneMatch = latex.match(/(\+?[\d()\s.-]{7,20})(?=\s*(?:\$\s*\\[|]|\$\s*\\cdot|\s*\\cdot|\s*\|))/m)
  const phone = phoneMatch ? phoneMatch[1].trim() : ''

  const emailHrefMatch = latex.match(/\\href\{mailto:([^}]+)\}/)
  const email = emailHrefMatch ? emailHrefMatch[1].trim() : ''

  const linkedinMatch = latex.match(/\\href\{https?:\/\/(?:www\.)?linkedin\.com\/in\/([^}]+)\}/)
  const linkedin = linkedinMatch ? linkedinMatch[1].trim() : ''

  const githubMatch = latex.match(/\\href\{https?:\/\/(?:www\.)?github\.com\/([^}]+)\}/)
  const github = githubMatch ? githubMatch[1].trim() : ''

  return { name, phone, email, linkedin, github }
}

// ─── Section content extraction ───────────────────────────────────────────────

function getDocumentBody(latex: string): string {
  const begin = latex.indexOf('\\begin{document}')
  const end = latex.indexOf('\\end{document}')
  if (begin === -1 || end === -1) return latex
  return latex.substring(begin + '\\begin{document}'.length, end)
}

/** Returns the raw LaTeX content block of a named section (everything after
 *  the section header until the next section header). */
function extractSectionBlock(body: string, sectionName: string): string {
  // Match any of the section commands used across templates
  const sectionCmds = ['\\\\section', '\\\\ressection', '\\\\minsec', '\\\\mainsec', '\\\\sidesec']
  const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const headerRe = new RegExp(
    `(?:${sectionCmds.join('|')})\\*?\\{${escapedName}\\}`,
    'i'
  )
  const allHeadersRe = new RegExp(
    `(?:${sectionCmds.join('|')})\\*?\\{[^}]+\\}`,
    'gi'
  )

  const start = body.search(headerRe)
  if (start === -1) return ''

  // Find the next section header after this one
  allHeadersRe.lastIndex = start + 1
  const nextMatch = allHeadersRe.exec(body)
  const end = nextMatch ? nextMatch.index : body.length

  return body.substring(start, end)
}

/** Strip the leading section header command so we get just the body of the section */
function stripSectionHeader(block: string): string {
  return block.replace(/^\\(?:section|ressection|minsec|mainsec|sidesec)\*?\{[^}]+\}\s*/i, '').trim()
}

// ─── Entry parsers ────────────────────────────────────────────────────────────

function extractModernEntries(content: string): NormalizedEntry[] {
  const entries: NormalizedEntry[] = []
  const cmd = '\\resumeSubheading'
  let pos = 0

  while (pos < content.length) {
    const idx = content.indexOf(cmd, pos)
    if (idx === -1) break

    const afterCmd = idx + cmd.length
    const args = getBraceArgs(content, afterCmd, 4)
    if (args.length < 4) { pos = afterCmd; continue }

    const [organization, dates, title, location] = args

    // Find bullets in the \resumeItemListStart...\resumeItemListEnd block
    const listStartStr = '\\resumeItemListStart'
    const listEndStr = '\\resumeItemListEnd'
    const nextCmdIdx = content.indexOf(cmd, afterCmd)

    const listStart = content.indexOf(listStartStr, afterCmd)
    const listEnd = content.indexOf(listEndStr, afterCmd)

    const bullets: string[] = []
    if (
      listStart !== -1 &&
      listEnd !== -1 &&
      (nextCmdIdx === -1 || listStart < nextCmdIdx)
    ) {
      const listContent = content.substring(listStart + listStartStr.length, listEnd)
      let p = 0
      while (p < listContent.length) {
        const itemIdx = listContent.indexOf('\\resumeItem', p)
        if (itemIdx === -1) break
        // skip the command name, then read the brace arg
        const braceStart = listContent.indexOf('{', itemIdx + '\\resumeItem'.length)
        if (braceStart === -1) break
        const { content: bullet, end } = extractBraceContent(listContent, braceStart)
        bullets.push(bullet.trim())
        p = end
      }
    }

    entries.push({
      title: title.trim(),
      organization: organization.trim(),
      dates: dates.trim(),
      location: location.trim(),
      bullets,
    })

    pos = nextCmdIdx !== -1 ? nextCmdIdx : content.length
  }

  return entries
}

function extractStandardEntries(content: string, cmd: string): NormalizedEntry[] {
  const entries: NormalizedEntry[] = []
  const fullCmd = `\\${cmd}`
  let pos = 0

  while (pos < content.length) {
    const idx = content.indexOf(fullCmd, pos)
    if (idx === -1) break

    const afterCmd = idx + fullCmd.length
    const args = getBraceArgs(content, afterCmd, 4)
    if (args.length < 4) { pos = afterCmd; continue }

    // Standard templates: {title}{dates}{organization}{location}
    const [title, dates, organization, location] = args

    // Find bullets in \begin{itemize}...\end{itemize}
    const nextCmdIdx = content.indexOf(fullCmd, afterCmd)
    const itemizeStart = content.indexOf('\\begin{itemize}', afterCmd)
    const itemizeEnd = content.indexOf('\\end{itemize}', afterCmd)

    const bullets: string[] = []
    if (
      itemizeStart !== -1 &&
      itemizeEnd !== -1 &&
      (nextCmdIdx === -1 || itemizeStart < nextCmdIdx)
    ) {
      const itemContent = content.substring(itemizeStart, itemizeEnd + '\\end{itemize}'.length)
      // Extract \item text — grab everything from \item until the next \item or end
      const itemRe = /\\item\s+([\s\S]+?)(?=\\item|\\end\{itemize\})/g
      let m
      while ((m = itemRe.exec(itemContent)) !== null) {
        bullets.push(m[1].trim())
      }
    }

    entries.push({
      title: title.trim(),
      organization: organization.trim(),
      dates: dates.trim(),
      location: location.trim(),
      bullets,
    })

    pos = nextCmdIdx !== -1 ? nextCmdIdx : content.length
  }

  return entries
}

/** Fallback for sidebar-style free-form education: \textbf{Org} \\ Degree \\ Year */
function extractSidebarFreeformEntry(content: string): NormalizedEntry[] {
  const tbfIdx = content.indexOf('\\textbf{')
  if (tbfIdx === -1) return []

  const { content: org, end: orgEnd } = extractBraceContent(content, tbfIdx + '\\textbf'.length)
  if (!org) return []

  // Split remaining content on \\ line breaks and clean up
  const remaining = content.substring(orgEnd)
  const parts = remaining
    .split('\\\\')
    .map(s => s
      .replace(/\[[\d.]+pt\]/g, '')
      .replace(/\\textit\{([^}]+)\}/g, '$1')
      .replace(/\\footnotesize\s*/g, '')
      .replace(/[{}]/g, '')
      .trim()
    )
    .filter(s => s.length > 1 && !/(?:minipage|sidesec|mainsec|sidesec|end\{)/.test(s))

  return [{
    title: parts[0] ?? '',
    organization: org,
    dates: parts[1] ?? '',
    location: parts[2] ?? '',
    bullets: [],
  }]
}

function detectAndExtractEntries(content: string): NormalizedEntry[] {
  if (content.includes('\\resumeSubheading')) return extractModernEntries(content)
  if (content.includes('\\resentry{')) return extractStandardEntries(content, 'resentry')
  if (content.includes('\\minentry{')) return extractStandardEntries(content, 'minentry')
  if (content.includes('\\mainentry{')) return extractStandardEntries(content, 'mainentry')
  // Fallback for sidebar template's free-form education block
  return extractSidebarFreeformEntry(content)
}

// ─── Project parsers ──────────────────────────────────────────────────────────

function extractModernProjects(content: string): NormalizedProject[] {
  const projects: NormalizedProject[] = []
  const cmd = '\\resumeProjectHeading'
  let pos = 0

  while (pos < content.length) {
    const idx = content.indexOf(cmd, pos)
    if (idx === -1) break

    const afterCmd = idx + cmd.length
    const args = getBraceArgs(content, afterCmd, 2)
    if (args.length < 1) { pos = afterCmd; continue }

    projects.push({ nameBlock: args[0]?.trim() ?? '', link: args[1]?.trim() ?? '' })
    pos = afterCmd
  }

  return projects
}

function extractStandardProjects(content: string): NormalizedProject[] {
  // Classic/Minimal store projects as inline text lines: \textbf{Name} $|$ desc \hfill \href{...}{...}
  const projects: NormalizedProject[] = []
  // Match lines that contain \textbf{...} followed by description and optional \href
  const lineRe = /\\textbf\{([^}]+)\}(?:\s*\$\|\$\s*|\s*---\s*)([\s\S]+?)(?=\\\\|\n\n|\\vspace|\\textbf|$)/g
  let m
  while ((m = lineRe.exec(content)) !== null) {
    const name = m[1].trim()
    const rest = m[2].trim()

    // Try to find a \href in rest
    const hrefMatch = rest.match(/(\\href\{[^}]+\}\{[^}]+\})/)
    const link = hrefMatch ? hrefMatch[1] : ''

    // nameBlock: build the \textbf{Name} $|$ rest (without link at end)
    const descPart = rest.replace(/(\\hfill\s*)?\\href\{[^}]+\}\{[^}]+\}/, '').trim().replace(/\\\\$/, '').trim()
    const nameBlock = `\\textbf{${name}} $|$ ${descPart}`

    projects.push({ nameBlock, link })
  }
  return projects
}

function detectAndExtractProjects(content: string): NormalizedProject[] {
  if (content.includes('\\resumeProjectHeading')) return extractModernProjects(content)
  return extractStandardProjects(content)
}

// ─── Full resume parser ───────────────────────────────────────────────────────

export function parseResume(latex: string): ParsedResume {
  const contact = extractContact(latex)
  const body = getDocumentBody(latex)

  const profileBlock = extractSectionBlock(body, 'Profile')
  const skillsBlock = extractSectionBlock(body, 'Skills')
  const expBlock = extractSectionBlock(body, 'Experience')
  const projBlock = extractSectionBlock(body, 'Projects')
  const eduBlock = extractSectionBlock(body, 'Education')
  const achBlock = extractSectionBlock(body, 'Achievements')

  return {
    contact,
    profileText: stripSectionHeader(profileBlock),
    skillsText: stripSectionHeader(skillsBlock),
    experience: detectAndExtractEntries(expBlock),
    projects: detectAndExtractProjects(projBlock),
    education: detectAndExtractEntries(eduBlock),
    achievementsText: stripSectionHeader(achBlock),
  }
}

// ─── Template builders ────────────────────────────────────────────────────────

function buildHeader(contact: ContactInfo): string {
  const parts: string[] = []
  if (contact.phone) parts.push(contact.phone)
  if (contact.email) parts.push(`\\href{mailto:${contact.email}}{${contact.email}}`)
  if (contact.linkedin) parts.push(`\\href{https://${contact.linkedin}}{${contact.linkedin}}`)
  if (contact.github) parts.push(`\\href{https://${contact.github}}{${contact.github}}`)
  return parts.join(' $|$ ')
}

function buildModernDoc(data: ParsedResume, preamble: string): string {
  const header = buildHeader(data.contact)

  const profileSection = data.profileText
    ? `%-----------PROFILE-----------\n\\section{Profile}\n ${data.profileText}\n`
    : ''

  const skillsSection = data.skillsText
    ? `%-----------SKILLS-----------\n\\section{Skills}\n ${data.skillsText}\n`
    : ''

  const expEntries = data.experience.map(e => {
    const bullets = e.bullets.map(b => `        \\resumeItem{${b}}`).join('\n')
    return `
    \\resumeSubheading
      {${e.organization}}{${e.dates}}
      {${e.title}}{${e.location}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`
  }).join('\n')

  const expSection = data.experience.length
    ? `%-----------EXPERIENCE-----------\n\\section{Experience}\n  \\resumeSubHeadingListStart\n${expEntries}\n\n  \\resumeSubHeadingListEnd\n`
    : ''

  const projEntries = data.projects.map(p =>
    `      \\resumeProjectHeading\n          {${p.nameBlock}}{${p.link}}`
  ).join('\n')

  const projSection = data.projects.length
    ? `%-----------PROJECTS-----------\n\\section{Projects}\n    \\resumeSubHeadingListStart\n${projEntries}\n    \\resumeSubHeadingListEnd\n`
    : ''

  const eduEntries = data.education.map(e => `
    \\resumeSubheading
        {${e.organization}}{${e.dates}}
        {${e.title}}{${e.location}}`).join('\n')

  const eduSection = data.education.length
    ? `%-----------EDUCATION-----------\n\\section{Education}\n  \\resumeSubHeadingListStart\n${eduEntries}\n  \\resumeSubHeadingListEnd\n`
    : ''

  const achSection = data.achievementsText
    ? `%-----------ACHIEVEMENTS-----------\n\\section{Achievements}\n ${data.achievementsText}\n`
    : ''

  const body = [profileSection, skillsSection, expSection, projSection, eduSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge ${data.contact.name}} \\\\ \\vspace{5pt}
    \\small ${header}
    \\\\ \\vspace{-3pt}
\\end{center}

${body}
\\end{document}`
}

function buildStandardEntry(e: NormalizedEntry, cmd: string, itemizeOptions: string): string {
  const bullets = e.bullets.map(b => `  \\small\n  \\item ${b}`).join('\n')
  return `\\${cmd}{${e.title}}{${e.dates}}{${e.organization}}{${e.location}}
\\begin{itemize}${itemizeOptions}
${bullets}
\\end{itemize}`
}

function buildClassicDoc(data: ParsedResume, preamble: string): string {
  const header = buildHeader(data.contact)

  const profileSection = data.profileText
    ? `%-----------PROFILE-----------\n\\ressection{Profile}\n{\\small ${stripInlineSmall(data.profileText)}}\n`
    : ''

  const skillsSection = data.skillsText
    ? `%-----------SKILLS-----------\n\\ressection{Skills}\n${data.skillsText}\n`
    : ''

  const expEntries = data.experience.map(e =>
    buildStandardEntry(e, 'resentry', '[noitemsep, topsep=4pt, leftmargin=*]')
  ).join('\n\n\\vspace{6pt}\n')

  const expSection = data.experience.length
    ? `%-----------EXPERIENCE-----------\n\\ressection{Experience}\n\n${expEntries}\n`
    : ''

  const projLines = data.projects.map(p => {
    const hrefPart = p.link ? ` \\hfill ${p.link}` : ''
    return `{\\small ${p.nameBlock}${hrefPart}}`
  }).join(' \\\\[4pt]\n')

  const projSection = data.projects.length
    ? `%-----------PROJECTS-----------\n\\ressection{Projects}\n${projLines}\n`
    : ''

  const eduEntries = data.education.map(e =>
    `\\resentry{${e.title}}{${e.dates}}{${e.organization}}{${e.location}}`
  ).join('\n\\vspace{4pt}\n')

  const eduSection = data.education.length
    ? `%-----------EDUCATION-----------\n\\ressection{Education}\n${eduEntries}\n`
    : ''

  const achSection = data.achievementsText
    ? `%-----------ACHIEVEMENTS-----------\n\\ressection{Achievements}\n{\\small\n${stripInlineSmall(data.achievementsText)}\n}\n`
    : ''

  const body = [profileSection, skillsSection, expSection, projSection, eduSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\LARGE\\textbf{${data.contact.name}}} \\\\[6pt]
  \\small ${header}
\\end{center}

${body}
\\end{document}`
}

function buildMinimalDoc(data: ParsedResume, preamble: string): string {
  const contactParts: string[] = []
  if (data.contact.email) contactParts.push(`\\href{mailto:${data.contact.email}}{${data.contact.email}}`)
  if (data.contact.phone) contactParts.push(data.contact.phone)
  if (data.contact.linkedin) contactParts.push(`\\href{https://${data.contact.linkedin}}{${data.contact.linkedin}}`)
  if (data.contact.github) contactParts.push(`\\href{https://${data.contact.github}}{${data.contact.github}}`)

  // Convert skillsText (any template format) → \textbf{Cat:} items \\ lines
  const skillLines: string[] = []
  if (data.skillsText) {
    let pos = 0
    while (pos < data.skillsText.length) {
      const tbfIdx = data.skillsText.indexOf('\\textbf{', pos)
      if (tbfIdx === -1) break
      const { content: cat, end: catEnd } = extractBraceContent(data.skillsText, tbfIdx + '\\textbf'.length)
      let p = catEnd
      while (p < data.skillsText.length && /\s/.test(data.skillsText[p])) p++
      if (data.skillsText[p] === '{') {
        const { content: rawItems, end: itemsEnd } = extractBraceContent(data.skillsText, p)
        const items = rawItems.replace(/^:\s*/, '').trim()
        if (items) skillLines.push(`\\textbf{${cat.replace(/:$/, '')}:} ${items} \\\\`)
        pos = itemsEnd
      } else {
        pos = catEnd
      }
    }
  }

  const expEntries = data.experience.map(e => {
    const bullets = e.bullets.map(b => `  \\item ${b}`).join('\n')
    return `\\textbf{${e.title},} {${e.organization}} -- ${e.location} \\hfill ${e.dates} \\\\
\\vspace{-9pt}
\\begin{itemize}
${bullets}
\\end{itemize}`
  }).join('\n\n')

  const profileSection = data.profileText
    ? `\\vspace{-6.5pt}\n\n%-----------PROFILE-----------\n\\section*{Profile}\n${stripInlineSmall(data.profileText)}\n`
    : ''

  const skillsSection = skillLines.length
    ? `\\vspace{-10pt}\n\n%-----------SKILLS-----------\n\\section*{Skills}\n${skillLines.join('\n')}\n`
    : ''

  const expSection = data.experience.length
    ? `\\vspace{-6.5pt}\n\n%-----------EXPERIENCE-----------\n\\section*{Experience}\n${expEntries}\n`
    : ''

  const projLines = data.projects.map(p => {
    const name = extractProjectName(p.nameBlock)
    const desc = extractProjectDesc(p.nameBlock)
    const descPart = desc ? ` $|$ ${desc}` : ''
    const linkPart = p.link ? ` \\hfill ${p.link}` : ''
    return `\\textbf{${name}}${descPart}${linkPart} \\\\`
  }).join('\n')

  const projSection = data.projects.length
    ? `\\vspace{-18.5pt}\n\n%-----------PROJECTS-----------\n\\section*{Projects}\n${projLines}\n`
    : ''

  const eduLines = data.education.map(e =>
    `\\textbf{${e.organization}} -- ${e.title} \\hfill ${e.dates} \\\\`
  ).join('\n')

  const eduSection = data.education.length
    ? `\\vspace{-18.5pt}\n\n%-----------EDUCATION-----------\n\\section*{Education}\n${eduLines}\n`
    : ''

  const achRaw = stripInlineSmall(data.achievementsText)
  const achSection = achRaw
    ? `\\vspace{-6.5pt}\n\n%-----------ACHIEVEMENTS-----------\n\\section*{Achievements}\n${achRaw}\n`
    : ''

  const body = [skillsSection, expSection, projSection, eduSection, profileSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\centerline{\\Huge ${data.contact.name}}

\\vspace{5pt}

\\begin{center}
\\small ${contactParts.join(' $|$ ')}
\\end{center}

${body}
\\end{document}`
}

function buildSidebarDoc(data: ParsedResume, preamble: string): string {
  const expEntries = data.experience.map(e => {
    const bullets = e.bullets.map(b => `  \\small\n  \\item ${b}`).join('\n')
    return `\\mainentry{${e.title}}{${e.dates}}{${e.organization}}{${e.location}}
\\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em]
${bullets}
\\end{itemize}`
  }).join('\n\n\\vspace{4pt}\n')

  const projLines = data.projects.map(p => {
    const hrefPart = p.link ? ` $|$ {\\footnotesize ${p.link}}` : ''
    return `  {\\small \\textbf{${extractProjectName(p.nameBlock)}}${hrefPart} \\\\
  {\\footnotesize ${extractProjectDesc(p.nameBlock)}}}`
  }).join(' \\\\[5pt]\n')

  const firstEdu = data.education[0]
  const eduSidebarContent = firstEdu
    ? `{\\footnotesize\n  \\textbf{${firstEdu.organization}} \\\\\n  ${firstEdu.title} \\\\\n  ${firstEdu.dates}${firstEdu.location ? ` \\\\\n  \\textit{${firstEdu.location}}` : ''}\n}`
    : ''

  const contactLine = [
    data.contact.email ? `\\href{mailto:${data.contact.email}}{${data.contact.email}}` : '',
    data.contact.phone,
    data.contact.linkedin ? `\\href{https://${data.contact.linkedin}}{${data.contact.linkedin}}` : '',
    data.contact.github ? `\\href{https://${data.contact.github}}{${data.contact.github}}` : '',
  ].filter(Boolean).join(' $|$ ')

  return `${preamble}

\\begin{document}

%----------HEADING----------
{\\LARGE\\textbf{${data.contact.name}}} \\hfill
{\\small\\textcolor{accent}{Software Engineer}} \\\\[4pt]
{\\small ${contactLine}}

\\vspace{6pt}
\\noindent\\rule{\\textwidth}{1pt}
\\vspace{4pt}

% ─── Two-column body ───────────────────────────────────────────────────────
\\begin{minipage}[t]{0.30\\textwidth}

\\sidesec{Skills}
${data.skillsText ? `{\\footnotesize\n${convertSkillsForSidebar(data.skillsText)}\n}` : ''}

\\sidesec{Education}
${eduSidebarContent}

\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.66\\textwidth}

${data.profileText ? `\\mainsec{Profile}\n{\\small ${stripInlineSmall(data.profileText)}}\n` : ''}

\\mainsec{Experience}

${expEntries}

${data.projects.length ? `\\mainsec{Projects}\n{\\small\n${projLines}\n}` : ''}

\\end{minipage}

\\end{document}`
}

// ─── Small helpers ────────────────────────────────────────────────────────────

/** Remove leading \small or \footnotesize that some templates wrap content in */
function stripInlineSmall(text: string): string {
  return text.replace(/^\\(?:small|footnotesize)\s*/, '').replace(/^\{\\(?:small|footnotesize)\s*/, '{').trim()
}

function extractProjectName(nameBlock: string): string {
  const m = nameBlock.match(/\\textbf\{([^}]+)\}/)
  return m ? m[1] : nameBlock
}

function extractProjectDesc(nameBlock: string): string {
  return nameBlock
    .replace(/\\textbf\{[^}]+\}\s*(\$\|\$|---)\s*/, '')
    .replace(/\\href\{[^}]+\}\{[^}]+\}/g, '')
    .trim()
}

/** Convert skill lines from tabular/list format to sidebar dot-separated format */
function convertSkillsForSidebar(skillsText: string): string {
  const lines: string[] = []
  let pos = 0

  while (pos < skillsText.length) {
    const tbfIdx = skillsText.indexOf('\\textbf{', pos)
    if (tbfIdx === -1) break

    // Extract category name using brace-aware extractor (avoids stray `}`)
    const { content: category, end: catEnd } = extractBraceContent(skillsText, tbfIdx + '\\textbf'.length)

    // Look for the immediately following {: items} arg
    let p = catEnd
    while (p < skillsText.length && skillsText[p] === ' ') p++

    if (skillsText[p] === '{') {
      const { content: rawItems, end: itemsEnd } = extractBraceContent(skillsText, p)
      const cleanItems = rawItems.replace(/^:\s*/, '').trim()
      if (cleanItems) {
        const formatted = cleanItems.split(',').map(s => s.trim()).filter(Boolean).join(' $\\cdot$ ')
        lines.push(`  \\textbf{${category}} \\\\\n  ${formatted}`)
      }
      pos = itemsEnd
    } else {
      pos = catEnd
    }
  }

  return lines.length ? lines.join(' \\\\[4pt]\n') : skillsText
}

// ─── Preamble extraction ──────────────────────────────────────────────────────

function extractPreamble(templateSource: string): string {
  const idx = templateSource.indexOf('\\begin{document}')
  if (idx === -1) return templateSource
  return templateSource.substring(0, idx).trim()
}

// ─── AI-parsed data format ────────────────────────────────────────────────────

export interface AIResumeData {
  name: string
  phone: string
  email: string
  linkedin: string   // "linkedin.com/in/handle" (no https://)
  github: string     // "github.com/handle" (no https://)
  profile: string    // plain text
  skills: Array<{ category: string; items: string[] }>
  experience: Array<{
    title: string
    company: string
    dates: string
    location: string
    bullets: string[]
  }>
  projects: Array<{
    name: string
    tech: string
    link: string
    linkText: string
  }>
  education: Array<{
    institution: string
    degree: string
    dates: string
    location: string
  }>
  achievements: string[]
}

// ─── LaTeX escaping for AI plain-text fields ──────────────────────────────────

/** Escape special LaTeX characters in AI-provided plain text before LaTeX insertion.
 *  The AI parser strips all LaTeX commands (e.g. \% → %) so we must re-escape
 *  before inserting back into LaTeX source. */
function escLatex(text: string): string {
  return text
    .replace(/%/g, '\\%')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/_/g, '\\_')
}

/** Deep-escape all user-supplied plain-text fields in AI resume data.
 *  Skips URLs (link) and phone (keep symbols verbatim). */
function escapeAIData(raw: AIResumeData): AIResumeData {
  return {
    ...raw,
    name: escLatex(raw.name),
    profile: escLatex(raw.profile),
    skills: raw.skills.map(s => ({
      category: escLatex(s.category),
      items: s.items.map(escLatex),
    })),
    experience: raw.experience.map(e => ({
      ...e,
      title: escLatex(e.title),
      company: escLatex(e.company),
      location: escLatex(e.location),
      bullets: e.bullets.map(escLatex),
    })),
    projects: raw.projects.map(p => ({
      ...p,
      name: escLatex(p.name),
      tech: escLatex(p.tech),
      // link is a URL — never escape; linkText is display text inside \href
      linkText: escLatex(p.linkText),
    })),
    education: raw.education.map(e => ({
      ...e,
      institution: escLatex(e.institution),
      degree: escLatex(e.degree),
      location: escLatex(e.location),
    })),
    achievements: raw.achievements.map(escLatex),
  }
}

// ─── AI-aware template builders ───────────────────────────────────────────────

function aiContactLine(data: AIResumeData): string {
  const parts: string[] = []
  if (data.phone) parts.push(data.phone)
  if (data.email) parts.push(`\\href{mailto:${data.email}}{${data.email}}`)
  if (data.linkedin) parts.push(`\\href{https://${data.linkedin}}{${data.linkedin}}`)
  if (data.github) parts.push(`\\href{https://${data.github}}{${data.github}}`)
  return parts.join(' $|$ ')
}

function aiSkillsModern(skills: AIResumeData['skills']): string {
  if (!skills.length) return ''
  const lines = skills.map(s => `     \\textbf{${s.category}}{: ${s.items.join(', ')}} \\\\`).join('\n')
  return `\\begin{itemize}[leftmargin=0in, label={}]\n    \\small{\\item{\n${lines}\n    }}\n   \\end{itemize}`
}

function aiSkillsStandard(skills: AIResumeData['skills']): string {
  if (!skills.length) return ''
  return skills.map(s => `\\textbf{${s.category}}{: ${s.items.join(', ')}} \\\\`).join('\n     ')
}

function aiSkillsSidebar(skills: AIResumeData['skills']): string {
  if (!skills.length) return ''
  return skills.map(s =>
    `  \\textbf{${s.category}} \\\\\n  ${s.items.join(' $\\cdot$ ')}`
  ).join(' \\\\[4pt]\n')
}

function aiBulletsModern(bullets: string[]): string {
  return bullets.map(b => `        \\resumeItem{${b}}`).join('\n')
}

function aiBulletsStandard(bullets: string[]): string {
  return bullets.map(b => `  \\small\n  \\item ${b}`).join('\n')
}

function buildModernFromAI(data: AIResumeData, preamble: string): string {
  const header = aiContactLine(data)
  const skillsBlock = aiSkillsModern(data.skills)

  const profileSection = data.profile
    ? `%-----------PROFILE-----------\n\\section{Profile}\n \\begin{itemize}[leftmargin=0in, label={}]\n    \\small{\\item{\n     ${data.profile}\n    }}\n \\end{itemize}\n`
    : ''

  const skillsSection = skillsBlock
    ? `%-----------SKILLS-----------\n\\section{Skills}\n ${skillsBlock}\n`
    : ''

  const expEntries = data.experience.map(e => {
    const bullets = aiBulletsModern(e.bullets)
    return `\n    \\resumeSubheading\n      {${e.company}}{${e.dates}}\n      {${e.title}}{${e.location}}\n      \\resumeItemListStart\n${bullets}\n      \\resumeItemListEnd`
  }).join('\n')

  const expSection = data.experience.length
    ? `%-----------EXPERIENCE-----------\n\\section{Experience}\n  \\resumeSubHeadingListStart\n${expEntries}\n\n  \\resumeSubHeadingListEnd\n`
    : ''

  const projEntries = data.projects.map(p => {
    const nameBlock = p.tech ? `\\textbf{${p.name}} $|$ ${p.tech}` : `\\textbf{${p.name}}`
    const link = p.link ? `\\href{${p.link}}{${p.linkText || 'Link'}}` : ''
    return `      \\resumeProjectHeading\n          {${nameBlock}}{${link}}`
  }).join('\n')

  const projSection = data.projects.length
    ? `%-----------PROJECTS-----------\n\\section{Projects}\n    \\resumeSubHeadingListStart\n${projEntries}\n    \\resumeSubHeadingListEnd\n`
    : ''

  const eduEntries = data.education.map(e =>
    `\n    \\resumeSubheading\n        {${e.institution}}{${e.dates}}\n        {${e.degree}}{${e.location}}`
  ).join('\n')

  const eduSection = data.education.length
    ? `%-----------EDUCATION-----------\n\\section{Education}\n  \\resumeSubHeadingListStart\n${eduEntries}\n  \\resumeSubHeadingListEnd\n`
    : ''

  const achLines = data.achievements.map((a, i) =>
    `     ${a}${i < data.achievements.length - 1 ? ' \\vspace{2pt} \\\\' : ''}`
  ).join('\n')
  const achBlock = data.achievements.length
    ? `\\begin{itemize}[leftmargin=0in, label={}]\n    \\small{\\item{\n${achLines}\n    }}\n  \\end{itemize}`
    : ''
  const achSection = achBlock
    ? `%-----------ACHIEVEMENTS-----------\n\\section{Achievements}\n ${achBlock}\n`
    : ''

  const body = [profileSection, skillsSection, expSection, projSection, eduSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge ${data.name}} \\\\ \\vspace{5pt}
    \\small ${header}
    \\\\ \\vspace{-3pt}
\\end{center}

${body}
\\end{document}`
}

function buildClassicFromAI(data: AIResumeData, preamble: string): string {
  const header = aiContactLine(data)

  const profileSection = data.profile
    ? `%-----------PROFILE-----------\n\\ressection{Profile}\n{\\small ${data.profile}}\n`
    : ''

  const skillsSection = data.skills.length
    ? `%-----------SKILLS-----------\n\\ressection{Skills}\n${aiSkillsStandard(data.skills)}\n`
    : ''

  const expEntries = data.experience.map(e => {
    const bullets = aiBulletsStandard(e.bullets)
    return `\\resentry{${e.title}}{${e.dates}}{${e.company}}{${e.location}}\n\\begin{itemize}[noitemsep, topsep=4pt, leftmargin=*]\n${bullets}\n\\end{itemize}`
  }).join('\n\n\\vspace{6pt}\n')

  const expSection = data.experience.length
    ? `%-----------EXPERIENCE-----------\n\\ressection{Experience}\n\n${expEntries}\n`
    : ''

  const projLines = data.projects.map(p => {
    const nameBlock = p.tech ? `\\textbf{${p.name}} $|$ ${p.tech}` : `\\textbf{${p.name}}`
    const hrefPart = p.link ? ` \\hfill \\href{${p.link}}{${p.linkText || 'Link'}}` : ''
    return `{\\small ${nameBlock}${hrefPart}}`
  }).join(' \\\\[4pt]\n')

  const projSection = data.projects.length
    ? `%-----------PROJECTS-----------\n\\ressection{Projects}\n${projLines}\n`
    : ''

  const eduEntries = data.education.map(e =>
    `\\resentry{${e.degree}}{${e.dates}}{${e.institution}}{${e.location}}`
  ).join('\n\\vspace{4pt}\n')

  const eduSection = data.education.length
    ? `%-----------EDUCATION-----------\n\\ressection{Education}\n${eduEntries}\n`
    : ''

  const achSection = data.achievements.length
    ? `%-----------ACHIEVEMENTS-----------\n\\ressection{Achievements}\n{\\small\n${data.achievements.join(' \\vspace{2pt} \\\\\n')}\n}\n`
    : ''

  const body = [profileSection, skillsSection, expSection, projSection, eduSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\begin{center}
  {\\LARGE\\textbf{${data.name}}} \\\\[6pt]
  \\small ${header}
\\end{center}

${body}
\\end{document}`
}

function buildMinimalFromAI(data: AIResumeData, preamble: string): string {
  const contactParts: string[] = []
  if (data.email) contactParts.push(`\\href{mailto:${data.email}}{${data.email}}`)
  if (data.phone) contactParts.push(data.phone)
  if (data.linkedin) contactParts.push(`\\href{https://${data.linkedin}}{${data.linkedin}}`)
  if (data.github) contactParts.push(`\\href{https://${data.github}}{${data.github}}`)

  const skillLines = data.skills.map(s => `\\textbf{${s.category}:} ${s.items.join(', ')} \\\\`).join('\n')
  const skillsSection = data.skills.length
    ? `\\vspace{-10pt}\n\n%-----------SKILLS-----------\n\\section*{Skills}\n${skillLines}\n`
    : ''

  const expEntries = data.experience.map(e => {
    const bullets = e.bullets.map(b => `  \\item ${b}`).join('\n')
    return `\\textbf{${e.title},} {${e.company}} -- ${e.location} \\hfill ${e.dates} \\\\
\\vspace{-9pt}
\\begin{itemize}
${bullets}
\\end{itemize}`
  }).join('\n\n')

  const expSection = data.experience.length
    ? `\\vspace{-6.5pt}\n\n%-----------EXPERIENCE-----------\n\\section*{Experience}\n${expEntries}\n`
    : ''

  const projLines = data.projects.map(p => {
    const descPart = p.tech ? ` $|$ ${p.tech}` : ''
    const linkPart = p.link ? ` \\hfill \\href{${p.link}}{${p.linkText || 'Link'}}` : ''
    return `\\textbf{${p.name}}${descPart}${linkPart} \\\\`
  }).join('\n')

  const projSection = data.projects.length
    ? `\\vspace{-18.5pt}\n\n%-----------PROJECTS-----------\n\\section*{Projects}\n${projLines}\n`
    : ''

  const eduLines = data.education.map(e =>
    `\\textbf{${e.institution}} -- ${e.degree} \\hfill ${e.dates} \\\\`
  ).join('\n')

  const eduSection = data.education.length
    ? `\\vspace{-18.5pt}\n\n%-----------EDUCATION-----------\n\\section*{Education}\n${eduLines}\n`
    : ''

  const profileSection = data.profile
    ? `\\vspace{-6.5pt}\n\n%-----------PROFILE-----------\n\\section*{Profile}\n${data.profile}\n`
    : ''

  const achLines = data.achievements.map(a => `${a} \\\\`).join('\n')
  const achSection = data.achievements.length
    ? `\\vspace{-6.5pt}\n\n%-----------ACHIEVEMENTS-----------\n\\section*{Achievements}\n${achLines}\n`
    : ''

  const body = [skillsSection, expSection, projSection, eduSection, profileSection, achSection]
    .filter(Boolean).join('\n')

  return `${preamble}

\\begin{document}

%----------HEADING----------
\\centerline{\\Huge ${data.name}}

\\vspace{5pt}

\\begin{center}
\\small ${contactParts.join(' $|$ ')}
\\end{center}

${body}
\\end{document}`
}

function buildSidebarFromAI(data: AIResumeData, preamble: string): string {
  const contactLine = aiContactLine(data)

  const expEntries = data.experience.map(e => {
    const bullets = aiBulletsStandard(e.bullets)
    return `\\mainentry{${e.title}}{${e.dates}}{${e.company}}{${e.location}}\n\\begin{itemize}[noitemsep, topsep=3pt, leftmargin=1em]\n${bullets}\n\\end{itemize}`
  }).join('\n\n\\vspace{4pt}\n')

  const projLines = data.projects.map(p => {
    const nameBlock = p.tech ? `\\textbf{${p.name}} $|$ {\\footnotesize ${p.tech}}` : `\\textbf{${p.name}}`
    const hrefPart = p.link ? ` $|$ {\\footnotesize \\href{${p.link}}{${p.linkText || 'Link'}}}` : ''
    return `  {\\small ${nameBlock}${hrefPart}}`
  }).join(' \\\\[5pt]\n')

  const firstEdu = data.education[0]
  const eduSidebarContent = firstEdu
    ? `{\\footnotesize\n  \\textbf{${firstEdu.institution}} \\\\\n  ${firstEdu.degree} \\\\\n  ${firstEdu.dates}${firstEdu.location ? ` \\\\\n  \\textit{${firstEdu.location}}` : ''}\n}`
    : ''

  const skillsSidebar = aiSkillsSidebar(data.skills)

  return `${preamble}

\\begin{document}

%----------HEADING----------
{\\LARGE\\textbf{${data.name}}} \\hfill
{\\small\\textcolor{accent}{Software Engineer}} \\\\[4pt]
{\\small ${contactLine}}

\\vspace{6pt}
\\noindent\\rule{\\textwidth}{1pt}
\\vspace{4pt}

% ─── Two-column body ───────────────────────────────────────────────────────
\\begin{minipage}[t]{0.30\\textwidth}

\\sidesec{Skills}
${skillsSidebar ? `{\\footnotesize\n${skillsSidebar}\n}` : ''}

\\sidesec{Education}
${eduSidebarContent}

\\end{minipage}%
\\hfill%
\\begin{minipage}[t]{0.66\\textwidth}

${data.profile ? `\\mainsec{Profile}\n{\\small ${data.profile}}\n` : ''}
\\mainsec{Experience}

${expEntries}

${data.projects.length ? `\\mainsec{Projects}\n{\\small\n${projLines}\n}` : ''}

\\end{minipage}

\\end{document}`
}

/**
 * Builds a target template document from AI-parsed structured resume data.
 * Use this instead of convertToTemplate when you have structured JSON from the AI parser.
 */
export function buildFromAIData(rawData: AIResumeData, targetId: string): string {
  const data = escapeAIData(rawData)
  const target = TEMPLATES.find(t => t.id === targetId)
  if (!target) return ''
  const preamble = extractPreamble(target.source)
  switch (targetId) {
    case 'modern':  return buildModernFromAI(data, preamble)
    case 'classic': return buildClassicFromAI(data, preamble)
    case 'minimal': return buildMinimalFromAI(data, preamble)
    case 'sidebar': return buildSidebarFromAI(data, preamble)
    default:        return target.source
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

import { TEMPLATES } from './index'

/**
 * Converts the current LaTeX source to a different template while preserving
 * the user's actual content (name, experience, skills, etc.)
 */
export function convertToTemplate(currentLatex: string, targetId: string): string {
  const target = TEMPLATES.find(t => t.id === targetId)
  if (!target) return currentLatex

  const data = parseResume(currentLatex)
  const preamble = extractPreamble(target.source)

  switch (targetId) {
    case 'modern':  return buildModernDoc(data, preamble)
    case 'classic': return buildClassicDoc(data, preamble)
    case 'minimal': return buildMinimalDoc(data, preamble)
    case 'sidebar': return buildSidebarDoc(data, preamble)
    default:        return target.source
  }
}
