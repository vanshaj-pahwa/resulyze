'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { RefreshCw, Download, Loader2, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react'

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174'

interface PreviewPanelProps {
  pdfUrl: string | null
  isCompiling: boolean
  error: string | null
  onCompile: () => void
  onDownload: () => void
}

// Load pdf.js from CDN once
let pdfjsLib: any = null
function loadPdfjs(): Promise<any> {
  if (pdfjsLib) return Promise.resolve(pdfjsLib)

  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      pdfjsLib = (window as any).pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`
      resolve(pdfjsLib)
      return
    }
    const script = document.createElement('script')
    script.src = `${PDFJS_CDN}/pdf.min.js`
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`
        pdfjsLib = lib
        resolve(lib)
      } else {
        reject(new Error('pdfjsLib not found on window after script load'))
      }
    }
    script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'))
    document.head.appendChild(script)
  })
}

async function renderPageToCanvas(
  pdfDoc: any,
  pageNum: number,
  canvas: HTMLCanvasElement,
  containerWidth: number,
  scale: number
) {
  const page = await pdfDoc.getPage(pageNum)
  const targetWidth = Math.max((containerWidth - 32) * scale, 100)
  const unscaledViewport = page.getViewport({ scale: 1 })
  const renderScale = targetWidth / unscaledViewport.width
  const viewport = page.getViewport({ scale: renderScale })

  const dpr = window.devicePixelRatio || 1
  canvas.width = viewport.width * dpr
  canvas.height = viewport.height * dpr
  canvas.style.width = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  await page.render({ canvasContext: ctx, viewport }).promise
}

export default function PreviewPanel({ pdfUrl, isCompiling, error, onCompile, onDownload }: PreviewPanelProps) {
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
        return lib.getDocument(pdfUrl).promise
      })
      .then(doc => {
        if (!doc || renderIdRef.current !== currentRenderId) return
        pdfDocRef.current = doc
        setNumPages(doc.numPages)
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

      const width = container!.clientWidth
      if (width === 0) { rendering = false; return }

      const canvases = container!.querySelectorAll('canvas')
      for (let i = 0; i < canvases.length; i++) {
        if (cancelled) { rendering = false; return }
        try {
          await renderPageToCanvas(doc, i + 1, canvases[i] as HTMLCanvasElement, width, scale)
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
      <div className="h-11 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onCompile}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            {isCompiling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Compile</span>
          </button>
        </div>

        {pdfUrl && !pdfError && (
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <button onClick={zoomOut} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors" title="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={resetZoom} className="px-1.5 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-[11px] font-mono min-w-[3rem] text-center" title="Reset zoom">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={zoomIn} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors" title="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">|</span>
            <button onClick={onDownload} className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-600 dark:text-zinc-400">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
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
                <canvas
                  key={`page-${i + 1}`}
                  className="shadow-[0_2px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)] rounded mx-auto bg-white"
                />
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
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-500 font-medium">No PDF preview yet</p>
                <p className="text-zinc-400 text-sm mt-1">
                  Click <strong>Compile</strong> or press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">Ctrl+Enter</kbd>
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
