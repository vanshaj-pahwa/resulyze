'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { DEFAULT_LATEX_SOURCE } from './defaultTemplate'
import { FileText, Sparkles, Loader2, X, Undo2, CheckCircle2, Clock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { fetchWithKey } from '@/lib/fetch'
import { useChatLatex } from '@/hooks/useChatLatex'
import { useResumeVersions } from '@/hooks/useResumeVersions'
import { ShortcutsDialog } from '@/components/ui/shortcuts-dialog'

const CodePanel = dynamic(() => import('./CodePanel'), { ssr: false })
const PreviewPanel = dynamic(() => import('./PreviewPanel'), { ssr: false })
const SkillMatchPanel = dynamic(() => import('./SkillMatchPanel'), { ssr: false })
const ChatPanel = dynamic(() => import('./ChatPanel'), { ssr: false })
const ChatFloatingBar = dynamic(() => import('./ChatFloatingBar'), { ssr: false })
const VersionHistory = dynamic(() => import('./VersionHistory'), { ssr: false })

interface LatexEditorProps {
  readonly jobData: any
  readonly onResumeDataChange: (data: any) => void
}

const STORAGE_KEY = 'resulyze-latex-source'
const TITLE_STORAGE_KEY = 'resulyze-resume-title'

export default function LatexEditor({ jobData, onResumeDataChange }: LatexEditorProps) {
  const [latexSource, setLatexSource] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return saved
    }
    return DEFAULT_LATEX_SOURCE
  })
  const [resumeTitle, setResumeTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TITLE_STORAGE_KEY) || ''
    }
    return ''
  })
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationError, setCompilationError] = useState<string | null>(null)
  const prevBlobUrl = useRef<string | null>(null)

  // Auto-title generation state
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const userEditedTitle = useRef(!!resumeTitle)

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationChanges, setOptimizationChanges] = useState<string[]>([])
  const [showChangesPanel, setShowChangesPanel] = useState(false)
  const [previousLatex, setPreviousLatex] = useState<string | null>(null)

  // Auto-compile flag — when true, triggers compilation on next render
  const [pendingCompile, setPendingCompile] = useState(true) // true = compile on initial load

  // Version history
  const { versions, saveVersion, deleteVersion, updateLabel } = useResumeVersions()
  const [showHistory, setShowHistory] = useState(false)

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

  // Auto-compile when pendingCompile is set (initial load + after optimization)
  useEffect(() => {
    if (pendingCompile && !isCompiling) {
      setPendingCompile(false)
      handleCompile()
    }
  }, [pendingCompile, isCompiling, handleCompile])

  // Keyboard shortcut: Ctrl+Shift+L to toggle chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
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

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] rounded-lg overflow-hidden border border-latex-border shadow-lg">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Code Editor */}
        <div className={`${isChatOpen ? 'lg:w-[40%]' : 'lg:w-1/2'} h-1/2 lg:h-full flex flex-col bg-latex-editor min-w-0 relative transition-all duration-200`}>
          {/* Tab bar */}
          <div className="h-10 bg-latex-toolbar flex items-center justify-between px-2 border-b border-latex-border shrink-0 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0">
              <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <div className="relative min-w-0">
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
                  className={`text-xs text-white font-mono bg-transparent border-none outline-none placeholder:text-zinc-500 min-w-0 ${isChatOpen ? 'w-28 sm:w-36' : 'w-40 sm:w-56'} ${isGeneratingTitle ? 'caret-transparent' : ''}`}
                />
                {isGeneratingTitle && !resumeTitle && (
                  <span className="absolute inset-0 flex items-center text-xs font-mono text-zinc-500 animate-pulse pointer-events-none">
                    Generating title...
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Optimize for JD button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleOptimize}
                      disabled={!jobData || isOptimizing}
                      className={`flex items-center gap-1 px-1.5 py-1 text-xs rounded transition-colors font-medium whitespace-nowrap
                        ${jobData
                          ? 'text-zinc-200 hover:text-white hover:bg-white/10 border border-zinc-600'
                          : 'text-zinc-600 cursor-not-allowed border border-zinc-700'
                        }
                        ${isOptimizing ? 'opacity-60 cursor-wait' : ''}
                      `}
                    >
                      {isOptimizing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      )}
                      {!isChatOpen && <span className="hidden sm:inline">{isOptimizing ? 'Optimizing...' : 'Optimize for JD'}</span>}
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

              {/* Version History button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowHistory(prev => !prev)}
                      className={`flex items-center gap-1 px-1.5 py-1 text-xs rounded transition-colors font-medium whitespace-nowrap border
                        ${showHistory
                          ? 'text-white bg-white/10 border-zinc-500'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/10 border-zinc-700'
                        }
                      `}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {!isChatOpen && <span className="hidden sm:inline">History</span>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Version history</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Shortcuts */}
              <ShortcutsDialog compact={isChatOpen} />
            </div>
          </div>

          {/* Changes panel */}
          {showChangesPanel && optimizationChanges.length > 0 && (
            <div className="bg-zinc-800/60 border-b border-zinc-700/50 px-3 py-2 shrink-0 max-h-36 overflow-y-auto">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-xs font-medium text-zinc-300">
                    {optimizationChanges.length} changes applied
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {previousLatex && (
                    <button
                      onClick={handleUndoOptimization}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700/50 rounded transition-colors"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                  )}
                  <button
                    onClick={() => setShowChangesPanel(false)}
                    className="p-0.5 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <ul className="space-y-0.5">
                {optimizationChanges.map((change, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-zinc-500 mt-0.5 shrink-0">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodePanel
              value={latexSource}
              onChange={setLatexSource}
              onCompile={handleCompile}
            />
          </div>

          {/* Skill match bar */}
          {jobData && (
            <SkillMatchPanel jobData={jobData} latexSource={latexSource} />
          )}

          {/* Floating "Ask anything" bar */}
          {!isChatOpen && (
            <ChatFloatingBar
              onSend={handleFloatingSend}
              onExpand={() => setIsChatOpen(true)}
              disabled={chat.isLoading}
            />
          )}
        </div>

        {/* Chat Panel (middle column) */}
        {isChatOpen && (
          <>
            <div className="hidden lg:block w-px bg-latex-border shrink-0" />
            <div className="lg:hidden h-px bg-latex-border shrink-0" />
            <div className="lg:w-[28%] h-1/3 lg:h-full flex flex-col min-w-0">
              <ChatPanel
                onClose={() => setIsChatOpen(false)}
                messages={chat.messages}
                isLoading={chat.isLoading}
                onSendMessage={chat.sendMessage}
                onApplyProposal={chat.applyProposal}
                onDismissProposal={chat.dismissProposal}
                onUndoChanges={handleUndoOptimization}
                onClearChat={chat.clearChat}
              />
            </div>
          </>
        )}

        {/* Divider */}
        <div className="hidden lg:block w-px bg-latex-border shrink-0" />
        <div className="lg:hidden h-px bg-latex-border shrink-0" />

        {/* Right: PDF Preview or Version History */}
        <div className={`${isChatOpen ? 'lg:w-[32%]' : 'lg:w-1/2'} h-1/2 lg:h-full flex flex-col bg-white min-w-0 transition-all duration-200 relative`}>
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
            />
          )}
        </div>
      </div>
    </div>
  )
}
