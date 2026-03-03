/**
 * AI-Guided Resume Builder — conversation flow + data model.
 * Used by chat-latex in builder mode to walk the user through
 * creating a resume from scratch via step-by-step questions.
 */

export interface BuilderData {
  careerStage?: 'student' | 'early' | 'mid' | 'senior' | 'career-change'
  contact?: {
    name?: string
    email?: string
    phone?: string
    linkedin?: string
    github?: string
    portfolio?: string
    location?: string
  }
  education?: Array<{
    school: string
    degree: string
    field: string
    graduationDate: string
    gpa?: string
    highlights?: string[]
  }>
  experience?: Array<{
    company: string
    title: string
    startDate: string
    endDate: string
    bullets: string[]
  }>
  projects?: Array<{
    name: string
    tech: string
    description: string
    bullets: string[]
  }>
  skills?: {
    languages?: string[]
    frameworks?: string[]
    tools?: string[]
    other?: string[]
  }
}

export type BuilderPhase =
  | 'career-stage'
  | 'contact'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'generate'
  | 'done'

export const PHASE_ORDER: BuilderPhase[] = [
  'career-stage',
  'contact',
  'education',
  'experience',
  'projects',
  'skills',
  'generate',
]

export function getPhasePrompt(phase: BuilderPhase): string {
  switch (phase) {
    case 'career-stage':
      return 'What stage of your career are you in? (student, early career 0-2 years, mid-level 3-5 years, senior 6+ years, or career change)'
    case 'contact':
      return 'Let\'s start with your contact info. Please share your:\n- Full name\n- Email\n- Phone number\n- City, State/Country (location appears on the resume)\n- LinkedIn URL (optional)\n- GitHub URL (optional)\n- Portfolio URL (optional)'
    case 'education':
      return 'Tell me about your education. For each entry:\n- University/School name\n- Degree (e.g., B.S., M.S.)\n- Field of study\n- Graduation date (or expected)\n- GPA (if above 3.5)\n- Any honors, relevant coursework, or activities'
    case 'experience':
      return 'Now your work experience. For each role, share:\n- Company name\n- Job title\n- Start and end dates (month/year)\n- Location (city, state or "Remote")\n- What did you work on? (free text — I\'ll help rewrite)\n- What was the impact? (numbers are gold: % improvement, users served, time saved, revenue affected)\n- Technologies used\n\nAfter each role I\'ll ask "Anything else in this role?" and "Add another role?"'
    case 'projects':
      return 'Do you have any notable projects to include? (personal projects, open source, academic, freelance — anything you\'re proud of)\n\nAnswer yes or no. If yes, for each project share:\n- Project name\n- Technologies used\n- What problem it solves\n- Most impressive technical detail or metric (users, stars, performance gain)\n- Link to repo or demo (optional)'
    case 'skills':
      return 'List your technical skills. Group them if possible:\n- Programming languages\n- Frameworks/Libraries\n- Tools & platforms\n- Other (databases, cloud, methodologies, etc.)'
    case 'generate':
      return 'I have everything I need. Generating your LaTeX resume now...'
    default:
      return ''
  }
}

export function getNextPhase(current: BuilderPhase): BuilderPhase {
  const idx = PHASE_ORDER.indexOf(current)
  if (idx === -1 || idx >= PHASE_ORDER.length - 1) return 'done'
  return PHASE_ORDER[idx + 1]
}

export function getBuilderSystemPrompt(phase: BuilderPhase, data: BuilderData): string {
  return [
    'You are in BUILDER MODE — guiding the user through a structured resume interview to create a polished LaTeX resume.',
    'Follow these phases in order: career-stage → contact → education → experience → projects → skills → generate.',
    '',
    'PROBING RULES (critical):',
    '- EXPERIENCE: After the user shares a role, probe for specifics before moving on:',
    '  • If they describe work without numbers, ask: "Do you have any metrics? (e.g. % improvement, users affected, time saved, revenue impact)"',
    '  • If they don\'t mention achievements, ask: "What was your biggest accomplishment in this role?"',
    '  • If location is not mentioned, ask: "Where was this role based? (city, state or Remote)"',
    '  • After each role ask: "Anything else worth highlighting in this role?" then "Do you have another role to add?"',
    '- CONTACT: Location (city, state) is a required resume field. If the user skips it, explicitly ask:',
    '  "Your resume needs a location — what city/state should appear? (e.g. San Francisco, CA or just Remote)"',
    '- PROJECTS: Always ask "Do you want to include any projects?" — NEVER skip this phase silently.',
    '  If yes, collect project details. If no, move to skills.',
    '  For each project, ask for the tech stack AND impact/metrics if not provided.',
    '',
    'GENERAL RULES:',
    '- Ask ONE topic at a time. Do not dump all questions at once.',
    '- Parse freeform text into structured data — the user shouldn\'t need to format anything.',
    '- If they say "skip" or "none", acknowledge and move to the next phase.',
    '- Be concise and encouraging. No filler phrases.',
    '- When you reach the generate phase, produce a COMPLETE, compilable LaTeX resume using all collected data.',
    '  Use \\href{} for all URLs. Sections: Contact header, Experience, Projects (if any), Skills, Education.',
    '  Apply the XYZ formula to all experience bullets. The resume MUST fit on ONE page.',
    '- After generating, immediately run a quick self-review: flag any missing location, weak bullets, or missing metrics.',
    '',
    'Current question for the user:',
    getPhasePrompt(phase),
  ].join('\n')
}
