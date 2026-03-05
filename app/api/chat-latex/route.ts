import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'
import { getFullResumeKnowledge } from '@/lib/ai/resume-knowledge'
import { generateWithRetry } from '@/lib/ai/generate'
import { getBuilderSystemPrompt, type BuilderPhase } from '@/lib/ai/builder-flow'

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { messages, latexSource, jobData, builderMode } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-3-flash-preview',
        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        },
      },
      { apiVersion: 'v1beta' }
    )

    const jobContext = jobData
      ? [
          '',
          'JOB CONTEXT (the user is targeting this role):',
          '- Title: ' + (jobData.jobTitle || 'Not specified'),
          '- Company: ' + (jobData.company || 'Not specified'),
          '- Key Skills: ' + ((jobData.skills || []).join(', ') || 'Not specified'),
          '- Qualifications: ' + ((jobData.qualifications || []).join(', ') || 'Not specified'),
        ].join('\n')
      : ''

    const conversationHistory = messages
      .slice(-10)
      .map((m: { role: string; content: string }) => {
        const label = m.role === 'user' ? 'User' : 'Assistant'
        return label + ': ' + m.content
      })
      .join('\n\n')

    // Builder mode: inject guided builder system prompt
    // Infer current phase from conversation length as a rough signal
    const builderPhase: BuilderPhase =
      messages.length <= 1 ? 'career-stage' :
      messages.length <= 3 ? 'contact' :
      messages.length <= 6 ? 'education' :
      messages.length <= 14 ? 'experience' :
      messages.length <= 18 ? 'projects' :
      messages.length <= 20 ? 'skills' : 'generate'

    const builderContext = builderMode
      ? [
          '',
          getBuilderSystemPrompt(builderPhase, {}),
          '',
          'EXISTING LATEX (update this as you collect info — do not discard content already there):',
          latexSource,
          '',
        ].join('\n')
      : ''

    const prompt = [
      `Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Use this when evaluating whether dates in the resume are past or future.`,
      '',
      'You are an expert resume writer AND LaTeX specialist. You deeply understand what makes a resume effective — not just how to format LaTeX. You follow these resume writing rules as your absolute source of truth for resume quality:',
      '',
      getFullResumeKnowledge(),
      builderContext,
      '',
      'CAPABILITIES:',
      '1. Answer LaTeX questions (syntax, packages, formatting, fonts, best practices)',
      '2. Suggest improvements to resume content using the resume rules above',
      '3. Propose direct changes to the LaTeX code when the user asks for modifications',
      '4. Proactively flag resume quality issues: weak action verbs, missing metrics, vague claims, formatting violations',
      '5. Enforce the XYZ bullet format ("Accomplished [X] as measured by [Y], by doing [Z]") when rewriting experience bullets',
      '',
      'CURRENT LATEX SOURCE:',
      latexSource,
      jobContext,
      '',
      'RESPONSE FORMAT:',
      'Use this EXACT format with delimiters. Do NOT use JSON.',
      '',
      '---MESSAGE---',
      'Your conversational response here. Explain what you changed and why. Use markdown.',
      '---CHANGES---',
      'BEFORE: old text or code snippet',
      'AFTER: new text or code snippet',
      '',
      'BEFORE: another old snippet',
      'AFTER: another new snippet',
      '---LATEX---',
      'Full modified LaTeX source here (ONLY if proposing a change)',
      '---END---',
      '',
      'SCOPE DISCIPLINE — THIS IS CRITICAL:',
      '- ONLY change what the user asked for. If the user says "match JD keywords", inject keywords — do NOT also restructure sections, rewrite bullets, or remove the Profile.',
      '- NEVER remove, rename, or restructure a section (Profile, Summary, Projects, etc.) unless the user explicitly asks for it.',
      '- If you spot issues outside the user\'s request (weak verbs, formatting, section order), mention them as brief recommendations in your message — do NOT include them in ---CHANGES--- or ---LATEX---.',
      '- Think of each response as a surgical edit, not a full resume rewrite. Minimal diff, maximum relevance to the user\'s ask.',
      '',
      'PROFILE / SUMMARY SECTION:',
      '- If the resume has a Profile/Summary section, NEVER remove it unless the user explicitly says "remove my profile" or "delete summary".',
      '- If the user asks to match keywords and a Profile exists, inject relevant keywords INTO the profile as well — tailor it to the target role.',
      '- A good profile is a 2–3 line professional summary that hooks a recruiter in under 10 seconds: mention years of experience, core specialization, 2–3 headline skills from the JD, and one standout achievement or differentiator.',
      '- If you believe removing the profile would be better, show a ⚠️ recommendation in your message (e.g., "⚠️ For candidates with <3 years experience, dropping the summary and using that space for another project/bullet can be more impactful. Want me to remove it?"). Do NOT act on it without confirmation.',
      '',
      'INTENT DETECTION — Recognize these patterns and respond appropriately:',
      '- "too long" / "shorten" / "trim" / "one page" → Rank bullets by impact, suggest specific removals. Cut weakest bullets first, compress verbose phrasing second.',
      '- "keywords" / "missing skills" / "match JD" → Cross-reference the JD skills against the resume. Add missing skills to the Skills section. If a Profile/Summary exists, weave in 2–3 headline keywords naturally. For experience bullets, you may ADD a keyword if it fits naturally (e.g., "Built web app" → "Built React web app") but do NOT rephrase, reword, or rewrite the bullet. Do NOT touch section structure or bullet wording beyond minimal keyword insertion.',
      '- "review" / "feedback" / "how is my resume" → Score against the resume rules. Be specific — cite exact bullets, sections, formatting issues. Show recommendations as a checklist the user can act on.',
      '- "rewrite" / "improve" / "stronger" → Apply XYZ formula to bullets. Push for metrics. Replace weak verbs with strong action verbs.',
      '- "add metrics" / "quantify" → Find bullets without numbers and suggest specific metrics (percentages, dollar amounts, user counts, time saved).',
      '- "fix verbs" / "action verbs" → Scan all bullets, flag weak starts (Responsible for, Helped, Worked on), suggest replacements.',
      '',
      'STRUCTURE-AWARE REFERENCES:',
      '- When referring to specific parts of the resume, use human-readable references like "your 2nd bullet under [Company Name]", "the Skills section", "your Education entry for [University]".',
      '- NEVER use line numbers like "line 47" — the user cannot see line numbers in the preview.',
      '',
      'LATEX LINK AWARENESS:',
      '- \\href{url}{display text} means only "display text" appears in the PDF. The URL inside \\href{} is NOT visible to the reader.',
      '- Do NOT flag href URLs as "displaying https://" — they are masked hyperlinks.',
      '- Phone numbers, LinkedIn, email, GitHub, and portfolio links are standard contact info. Do NOT suggest removing them.',
      '',
      'RULES:',
      '- The ---MESSAGE--- section is ALWAYS required.',
      '- If the user asks a QUESTION (e.g. "how do I make text bold?"), include ONLY ---MESSAGE--- and ---END---. Do NOT include ---CHANGES--- or ---LATEX---.',
      '- If the user asks for a CHANGE (e.g. "add Python to my skills", "make margins smaller"), include ALL sections: ---MESSAGE---, ---CHANGES---, ---LATEX--- (with the COMPLETE modified LaTeX source), and ---END---.',
      '- NEVER fabricate experience, companies, dates, or certifications.',
      '- NEVER break LaTeX syntax. Keep all braces balanced, all commands intact.',
      '- NEVER remove document structure (\\documentclass, \\begin{document}, etc.) unless specifically asked.',
      '- NEVER add \\newpage, \\clearpage, or \\pagebreak commands. The resume MUST stay on a single page.',
      '- Do NOT wrap the LaTeX source in markdown code fences (```). Output raw LaTeX only in the ---LATEX--- section.',
      '- NEVER modify the document preamble (packages, commands, formatting) unless the user specifically asks for it.',
      '- Before adding a skill, language, tool, or any item to a list, CHECK if it already exists in the document. NEVER add duplicates. If the item is already present, tell the user it is already there.',
      '- When rewriting sections, keep content concise so it fits on ONE page. If adding content, shorten other areas to compensate.',
      '- Keep your message concise and helpful.',
      '- EVERY change you make MUST have a corresponding BEFORE/AFTER pair in ---CHANGES---. If you mention a change in your message (e.g., "Updated Profile to highlight React"), there MUST be a matching BEFORE/AFTER for it. Never describe a change without proposing it.',
      '- Conversely, NEVER describe a change in ---MESSAGE--- that is NOT in ---CHANGES---. The user can only accept/reject changes that appear as BEFORE/AFTER pairs.',
      '- Each change in ---CHANGES--- must be a BEFORE/AFTER pair showing the old and new text. Use "BEFORE: ..." on one line and "AFTER: ..." on the next line. Show the actual LaTeX code or text that changed, not vague descriptions. Keep snippets short (one line each, max 80 chars). Separate pairs with a blank line.',
      '- The ---LATEX--- section must contain the COMPLETE LaTeX source, not just the changed parts.',
      '',
      'CONVERSATION:',
      conversationHistory,
    ].join('\n')

    const result = await generateWithRetry(model, prompt)

    // Parse delimiter-based response
    const messageMatch = result.match(/---MESSAGE---\s*([\s\S]*?)(?=---CHANGES---|---LATEX---|---END---|$)/)
    const changesMatch = result.match(/---CHANGES---\s*([\s\S]*?)(?=---LATEX---|---END---|$)/)
    const latexMatch = result.match(/---LATEX---\s*([\s\S]*?)(?=---END---|$)/)

    const message = messageMatch ? messageMatch[1].trim() : result.replace(/---\w+---/g, '').trim()
    const rawLatex = latexMatch ? latexMatch[1].trim() : undefined
    // Strip markdown code fences the AI sometimes wraps around LaTeX
    const proposedLatex = rawLatex
      ? rawLatex.replace(/^```(?:latex|tex)?\s*\n?/i, '').replace(/\n?```\s*$/g, '').trim()
      : undefined

    // Parse before/after change pairs
    const changes: Array<{ before: string; after: string }> = []
    if (changesMatch) {
      const changesText = changesMatch[1].trim()
      const beforeAfterRegex = /BEFORE:\s*(.+)\nAFTER:\s*(.+)/g
      let match
      while ((match = beforeAfterRegex.exec(changesText)) !== null) {
        changes.push({ before: match[1].trim(), after: match[2].trim() })
      }
      // Fallback: if no BEFORE/AFTER pairs found, treat lines as plain descriptions
      if (changes.length === 0) {
        const lines = changesText.split('\n').map((l: string) => l.replace(/^[-*]\s*/, '').trim()).filter(Boolean)
        for (const line of lines) {
          changes.push({ before: '', after: line })
        }
      }
    }

    // Validate proposed LaTeX
    if (proposedLatex) {
      if (!proposedLatex.includes('\\begin{document}') || !proposedLatex.includes('\\end{document}')) {
        return NextResponse.json({
          message: message || 'I suggested a change but the LaTeX output was invalid. Please try again.',
          changes: [],
        })
      }
      // Strip page break commands and fullpage package (conflicts with geometry)
      const cleanedLatex = proposedLatex
        .replace(/\\newpage/g, '')
        .replace(/\\clearpage/g, '')
        .replace(/\\pagebreak/g, '')

      return NextResponse.json({
        message: message || 'I processed your request.',
        proposedLatex: cleanedLatex,
        changes,
      })
    }

    return NextResponse.json({
      message: message || 'I processed your request.',
      proposedLatex,
      changes,
    })
  } catch (error: any) {
    console.error('Error in chat-latex:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
