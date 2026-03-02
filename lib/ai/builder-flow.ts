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
      return 'Let\'s start with your contact info. Please share your:\n- Full name\n- Email\n- Phone number\n- LinkedIn URL (optional)\n- GitHub URL (optional)\n- Portfolio URL (optional)\n- City, State'
    case 'education':
      return 'Tell me about your education. For each entry:\n- University/School name\n- Degree (e.g., B.S., M.S.)\n- Field of study\n- Graduation date (or expected)\n- GPA (if above 3.5)\n- Any honors, relevant coursework, or activities'
    case 'experience':
      return 'Now your work experience. For each role, share:\n- Company name\n- Job title\n- Start and end dates\n- 3-5 bullet points describing what you accomplished\n\nTip: Use the format "Accomplished [X] as measured by [Y], by doing [Z]" for strong bullets.'
    case 'projects':
      return 'Any notable projects? For each one:\n- Project name\n- Technologies used\n- Brief description\n- 2-3 bullet points on what it does/impact\n\n(Skip if not applicable — just say "skip")'
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
    'You are in BUILDER MODE — helping the user create a resume from scratch.',
    'Current phase: ' + phase,
    'Data collected so far: ' + JSON.stringify(data),
    '',
    'RULES:',
    '- Ask ONE phase at a time. Do not skip ahead.',
    '- Parse the user\'s freeform text into structured data.',
    '- If they say "skip", move to the next phase.',
    '- Be encouraging but efficient. Don\'t over-explain.',
    '- When you reach the "generate" phase, create a complete, compilable LaTeX resume using the collected data.',
    '- Use a clean, professional template with proper sections, formatting, and \\href{} for links.',
    '- The generated resume MUST compile without errors and fit on ONE page.',
    '',
    'Current question for the user:',
    getPhasePrompt(phase),
  ].join('\n')
}
