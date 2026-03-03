'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { DEFAULT_LATEX_SOURCE } from './defaultTemplate'
import { FileText, Sparkles, Loader2, X, Undo2, CheckCircle2, Clock, MessageSquare, Search, FileSearch, List } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { fetchWithKey } from '@/lib/fetch'
import { useChatLatex } from '@/hooks/useChatLatex'
import { useResumeVersions } from '@/hooks/useResumeVersions'
import { useResumeReview } from '@/hooks/useResumeReview'
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

interface LatexEditorProps {
  readonly jobData: any
  readonly onResumeDataChange: (data: any) => void
}

const STORAGE_KEY = 'resulyze-latex-source'
const TITLE_STORAGE_KEY = 'resulyze-resume-title'

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

  // Outline panel state
  const [showOutline, setShowOutline] = useState(false)
  const [navigateLine, setNavigateLine] = useState(0)

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

  // Keyboard shortcuts: Ctrl+Shift+L (chat), Ctrl+Shift+O (outline)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault()
        setShowOutline(prev => !prev)
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

  // Auto-trim handler
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

      if (data.trimmedLatex) {
        saveVersion(latexSource, resumeTitle, 'Pre-trim')
        setPreviousLatex(latexSource)
        setLatexSource(data.trimmedLatex)
        setPendingCompile(true)
        setOverflowDismissed(true)
        toast.success('Resume trimmed! Review the changes.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to trim resume')
    } finally {
      setIsTrimming(false)
    }
  }, [latexSource, jobData, pdfPageCount, isTrimming, saveVersion, resumeTitle])

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
        <div className={`${isChatOpen || showReview ? 'lg:w-[40%]' : 'lg:w-1/2'} h-1/2 lg:h-full bg-white dark:bg-latex-editor min-w-0 transition-all duration-200`}>
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
                  <TooltipContent>Document outline (Ctrl+Shift+O)</TooltipContent>
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

        {/* Chat Panel or Review Panel — bottom sheet on mobile, inline column on desktop */}
        {(isChatOpen || showReview) && (
          <>
            {/* Desktop column divider */}
            <div className="hidden lg:block w-px bg-zinc-200 dark:bg-latex-border shrink-0" />

            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => {
                setIsChatOpen(false)
                setShowReview(false)
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
        <div className={`${isChatOpen || showReview ? 'lg:w-[32%]' : 'lg:w-1/2'} h-1/2 lg:h-full flex flex-col bg-white min-w-0 transition-all duration-200 relative`}>
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
          ) : (
            <PreviewPanel
              pdfUrl={pdfBlobUrl}
              isCompiling={isCompiling}
              error={compilationError}
              onCompile={handleCompile}
              onDownload={handleDownload}
              onPageCount={handlePageCount}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
