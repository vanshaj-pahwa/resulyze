import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete'
import { snippetCompletion } from '@codemirror/autocomplete'

// ---------------------------------------------------------------------------
// 1. LaTeX command completions — triggered after backslash
// ---------------------------------------------------------------------------

const LATEX_COMMANDS: Completion[] = [
  // Text formatting
  snippetCompletion('\\textbf{${text}}', { label: '\\textbf', detail: 'bold text', type: 'function', boost: 10 }),
  snippetCompletion('\\textit{${text}}', { label: '\\textit', detail: 'italic text', type: 'function', boost: 10 }),
  snippetCompletion('\\emph{${text}}', { label: '\\emph', detail: 'emphasized text', type: 'function', boost: 9 }),
  snippetCompletion('\\underline{${text}}', { label: '\\underline', detail: 'underlined text', type: 'function' }),
  snippetCompletion('\\texttt{${text}}', { label: '\\texttt', detail: 'monospace text', type: 'function' }),
  snippetCompletion('\\textsc{${text}}', { label: '\\textsc', detail: 'small caps', type: 'function' }),
  snippetCompletion('\\textsuperscript{${text}}', { label: '\\textsuperscript', detail: 'superscript', type: 'function' }),
  snippetCompletion('\\textsubscript{${text}}', { label: '\\textsubscript', detail: 'subscript', type: 'function' }),

  // Structure
  snippetCompletion('\\section{${title}}', { label: '\\section', detail: 'section heading', type: 'keyword', boost: 8 }),
  snippetCompletion('\\subsection{${title}}', { label: '\\subsection', detail: 'subsection heading', type: 'keyword' }),
  snippetCompletion('\\subsubsection{${title}}', { label: '\\subsubsection', detail: 'subsubsection', type: 'keyword' }),
  snippetCompletion('\\paragraph{${title}}', { label: '\\paragraph', detail: 'paragraph heading', type: 'keyword' }),

  // Environments
  snippetCompletion('\\begin{${env}}\n\t${}\n\\end{${env}}', { label: '\\begin', detail: 'begin environment', type: 'keyword', boost: 10 }),
  snippetCompletion('\\item ${text}', { label: '\\item', detail: 'list item', type: 'keyword', boost: 9 }),

  // Links & references
  snippetCompletion('\\href{${url}}{${text}}', { label: '\\href', detail: 'hyperlink', type: 'function', boost: 8 }),
  snippetCompletion('\\url{${url}}', { label: '\\url', detail: 'URL', type: 'function' }),
  snippetCompletion('\\label{${id}}', { label: '\\label', detail: 'label', type: 'function' }),
  snippetCompletion('\\ref{${id}}', { label: '\\ref', detail: 'reference', type: 'function' }),

  // Spacing & layout
  snippetCompletion('\\vspace{${length}}', { label: '\\vspace', detail: 'vertical space', type: 'function' }),
  snippetCompletion('\\hspace{${length}}', { label: '\\hspace', detail: 'horizontal space', type: 'function' }),
  snippetCompletion('\\newline', { label: '\\newline', detail: 'line break', type: 'keyword' }),
  snippetCompletion('\\\\', { label: '\\\\', detail: 'line break (double backslash)', type: 'keyword' }),
  snippetCompletion('\\noindent', { label: '\\noindent', detail: 'suppress indentation', type: 'keyword' }),
  snippetCompletion('\\hfill', { label: '\\hfill', detail: 'fill horizontal space', type: 'keyword', boost: 7 }),
  snippetCompletion('\\newpage', { label: '\\newpage', detail: 'page break', type: 'keyword' }),

  // Preamble
  snippetCompletion('\\usepackage{${package}}', { label: '\\usepackage', detail: 'import package', type: 'keyword', boost: 7 }),
  snippetCompletion('\\documentclass[${options}]{${class}}', { label: '\\documentclass', detail: 'document class', type: 'keyword' }),
  snippetCompletion('\\geometry{${options}}', { label: '\\geometry', detail: 'page geometry', type: 'function' }),
  snippetCompletion('\\pagestyle{${style}}', { label: '\\pagestyle', detail: 'page style', type: 'function' }),
  snippetCompletion('\\setlength{${cmd}}{${length}}', { label: '\\setlength', detail: 'set length', type: 'function' }),

  // Colors
  snippetCompletion('\\color{${color}}', { label: '\\color', detail: 'text color', type: 'function' }),
  snippetCompletion('\\textcolor{${color}}{${text}}', { label: '\\textcolor', detail: 'colored text', type: 'function' }),
  snippetCompletion('\\colorbox{${color}}{${text}}', { label: '\\colorbox', detail: 'colored box', type: 'function' }),
  snippetCompletion('\\definecolor{${name}}{RGB}{${r,g,b}}', { label: '\\definecolor', detail: 'define color', type: 'function' }),

  // Font size
  snippetCompletion('\\fontsize{${size}}{${baselineskip}}\\selectfont', { label: '\\fontsize', detail: 'custom font size', type: 'function' }),
  snippetCompletion('\\small', { label: '\\small', detail: 'small text', type: 'keyword' }),
  snippetCompletion('\\large', { label: '\\large', detail: 'large text', type: 'keyword' }),
  snippetCompletion('\\Large', { label: '\\Large', detail: 'larger text', type: 'keyword' }),
  snippetCompletion('\\footnotesize', { label: '\\footnotesize', detail: 'footnote size', type: 'keyword' }),

  // Document body
  snippetCompletion('\\begin{document}\n\t${}\n\\end{document}', { label: '\\document', detail: 'document block', type: 'keyword' }),
]

