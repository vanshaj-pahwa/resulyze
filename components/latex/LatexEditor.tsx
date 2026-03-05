'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { DEFAULT_LATEX_SOURCE } from './defaultTemplate'
import { FileText, Sparkles, Loader2, X, Undo2, CheckCircle2, Clock, MessageSquare, Search, FileSearch, List, Pilcrow, Hash, LayoutTemplate } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { fetchWithKey } from '@/lib/fetch'
import { useChatLatex } from '@/hooks/useChatLatex'
import { trackAnalyticsEvent } from '@/hooks/useAnalytics'
import { useResumeVersions } from '@/hooks/useResumeVersions'
import { useResumeReview } from '@/hooks/useResumeReview'
import { useAtsScore } from '@/hooks/useAtsScore'
import { ShortcutsDialog } from '@/components/ui/shortcuts-dialog'

const CodePanel = dynamic(() => import('./CodePanel'), { ssr: false })
const PreviewPanel = dynamic(() => import('./PreviewPanel'), { ssr: false })
const SkillMatchPanel = dynamic(() => import('./SkillMatchPanel'), { ssr: false })
const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false })
const ChatFloatingBar = dynamic(() => import('./ChatFloatingBar'), { ssr: false })
const VersionHistory = dynamic(() => import('./VersionHistory'), { ssr: false })
const ResumeReviewPanel = dynamic(() => import('./ResumeReviewPanel'), { ssr: false })
const OverflowBanner = dynamic(() => import('./OverflowBanner'), { ssr: false })
const OutlinePanel = dynamic(() => import('./OutlinePanel'), { ssr: false })
const AtsScorePanel = dynamic(() => import('./AtsScorePanel'), { ssr: false })
const TemplatePickerModal = dynamic(() => import('./TemplatePickerModal'), { ssr: false })
const TrimReviewPanel = dynamic(() => import('./TrimReviewPanel'), { ssr: false })

interface LatexEditorProps {
  readonly jobData: any
  readonly onResumeDataChange: (data: any) => void
}

const STORAGE_KEY = 'resulyze-latex-source'
const TITLE_STORAGE_KEY = 'resulyze-resume-title'

// ─── Section helpers for Go-to-Section palette ───────────────────────────────

interface LatexSection {
  line: number
  level: 'section' | 'subsection' | 'subsubsection'
  title: string
}

function parseLatexSections(latex: string): LatexSection[] {
  const sections: LatexSection[] = []
  const lines = latex.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const sm = line.match(/\\section\*?\{([^}]+)\}/)
    const ssm = line.match(/\\subsection\*?\{([^}]+)\}/)
    const sssm = line.match(/\\subsubsection\*?\{([^}]+)\}/)
    if (sm) sections.push({ line: i + 1, level: 'section', title: sm[1] })
    else if (ssm) sections.push({ line: i + 1, level: 'subsection', title: ssm[1] })
    else if (sssm) sections.push({ line: i + 1, level: 'subsubsection', title: sssm[1] })
  }
  return sections
}

