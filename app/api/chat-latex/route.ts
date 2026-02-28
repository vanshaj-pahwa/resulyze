import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const generateWithRetry = async (model: any, prompt: string, maxRetries = 3, initialDelay = 1000) => {
  let lastError
  let retries = 0

  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch (error: any) {
      lastError = error
      if ((error.status >= 500 && error.status < 600) || error.status === 429) {
        await delay(initialDelay * Math.pow(2, retries))
        retries++
      } else {
        throw error
      }
    }
  }

  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const genAI = getGeminiClient(request)
    const { messages, latexSource, jobData } = await request.json()

    if (!latexSource?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
        },
      }
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

    const prompt = [
      'You are an expert LaTeX assistant specialized in professional resumes. You help users edit, format, and improve their LaTeX resume documents.',
      '',
      'CAPABILITIES:',
      '1. Answer LaTeX questions (syntax, packages, formatting, fonts, best practices)',
      '2. Suggest improvements to resume content, structure, or formatting',
      '3. Propose direct changes to the LaTeX code when the user asks for modifications',
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