export function latexCommandCompletions(context: CompletionContext): CompletionResult | null {
  // Match a backslash followed by zero or more word characters
  const word = context.matchBefore(/\\[a-zA-Z]*/)
  if (!word || (word.from === word.to && !context.explicit)) return null

  return {
    from: word.from,
    options: LATEX_COMMANDS,
    validFor: /^\\[a-zA-Z]*$/,
  }
}

// ---------------------------------------------------------------------------
// 2. Environment completions — triggered after \begin{
// ---------------------------------------------------------------------------

const ENVIRONMENTS: Array<{ name: string; detail: string; body: string }> = [
  // Standard
  { name: 'document', detail: 'root document', body: '' },
  { name: 'itemize', detail: 'bullet list', body: '\n\t\\item ${item1}\n\t\\item ${item2}' },
  { name: 'enumerate', detail: 'numbered list', body: '\n\t\\item ${item1}\n\t\\item ${item2}' },
  { name: 'description', detail: 'description list', body: '\n\t\\item[${term}] ${description}' },
  { name: 'tabular', detail: 'table', body: '{${l|c|r}}\n\t\\hline\n\t${} \\\\\n\t\\hline\n' },
  { name: 'table', detail: 'table float', body: '[h]\n\t\\centering\n\t${}\n' },
  { name: 'figure', detail: 'figure float', body: '[h]\n\t\\centering\n\t${}\n' },
  { name: 'minipage', detail: 'minipage', body: '{${0.5\\textwidth}}\n\t${}\n' },
  { name: 'center', detail: 'centered content', body: '\n\t${}\n' },
  { name: 'flushleft', detail: 'left-aligned', body: '\n\t${}\n' },
  { name: 'flushright', detail: 'right-aligned', body: '\n\t${}\n' },
  { name: 'abstract', detail: 'abstract block', body: '\n\t${}\n' },
  { name: 'verbatim', detail: 'verbatim text', body: '\n${code}\n' },
]

export function latexEnvironmentCompletions(context: CompletionContext): CompletionResult | null {
  // Match \begin{ followed by partial environment name
  const before = context.matchBefore(/\\begin\{[a-zA-Z]*/)
  if (!before) return null

  // Extract the partial env name typed so far
  const envStart = before.text.indexOf('{') + 1
  const typedEnv = before.text.slice(envStart)

  const options: Completion[] = ENVIRONMENTS.map(env =>
    snippetCompletion(
      `${env.name}}${env.body}\n\\end{${env.name}}`,
      {
        label: env.name,
        detail: env.detail,
        type: 'keyword',
      }
    )
  )

  return {
    // from = position after the opening brace
    from: before.from + envStart,
    options,
    validFor: /^[a-zA-Z]*$/,
  }
}

// ---------------------------------------------------------------------------
// 3. Resume-specific snippet completions — triggered by \resume
// ---------------------------------------------------------------------------

const RESUME_SNIPPETS: Completion[] = [
  snippetCompletion(
    `\\noindent\\textbf{\${Company Name}} \\hfill \${City, State}\\\\
\\textit{\${Job Title}} \\hfill \\textit{\${Month Year -- Month Year}}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
  \\item \${Achieved X, measured by Y, by doing Z}
  \\item \${Second bullet}
\\end{itemize}`,
    {
      label: '\\resumeExperience',
      detail: 'experience entry (company + bullets)',
      type: 'text',
      boost: 10,
    }
  ),
  snippetCompletion(
    `\\noindent\\textbf{\${Project Name}} $|$ \\textit{\${Tech, Stack, Used}} \\hfill \\textit{\${Month Year}}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
  \\item \${Describe what it does and the impact}
\\end{itemize}`,
    {
      label: '\\resumeProject',
      detail: 'project entry',
      type: 'text',
      boost: 9,
    }
  ),
  snippetCompletion(
    `\\noindent\\textbf{\${University Name}} \\hfill \${City, State}\\\\
\\textit{\${Degree, Major}} \\hfill \\textit{\${Month Year -- Month Year}}\\\\
GPA: \${X.XX} | Relevant Coursework: \${Course 1, Course 2}`,
    {
      label: '\\resumeEducation',
      detail: 'education entry',
      type: 'text',
      boost: 9,
    }
  ),
  snippetCompletion(
    `\\noindent\\textbf{Languages:} \${Python, TypeScript, Java} \\\\
\\noindent\\textbf{Frameworks:} \${React, Next.js, Node.js} \\\\
\\noindent\\textbf{Tools:} \${Git, Docker, AWS}`,
    {
      label: '\\resumeSkills',
      detail: 'skills section rows',
      type: 'text',
      boost: 8,
    }
  ),
  snippetCompletion(
    `\\section*{\${EXPERIENCE}}
\\vspace{2pt}`,
    {
      label: '\\resumeSection',
      detail: 'section header with spacing',
      type: 'text',
      boost: 7,
    }
  ),
]

export function latexResumeSnippets(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\\resume[a-zA-Z]*/)
  if (!word || (word.from === word.to && !context.explicit)) return null

  return {
    from: word.from,
    options: RESUME_SNIPPETS,
    validFor: /^\\resume[a-zA-Z]*$/,
  }
}
