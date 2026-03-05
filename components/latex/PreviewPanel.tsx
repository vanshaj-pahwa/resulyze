'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { RotateCw, Download, Loader2, AlertCircle, ZoomIn, ZoomOut, ScanText, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { loadPdfjs, loadDocument, renderPage } from '@/lib/pdf-renderer'

interface PreviewPanelProps {
  pdfUrl: string | null
  isCompiling: boolean
  error: string | null
  onCompile: () => void
  onDownload: () => void
  onPageCount?: (count: number) => void
  // ATS
  atsScore?: number | null
  atsPreviousScore?: number | null
  isAtsAnalyzing?: boolean
  showAts?: boolean
  onToggleAts?: () => void
  onReanalyzeAts?: () => void
}

export default function PreviewPanel({ pdfUrl, isCompiling, error, onCompile, onDownload, onPageCount, atsScore, atsPreviousScore, isAtsAnalyzing, showAts, onToggleAts, onReanalyzeAts }: PreviewPanelProps) {
  const [scale, setScale] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const pdfDocRef = useRef<any>(null)
  const renderIdRef = useRef(0)

  // Load and render PDF when URL changes
  useEffect(() => {
    if (!pdfUrl) {
      setNumPages(0)
      setPdfError(null)
      pdfDocRef.current = null
      return
    }

    const currentRenderId = ++renderIdRef.current
    setPdfLoading(true)
    setPdfError(null)
    setNumPages(0)

    loadPdfjs()
      .then(lib => {
        if (renderIdRef.current !== currentRenderId) return
        return loadDocument(lib, pdfUrl)
      })
      .then(doc => {
        if (!doc || renderIdRef.current !== currentRenderId) return
        pdfDocRef.current = doc
        setNumPages(doc.numPages)
        onPageCount?.(doc.numPages)
        setPdfLoading(false)
      })
      .catch((err: any) => {
        if (renderIdRef.current !== currentRenderId) return
        console.error('PDF load error:', err)
        setPdfError(err?.message || 'Failed to load PDF')
        setPdfLoading(false)
      })

    return () => { renderIdRef.current++ }
  }, [pdfUrl])

  // Unified render effect — handles both initial render and resize
  useEffect(() => {
    const container = canvasContainerRef.current
    const doc = pdfDocRef.current
    if (!container || !doc || numPages === 0) return

    let cancelled = false
    let rendering = false

    async function renderAll() {
      if (cancelled || rendering) return
      rendering = true

      const cs = getComputedStyle(container!)
      const width = container!.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      if (width === 0) { rendering = false; return }

      const wrappers = container!.querySelectorAll('[data-page-wrapper]')
      for (let i = 0; i < wrappers.length; i++) {
        if (cancelled) { rendering = false; return }
        const canvas = wrappers[i].querySelector('canvas') as HTMLCanvasElement
        const annotationLayer = wrappers[i].querySelector('[data-annotation-layer]') as HTMLDivElement
        if (!canvas || !annotationLayer) continue
        try {
          await renderPage(doc, i + 1, canvas, annotationLayer, width, scale)
        } catch (err) {
          console.error(`Failed to render page ${i + 1}:`, err)
        }
      }
      rendering = false
    }

    // Initial render — double rAF ensures layout is complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) renderAll()
      })
    })

    // Re-render on container resize (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (!cancelled) renderAll()
      }, 100)
    })
    observer.observe(container)

    return () => {
      cancelled = true
      observer.disconnect()
      clearTimeout(resizeTimer)
    }
  }, [numPages, scale])

  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.25, 3)), [])
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.25, 0.5)), [])
  const resetZoom = useCallback(() => setScale(1), [])

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-10 bg-zinc-50 dark:bg-latex-toolbar flex items-center justify-between px-2.5 border-b border-zinc-200 dark:border-latex-border shrink-0">
        <div className="flex items-center gap-1">
          {/* Compile — primary action */}
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isCompiling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <RotateCw className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{isCompiling ? 'Compiling…' : 'Compile'}</span>
          </button>

          {/* ATS Score — split-pill diagnostic readout */}
          {onToggleAts && (() => {
            const displayScore = isAtsAnalyzing ? null : atsScore
            const scoreDelta = (atsScore != null && atsPreviousScore != null && !isAtsAnalyzing)
              ? atsScore - atsPreviousScore
              : null
            const chipColor = displayScore == null
              ? showAts
                ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-white/10'
                : 'border-zinc-200 dark:border-zinc-700/70 hover:border-zinc-300 dark:hover:border-zinc-600'
              : displayScore >= 85
                ? showAts
                  ? 'border-emerald-400 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10'
                  : 'border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/60'
                : displayScore >= 60
                ? showAts
                  ? 'border-amber-400 dark:border-amber-500/60 bg-amber-50 dark:bg-amber-500/10'
                  : 'border-amber-200 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60'
                : showAts
                  ? 'border-red-400 dark:border-red-500/60 bg-red-50 dark:bg-red-500/10'
                  : 'border-red-200 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-500/60'
            const dividerColor = displayScore == null
              ? 'bg-zinc-200 dark:bg-zinc-700/70'
              : displayScore >= 85
              ? 'bg-emerald-200 dark:bg-emerald-500/30'
              : displayScore >= 60
              ? 'bg-amber-200 dark:bg-amber-500/30'
              : 'bg-red-200 dark:bg-red-500/30'
            const scoreTextColor = displayScore == null
              ? 'text-zinc-400 dark:text-zinc-500'
              : displayScore >= 85
              ? 'text-emerald-700 dark:text-emerald-300'
              : displayScore >= 60
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-red-700 dark:text-red-300'

            return (
              <div className="flex items-stretch h-7">
                <button
                  onClick={onToggleAts}
                  title="ATS compatibility score — analyzes the compiled PDF"
                  className={`group flex items-stretch ${atsScore != null && !isAtsAnalyzing ? 'rounded-l-md border-r-0' : 'rounded-md'} overflow-hidden border transition-all duration-200 whitespace-nowrap ${chipColor}`}
                >
                  {/* Label section */}
                  <div className="flex items-center gap-1 px-2 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                    <ScanText className="w-3 h-3 shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">ATS</span>
                  </div>

                  {/* Divider */}
                  <div className={`w-px self-stretch transition-colors ${dividerColor}`} />

                  {/* Score section */}
                  <div className={`flex items-center justify-center gap-1 px-2 min-w-[2rem] transition-colors ${scoreTextColor}`}>
                    {isAtsAnalyzing ? (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 rounded-full bg-current animate-bounce" />
                      </span>
                    ) : (
                      <>
                        <span className="text-[11px] font-bold tabular-nums leading-none">
                          {atsScore ?? '—'}
                        </span>
                        {scoreDelta != null && scoreDelta !== 0 && (
                          scoreDelta > 0 ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500 dark:text-red-400" />
                          )
                        )}
                      </>
                    )}
                  </div>
                </button>

                {/* Reload button — only visible when we have a score */}
                {atsScore != null && !isAtsAnalyzing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onReanalyzeAts?.() }}
                    disabled={!pdfUrl}
                    title="Re-analyze ATS score"
                    className={`flex items-center justify-center px-1.5 border rounded-r-md transition-all duration-200
                      ${displayScore == null
                        ? 'border-zinc-200 dark:border-zinc-700/70 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        : displayScore >= 85
                        ? 'border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                        : displayScore >= 60
                        ? 'border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                        : 'border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10'
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })()}
        </div>

        {/* Zoom controls + download */}
        {pdfUrl && !pdfError && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={zoomOut}
              className="flex items-center justify-center px-1.5 py-1 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 rounded-md text-[11px] font-medium tabular-nums text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150 min-w-[2.75rem] text-center"
              title="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="flex items-center justify-center px-1.5 py-1 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Separator */}
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />

            {/* Download */}
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-white/[0.08] transition-all duration-150 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 bg-zinc-200 dark:bg-zinc-800 overflow-auto relative">
        {isCompiling && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
              <span className="text-sm text-zinc-500 font-medium">Compiling LaTeX...</span>
            </div>
          </div>
        )}

        {error && !isCompiling && (
          <div className="absolute inset-0 flex flex-col bg-[#1e1e1e] z-10">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-red-900/50">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Compilation Error</span>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-red-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">
              {error}
            </pre>
          </div>
        )}

        {pdfUrl && !error ? (
          <>
            {(pdfLoading || numPages === 0) && !pdfError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                  <span className="text-xs text-zinc-400">Loading PDF preview...</span>
                </div>
              </div>
            )}

            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                  <p className="text-sm text-red-400">{pdfError}</p>
                  <p className="text-xs text-zinc-400">PDF was compiled but preview failed to load. You can still download it.</p>
                </div>
              </div>
            )}

            <div ref={canvasContainerRef} className="flex flex-col gap-4 py-4 px-4">
              {Array.from({ length: numPages }, (_, i) => (
                <div key={`page-${i + 1}`} data-page-wrapper className="relative mx-auto">
                  <canvas
                    className="shadow-[0_2px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] rounded bg-white"
                  />
                  <div
                    data-annotation-layer
                    className="absolute top-0 left-0 pointer-events-none [&>a]:pointer-events-auto"
                  />
                </div>
              ))}
              {numPages > 0 && (
                <p className="text-xs text-zinc-400 pb-2">
                  {numPages} {numPages === 1 ? 'page' : 'pages'}
                </p>
              )}
            </div>
          </>
        ) : !error && !isCompiling ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-300/60 dark:bg-zinc-700/60 flex items-center justify-center">
                <RotateCw className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div>
                <p className="text-zinc-600 dark:text-zinc-300 font-medium text-[15px]">No PDF preview yet</p>
                <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">
                  Click <strong className="text-zinc-500 dark:text-zinc-400">Compile</strong> or press <kbd className="px-1.5 py-0.5 bg-zinc-300/70 dark:bg-zinc-700 rounded text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Ctrl+Enter</kbd>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