export default function LatexEditor({ jobData, onResumeDataChange }: LatexEditorProps) {
  const [latexSource, setLatexSource] = useState<string>(DEFAULT_LATEX_SOURCE)
  const [resumeTitle, setResumeTitle] = useState<string>('')
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationError, setCompilationError] = useState<string | null>(null)
  const prevBlobUrl = useRef<string | null>(null)
  const [searchTrigger, setSearchTrigger] = useState(0)

  // Auto-title generation state
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [showLatexHint, setShowLatexHint] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const userEditedTitle = useRef(false)

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationChanges, setOptimizationChanges] = useState<string[]>([])
  const [showChangesPanel, setShowChangesPanel] = useState(false)
  const [previousLatex, setPreviousLatex] = useState<string | null>(null)

  // Auto-compile flag — when true, triggers compilation on next render
  const [pendingCompile, setPendingCompile] = useState(false)

  // Version history
  const { versions, saveVersion, deleteVersion, updateLabel } = useResumeVersions()
  const [showHistory, setShowHistory] = useState(false)

  // Review state
  const resumeReview = useResumeReview()
  const [showReview, setShowReview] = useState(false)

  // Page overflow state
  const [pdfPageCount, setPdfPageCount] = useState(0)
  const [overflowDismissed, setOverflowDismissed] = useState(false)
  const [isTrimming, setIsTrimming] = useState(false)
  const [trimProposal, setTrimProposal] = useState<import('./TrimReviewModal').TrimProposal | null>(null)

  // Outline panel state
  const [showOutline, setShowOutline] = useState(false)
  const [navigateLine, setNavigateLine] = useState(0)

  // Template picker
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false)
  // Cache parsed resume data keyed by latexSource — avoids re-parsing on repeated template switches
  const parsedResumeCache = useRef<{ source: string; data: any } | null>(null)

  // Editor visual features
  const [showWhitespace, setShowWhitespace] = useState(false)

  // Go to Section palette
  const [showSectionPalette, setShowSectionPalette] = useState(false)
  const [sectionPaletteQuery, setSectionPaletteQuery] = useState('')
  const sections = useMemo(() => parseLatexSections(latexSource), [latexSource])
  const filteredSections = useMemo(() => {
    if (!sectionPaletteQuery.trim()) return sections
    const q = sectionPaletteQuery.toLowerCase()
    return sections.filter(s => s.title.toLowerCase().includes(q))
  }, [sections, sectionPaletteQuery])

  // ATS score panel state
  const [showAts, setShowAts] = useState(false)
  const atsKeywords = useMemo(
    () => [...(jobData?.skills ?? []), ...(jobData?.keywords ?? [])],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(jobData?.skills), JSON.stringify(jobData?.keywords)]
  )
  const { analysis: atsAnalysis, isAnalyzing: isAtsAnalyzing, error: atsError, previousScore: atsPreviousScore, reanalyze: reanalyzeAts } = useAtsScore(pdfBlobUrl, atsKeywords)

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chat = useChatLatex({
    latexSource,
    jobData,
    onApplyChanges: useCallback((newLatex: string) => {
      saveVersion(latexSource, resumeTitle, 'Pre-chat edit')
      setPreviousLatex(latexSource)
      setLatexSource(newLatex)
      setPendingCompile(true)
      toast.success('Changes applied from AI assistant')
    }, [latexSource, resumeTitle, saveVersion]),
  })

  // Load persisted state client-side after hydration (avoids SSR/client mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setLatexSource(saved)
    const savedTitle = localStorage.getItem(TITLE_STORAGE_KEY)
    if (savedTitle) {
      setResumeTitle(savedTitle)
      userEditedTitle.current = true
    }
    setPendingCompile(true)
  }, [])

  // Auto-save to localStorage (only when user has modified from default)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (latexSource !== DEFAULT_LATEX_SOURCE) {
        localStorage.setItem(STORAGE_KEY, latexSource)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [latexSource])

  // Persist resume title
  useEffect(() => {
    if (resumeTitle) {
      localStorage.setItem(TITLE_STORAGE_KEY, resumeTitle)
    } else {
      localStorage.removeItem(TITLE_STORAGE_KEY)
    }
  }, [resumeTitle])

  // Auto-generate title on mount when title is empty and resume is custom
  useEffect(() => {
    if (userEditedTitle.current) return

    const savedTitle = localStorage.getItem(TITLE_STORAGE_KEY)
    if (savedTitle) return

    const savedLatex = localStorage.getItem(STORAGE_KEY)
    if (!savedLatex) return // still on default template

    setIsGeneratingTitle(true)

    const aborted = { current: false }

    fetchWithKey('/api/generate-resume-title', {
      method: 'POST',
      body: JSON.stringify({ latexSource: savedLatex }),
    })
      .then(res => res.json())
      .then(data => {
        if (aborted.current || !data.title || userEditedTitle.current) {
          setIsGeneratingTitle(false)
          return
        }

        // Typewriter animation
        const fullTitle = data.title
        let i = 0
        typewriterRef.current = setInterval(() => {
          if (userEditedTitle.current || aborted.current) {
            if (typewriterRef.current) clearInterval(typewriterRef.current)
            typewriterRef.current = null
            setIsGeneratingTitle(false)
            return
          }
          i++
          setResumeTitle(fullTitle.slice(0, i))
          if (i >= fullTitle.length) {
            if (typewriterRef.current) clearInterval(typewriterRef.current)
            typewriterRef.current = null
            setIsGeneratingTitle(false)
          }
        }, 40)
      })
      .catch(() => setIsGeneratingTitle(false))

    return () => {
      aborted.current = true
      if (typewriterRef.current) clearInterval(typewriterRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCompile = useCallback(async () => {
    if (isCompiling) return
    setIsCompiling(true)
    setCompilationError(null)

    try {
      const response = await fetch('/api/compile-latex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: latexSource }),
      })

      if (!response.ok) {
        const error = await response.json()
        setCompilationError(error.details || error.error || 'Compilation failed')
        return
      }

      const pdfBlob = await response.blob()
      const url = URL.createObjectURL(pdfBlob)

      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current)
      }
      prevBlobUrl.current = url
      setPdfBlobUrl(url)

      onResumeDataChange({ latexSource })
    } catch (err: any) {
      setCompilationError(err.message || 'Failed to connect to compilation service')
    } finally {
      setIsCompiling(false)
    }
  }, [latexSource, isCompiling, onResumeDataChange])

  const handleDownload = useCallback(() => {
    if (!pdfBlobUrl) return
    const filename = resumeTitle
      ? resumeTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_')
      : 'resume'
    const a = document.createElement('a')
    a.href = pdfBlobUrl
    a.download = `${filename}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [pdfBlobUrl, resumeTitle])

  const handleOptimize = useCallback(async () => {
    if (isOptimizing || !jobData) return
    setIsOptimizing(true)
    setPreviousLatex(latexSource)

    try {
      const response = await fetchWithKey('/api/optimize-latex', {
        method: 'POST',
        body: JSON.stringify({ latexSource, jobData }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || 'Optimization failed')
        setPreviousLatex(null)
        return
      }

      if (data.optimizedLatex && data.optimizedLatex !== latexSource) {
        saveVersion(latexSource, resumeTitle, 'Pre-optimization')
        setLatexSource(data.optimizedLatex)
        setOptimizationChanges(data.changes || [])
        setShowChangesPanel(true)
        setPendingCompile(true) // auto-compile with optimized LaTeX
        toast.success(`Resume optimized! ${data.changes?.length || 0} changes made.`)
        trackAnalyticsEvent('optimization_applied', {
          source: 'auto',
          company: jobData?.company,
          jobTitle: jobData?.jobTitle,
          changes: (data.changes || []).slice(0, 10),
        })
      } else {
        toast.info('No changes needed — your resume already matches well.')
        setPreviousLatex(null)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to optimize resume')
      setPreviousLatex(null)
    } finally {
      setIsOptimizing(false)
    }
  }, [latexSource, jobData, isOptimizing])

  const handleUndoOptimization = useCallback(() => {
    if (previousLatex) {
      setLatexSource(previousLatex)
      setPreviousLatex(null)
      setShowChangesPanel(false)
      setOptimizationChanges([])
      setPendingCompile(true) // auto-compile reverted LaTeX
      toast.info('Optimization undone')
    }
  }, [previousLatex])

  const handleRestoreVersion = useCallback((latex: string) => {
    saveVersion(latexSource, resumeTitle, 'Pre-restore')
    setLatexSource(latex)
    setPendingCompile(true)
    setShowHistory(false)
    toast.success('Version restored')
  }, [latexSource, resumeTitle, saveVersion])

  const handleApplyTemplate = useCallback(async (template: import('@/lib/templates').ResumeTemplate) => {
    setIsApplyingTemplate(true)
    setShowTemplatePicker(false)

    try {
      let parsedData: any

      // Use cached parse result if latexSource hasn't changed since last parse
      if (parsedResumeCache.current?.source === latexSource) {
        parsedData = parsedResumeCache.current.data
      } else {
        const res = await fetchWithKey('/api/parse-resume-latex', {
          method: 'POST',
          body: JSON.stringify({ latexSource }),
        })

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Failed to parse resume')
        }

        parsedData = json.data
        // Cache for subsequent template switches with the same source
        parsedResumeCache.current = { source: latexSource, data: parsedData }
      }

      // Build the target template instantly on the client from the structured data
      const { buildFromAIData } = await import('@/lib/templates/converter')
      saveVersion(latexSource, resumeTitle, `Pre-template: ${template.name}`)
      const converted = buildFromAIData(parsedData, template.id)
      setLatexSource(converted)
      setPendingCompile(true)
      toast.success(`Switched to "${template.name}" — your content was preserved`)
      trackAnalyticsEvent('resume_created', { template: template.name })
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch template. Please try again.')
    } finally {
      setIsApplyingTemplate(false)
    }
  }, [latexSource, resumeTitle, saveVersion])

  // Show LaTeX hint on mount if not dismissed
  useEffect(() => {
    if (!localStorage.getItem('resulyze-latex-hint-dismissed')) {
      setShowLatexHint(true)
    }
  }, [])

  // Auto-compile when pendingCompile is set (initial load + after optimization)
  useEffect(() => {
    if (pendingCompile && !isCompiling) {
      setPendingCompile(false)
      handleCompile()
    }
  }, [pendingCompile, isCompiling, handleCompile])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
      }
      // Ctrl+Shift+O → Go to Section palette
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        setShowSectionPalette(prev => !prev)
        setSectionPaletteQuery('')
      }
      // Escape closes the section palette
      if (e.key === 'Escape') {
        setShowSectionPalette(false)
        setSectionPaletteQuery('')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) {
        URL.revokeObjectURL(prevBlobUrl.current)
      }
    }
  }, [])

  // Send from floating bar: open chat + send message
  const handleFloatingSend = useCallback((message: string) => {
    setIsChatOpen(true)
    // Delay slightly so ChatPanel mounts before sendMessage triggers
    setTimeout(() => chat.sendMessage(message), 50)
  }, [chat])

  // Page count callback from PreviewPanel
  const handlePageCount = useCallback((count: number) => {
    setPdfPageCount(count)
    if (count <= 1) setOverflowDismissed(false) // reset dismiss when back to 1 page
  }, [])

  // Auto-trim handler — fetches proposal, then shows review modal
  const handleTrim = useCallback(async () => {
    if (isTrimming) return
    setIsTrimming(true)

    try {
      const response = await fetchWithKey('/api/trim-resume', {
        method: 'POST',
        body: JSON.stringify({ latexSource, jobData, pageCount: pdfPageCount }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        toast.error(data.error || 'Failed to trim resume')
        return
      }

      const changes = data.changes ?? []
      const items = data.items ?? []
      if (changes.length === 0) {
        // AI returned no changes — offer a retry via the toast action
        toast.error("AI couldn't identify changes. Tap to retry.", {
          action: { label: 'Retry', onClick: () => handleTrim() },
          duration: 6000,
        })
      } else {
        setShowReview(false)
        setIsChatOpen(false)
        setTrimProposal({ changes, items, originalSource: latexSource })
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trim resume')
    } finally {
      setIsTrimming(false)
    }
  }, [latexSource, jobData, pdfPageCount, isTrimming])

  // Apply approved trim changes from the review modal — works by line index, not text search
  const handleApplyTrim = useCallback((approvedIds: string[]) => {
    const proposal = trimProposal
    if (!proposal || approvedIds.length === 0) return

    const lines = proposal.originalSource.split('\n')
    const linesToRemove = new Set<number>()
    const approvedSet = new Set(approvedIds)

    for (const change of proposal.changes) {
      if (!approvedSet.has(change.id)) continue
      const item = proposal.items[change.itemIndex]
      if (!item) continue

      if (change.type === 'remove') {
        linesToRemove.add(item.lineNum)
      } else if (change.type === 'compress' && change.newText) {
        // Escape LaTeX special chars in AI-generated plain text before inserting
        const safeText = change.newText
          .replace(/%/g, '\\%')
          .replace(/&/g, '\\&')
          .replace(/#/g, '\\#')
          .replace(/\$/g, '\\$')
          .replace(/_/g, '\\_')
        // Detect the LaTeX command wrapper and replace content
        const line = lines[item.lineNum]
        if (/\\resumeItem\{/.test(line)) {
          lines[item.lineNum] = line.replace(/\\resumeItem\{[^}]*\}/, `\\resumeItem{${safeText}}`)
        } else if (/\\item\s/.test(line)) {
          lines[item.lineNum] = line.replace(/(\\item\s).*/, `$1${safeText}`)
        } else if (/\\textbf\{[^}]+:\}/.test(line)) {
          // Skill line: \textbf{Cat:} items \\  → replace items part
          lines[item.lineNum] = line.replace(/(\\textbf\{[^}]+:\}\s*).*?(\\\\)?$/, `$1${safeText} \\\\`)
        }
        // Unknown pattern: leave unchanged (safe fallback)
      }
    }

    const result = lines.filter((_, i) => !linesToRemove.has(i)).join('\n')

    saveVersion(latexSource, resumeTitle, 'Pre-trim')
    setPreviousLatex(latexSource)
    setLatexSource(result)
    setPendingCompile(true)
    setOverflowDismissed(true)
    setTrimProposal(null)
    toast.success('Trim applied!')
  }, [trimProposal, latexSource, resumeTitle, saveVersion])

  return (
    <div className="flex flex-col gap-3">
      {/* New to LaTeX hint */}
      {showLatexHint && (
        <div className="flex items-center gap-3 px-4 py-3 mx-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
          <MessageSquare className="w-4 h-4 text-blue-400 dark:text-blue-500 shrink-0" />
          <p className="flex-1 text-[13px] text-blue-700 dark:text-blue-300">
            <span className="font-semibold">New to LaTeX?</span>
            {' '}No worries. Open the AI chat with
            <kbd className="mx-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-[11px] font-mono text-blue-500 dark:text-blue-400">Ctrl+Shift+L</kbd>
            and tell it your details. It writes the LaTeX for you.
          </p>
          <button
            onClick={() => {
              setShowLatexHint(false)
              localStorage.setItem('resulyze-latex-hint-dismissed', '1')
            }}
            className="p-1 text-blue-300 hover:text-blue-500 dark:text-blue-600 dark:hover:text-blue-400 rounded transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className={`flex flex-col ${showLatexHint ? 'h-[calc(100vh-195px)]' : 'h-[calc(100vh-150px)]'} min-h-[500px] rounded-lg overflow-hidden border border-zinc-200 dark:border-latex-border shadow-sm dark:shadow-lg transition-all duration-200`}>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Code Editor */}
        <div className={`${isChatOpen || showReview || !!trimProposal ? 'lg:w-[40%]' : 'lg:w-1/2'} h-1/2 lg:h-full bg-white dark:bg-latex-editor min-w-0 transition-all duration-200`}>
          {/* Inner wrapper — flex flex-col h-full, mirrors PreviewPanel pattern so h-full in children resolves correctly */}
          <div className="flex flex-col h-full">

          {/* Toolbar — above code editor only */}
          <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center px-2.5 gap-2 border-b border-zinc-200 dark:border-latex-border shrink-0">
            {/* Left: document title */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => {
                    userEditedTitle.current = true
                    if (typewriterRef.current) {
                      clearInterval(typewriterRef.current)
                      typewriterRef.current = null
                      setIsGeneratingTitle(false)
                    }
                    setResumeTitle(e.target.value)
                  }}
                  placeholder={isGeneratingTitle ? '' : 'Untitled Resume'}
                  className={`text-[12px] text-zinc-700 dark:text-zinc-200 font-medium bg-transparent border-none outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 w-full truncate ${isGeneratingTitle ? 'caret-transparent' : ''}`}
                />
                {isGeneratingTitle && !resumeTitle && (
                  <span className="absolute inset-0 flex items-center text-[12px] font-medium text-zinc-400 dark:text-zinc-500 animate-pulse pointer-events-none">
                    Generating...
                  </span>
                )}
              </div>
              {resumeTitle && !isGeneratingTitle && (
                <button
                  onClick={() => {
                    userEditedTitle.current = true
                    setResumeTitle('')
                    localStorage.removeItem(TITLE_STORAGE_KEY)
                  }}
                  className="p-0.5 rounded text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors shrink-0"
                  title="Clear title"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />

            {/* Right: action buttons — all consistent icon+label / icon-only in compact */}
            <div className="flex items-center gap-0.5 shrink-0">
              {/* Optimize — primary AI action, violet accent */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleOptimize}
                      disabled={!jobData || isOptimizing}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        ${!jobData
                          ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                          : isOptimizing
                          ? 'text-violet-400 dark:text-violet-500 cursor-wait'
                          : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:text-violet-300 dark:hover:bg-violet-500/10'
                        }
                      `}
                    >
                      {isOptimizing
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        : <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      }
                      {!(isChatOpen || showReview) && <span>{isOptimizing ? 'Optimizing…' : 'Optimize'}</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {jobData
                      ? `Optimize for ${jobData.jobTitle || 'target role'}${jobData.company ? ' at ' + jobData.company : ''}`
                      : 'Complete Step 1 (Job Analysis) first'
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Review */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (showReview) {
                          setShowReview(false)
                          resumeReview.clearReview()
                        } else {
                          setShowReview(true)
                          resumeReview.requestReview(latexSource, jobData)
                        }
                      }}
                      disabled={resumeReview.isReviewing}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        ${showReview
                          ? 'text-zinc-800 bg-zinc-200/80 dark:text-zinc-100 dark:bg-white/10'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]'
                        }
                        ${resumeReview.isReviewing ? 'opacity-60 cursor-wait' : ''}
                      `}
                    >
                      {resumeReview.isReviewing
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        : <FileSearch className="w-3.5 h-3.5 shrink-0" />
                      }
                      {!(isChatOpen || showReview) && <span>{resumeReview.isReviewing ? 'Reviewing…' : 'Review'}</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>AI resume review with scoring</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Group divider */}
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />

              {/* Templates */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => !isApplyingTemplate && setShowTemplatePicker(true)}
                      disabled={isApplyingTemplate}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        ${isApplyingTemplate
                          ? 'text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]'}
                      `}
                    >
                      {isApplyingTemplate
                        ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
                        : <LayoutTemplate className="w-3.5 h-3.5 shrink-0" />}
                      {!(isChatOpen || showReview) && <span>{isApplyingTemplate ? 'Applying…' : 'Templates'}</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isApplyingTemplate ? 'Converting template…' : 'Choose a resume template'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* History */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowHistory(prev => !prev)}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        ${showHistory
                          ? 'text-zinc-800 bg-zinc-200/80 dark:text-zinc-100 dark:bg-white/10'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]'
                        }
                      `}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {!(isChatOpen || showReview) && <span>History</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Version history</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Find */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSearchTrigger(t => t + 1)}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]
                      `}
                    >
                      <Search className="w-3.5 h-3.5 shrink-0" />
                      {!(isChatOpen || showReview) && <span>Find</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Find & Replace (Ctrl+F)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Outline */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowOutline(prev => !prev)}
                      className={`flex items-center gap-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                        ${isChatOpen || showReview ? 'px-1.5 py-1' : 'px-2 py-1'}
                        ${showOutline
                          ? 'text-zinc-800 bg-zinc-200/80 dark:text-zinc-100 dark:bg-white/10'
                          : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08]'
                        }
                      `}
                    >
                      <List className="w-3.5 h-3.5 shrink-0" />
                      {!(isChatOpen || showReview) && <span>Outline</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Document outline</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Whitespace toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowWhitespace(prev => !prev)}
                      className={`p-1.5 rounded-md transition-all duration-150
                        ${showWhitespace
                          ? 'text-zinc-800 bg-zinc-200/80 dark:text-zinc-100 dark:bg-white/10'
                          : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-600 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08]'
                        }
                      `}
                    >
                      <Pilcrow className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Show whitespace characters</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Shortcuts */}
              <ShortcutsDialog compact={isChatOpen || showReview} />
            </div>
          </div>

          {/* Changes panel */}
          {showChangesPanel && optimizationChanges.length > 0 && (
            <div className="bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-700/50 px-3 py-2 shrink-0 max-h-36 overflow-y-auto">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {optimizationChanges.length} changes applied
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {previousLatex && (
                    <button
                      onClick={handleUndoOptimization}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700/50 rounded transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                  )}
                  <button
                    onClick={() => setShowChangesPanel(false)}
                    className="p-0.5 text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <ul className="space-y-0.5">
                {optimizationChanges.map((change, i) => (
                  <li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                    <span className="text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Editor + optional outline panel */}
          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 overflow-hidden">
              <CodePanel
                value={latexSource}
                onChange={setLatexSource}
                onCompile={handleCompile}
                searchTrigger={searchTrigger}
                navigateToLine={navigateLine}
                showWhitespace={showWhitespace}
              />
            </div>
            {showOutline && (
              <div className="w-44 shrink-0 border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <OutlinePanel
                  latexSource={latexSource}
                  onNavigate={(line) => {
                    setNavigateLine(line)
                    // Reset after a tick so repeated clicks on same line re-trigger
                    setTimeout(() => setNavigateLine(0), 100)
                  }}
                  onClose={() => setShowOutline(false)}
                />
              </div>
            )}
          </div>

          {/* Skill match bar */}
          {jobData && (
            <SkillMatchPanel jobData={jobData} latexSource={latexSource} />
          )}

          {/* Floating "Ask anything" bar */}
          {!isChatOpen && !showReview && (
            <ChatFloatingBar
              onSend={handleFloatingSend}
              onExpand={() => setIsChatOpen(true)}
              disabled={chat.isLoading}
            />
          )}
          </div>{/* end inner flex flex-col h-full wrapper */}
        </div>

        {/* Chat Panel, Review Panel, or Trim Panel — bottom sheet on mobile, inline column on desktop */}
        {(isChatOpen || showReview || !!trimProposal) && (
          <>
            {/* Desktop column divider */}
            <div className="hidden lg:block w-px bg-zinc-200 dark:bg-latex-border shrink-0" />

            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => {
                setIsChatOpen(false)
                setShowReview(false)
                setTrimProposal(null)
                resumeReview.clearReview()
              }}
            />

            {/* Panel */}
            <div className="fixed bottom-0 inset-x-0 z-50 h-[65vh] rounded-t-2xl shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 lg:static lg:h-full lg:w-[28%] lg:rounded-none lg:shadow-none lg:border-t-0 lg:bg-transparent flex flex-col min-w-0">
              {/* Mobile drag handle */}
              <div className="lg:hidden flex justify-center py-2.5 shrink-0">
                <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>
              {showReview ? (
                <ResumeReviewPanel
                  review={resumeReview.review}
                  isReviewing={resumeReview.isReviewing}
                  error={resumeReview.error}
                  onReviewAgain={() => resumeReview.requestReview(latexSource, jobData)}
                  onSendToChat={(msg) => {
                    setShowReview(false)
                    setIsChatOpen(true)
                    setTimeout(() => chat.sendMessage(msg), 50)
                  }}
                  onClose={() => {
                    setShowReview(false)
                    resumeReview.clearReview()
                  }}
                />
              ) : trimProposal ? (
                <TrimReviewPanel
                  proposal={trimProposal}
                  onApply={handleApplyTrim}
                  onClose={() => setTrimProposal(null)}
                  onSendToChat={(msg) => {
                    setTrimProposal(null)
                    setIsChatOpen(true)
                    setTimeout(() => chat.sendMessage(msg), 50)
                  }}
                />
              ) : (
                <ChatPanel
                  onClose={() => setIsChatOpen(false)}
                  messages={chat.messages}
                  isLoading={chat.isLoading}
                  onSendMessage={chat.sendMessage}
                  onApplyProposal={chat.applyProposal}
                  onDismissProposal={chat.dismissProposal}
                  onApplyChange={chat.applyChange}
                  onDismissChange={chat.dismissChange}
                  onUndoChanges={handleUndoOptimization}
                  onClearChat={chat.clearChat}
                  onStartBuilder={chat.startBuilder}
                />
              )}
            </div>
          </>
        )}

        {/* Divider */}
        <div className="hidden lg:block w-px bg-zinc-200 dark:bg-latex-border shrink-0" />
        <div className="lg:hidden h-px bg-zinc-200 dark:bg-latex-border shrink-0" />

        {/* Right: PDF Preview or Version History */}
        <div className={`${isChatOpen || showReview || !!trimProposal ? 'lg:w-[32%]' : 'lg:w-1/2'} h-1/2 lg:h-full flex flex-col bg-white min-w-0 transition-all duration-200 relative`}>
          {/* Overflow banner */}
          {pdfPageCount > 1 && !overflowDismissed && !showHistory && (
            <OverflowBanner
              pageCount={pdfPageCount}
              isTrimming={isTrimming}
              onTrim={handleTrim}
              onDismiss={() => setOverflowDismissed(true)}
            />
          )}
          {showHistory ? (
            <VersionHistory
              versions={versions}
              onRestore={handleRestoreVersion}
              onDelete={deleteVersion}
              onUpdateLabel={updateLabel}
              onClose={() => setShowHistory(false)}
            />
          ) : showAts ? (
            <AtsScorePanel
              analysis={atsAnalysis}
              isAnalyzing={isAtsAnalyzing}
              error={atsError}
              previousScore={atsPreviousScore}
              onClose={() => setShowAts(false)}
              onSendToChat={(msg) => {
                setShowAts(false)
                setIsChatOpen(true)
                setTimeout(() => chat.sendMessage(msg), 50)
              }}
            />
          ) : (
            <PreviewPanel
              pdfUrl={pdfBlobUrl}
              isCompiling={isCompiling}
              error={compilationError}
              onCompile={handleCompile}
              onDownload={handleDownload}
              onPageCount={handlePageCount}
              atsScore={atsAnalysis?.score ?? null}
              atsPreviousScore={atsPreviousScore}
              isAtsAnalyzing={isAtsAnalyzing}
              showAts={showAts}
              onToggleAts={() => setShowAts(prev => !prev)}
              onReanalyzeAts={reanalyzeAts}
            />
          )}
        </div>
      </div>
      </div>

      {/* Go to Section palette (Ctrl+Shift+O) */}
      {showSectionPalette && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-black/30 backdrop-blur-[1px]"
          onClick={() => { setShowSectionPalette(false); setSectionPaletteQuery('') }}
        >
          <div
            className="w-80 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700/60 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <Hash className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Go to section…"
                value={sectionPaletteQuery}
                onChange={e => setSectionPaletteQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredSections.length > 0) {
                    const s = filteredSections[0]
                    setNavigateLine(s.line)
                    setTimeout(() => setNavigateLine(0), 100)
                    setShowSectionPalette(false)
                    setSectionPaletteQuery('')
                  }
                  if (e.key === 'Escape') { setShowSectionPalette(false); setSectionPaletteQuery('') }
                }}
                className="flex-1 text-[12px] bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
              <kbd className="text-[10px] text-zinc-300 dark:text-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
            </div>
            {/* Section list */}
            <div className="max-h-64 overflow-y-auto py-1 no-scrollbar">
              {sections.length === 0 ? (
                <p className="px-3 py-5 text-center text-[11px] text-zinc-400 dark:text-zinc-600">No sections found in document</p>
              ) : filteredSections.length === 0 ? (
                <p className="px-3 py-5 text-center text-[11px] text-zinc-400 dark:text-zinc-600">No match</p>
              ) : (
                filteredSections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setNavigateLine(s.line)
                      setTimeout(() => setNavigateLine(0), 100)
                      setShowSectionPalette(false)
                      setSectionPaletteQuery('')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <span className={`text-[10px] font-mono text-zinc-300 dark:text-zinc-700 shrink-0 w-4
                      ${s.level === 'section' ? '' : s.level === 'subsection' ? 'pl-2' : 'pl-4'}`}>
                      {s.level === 'section' ? '§' : s.level === 'subsection' ? '›' : '»'}
                    </span>
                    <span className={`text-[12px] flex-1 truncate
                      ${s.level === 'section' ? 'text-zinc-800 dark:text-zinc-200 font-medium' :
                        s.level === 'subsection' ? 'text-zinc-600 dark:text-zinc-400' :
                        'text-zinc-500 dark:text-zinc-500'}`}>
                      {s.title}
                    </span>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-700 font-mono shrink-0">:{s.line}</span>
                  </button>
                ))
              )}
            </div>
            {sections.length > 0 && (
              <div className="px-3 py-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">{filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''}</span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-700">↵ to jump</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template picker modal */}
      {showTemplatePicker && (
        <TemplatePickerModal
          currentSource={latexSource}
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}

    </div>
  )
}
