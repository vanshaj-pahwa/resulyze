'use client'

import { useState, useCallback } from 'react'
import { RefreshCw, Download, Loader2, AlertCircle, Maximize } from 'lucide-react'

type ZoomMode = 'FitH' | 'Fit'

interface PreviewPanelProps {
  pdfUrl: string | null
  isCompiling: boolean
  error: string | null
  onCompile: () => void
  onDownload: () => void
}

export default function PreviewPanel({ pdfUrl, isCompiling, error, onCompile, onDownload }: PreviewPanelProps) {
  const [zoom, setZoom] = useState<ZoomMode>('FitH')

  const buildSrc = useCallback((url: string, z: ZoomMode) => {
    return `${url}#toolbar=0&navpanes=0&scrollbar=0&view=${z}`
  }, [])

  const toggleZoom = useCallback(() => {
    setZoom(prev => (prev === 'FitH' ? 'Fit' : 'FitH'))
  }, [])

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
            Compile
          </button>
        </div>

        {pdfUrl && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <button
              onClick={toggleZoom}
              className="flex items-center gap-1 px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
              title={zoom === 'FitH' ? 'Switch to Fit page' : 'Switch to Fit width'}
            >
              <Maximize className="w-3 h-3" />
              <span>{zoom === 'FitH' ? 'Fit width' : 'Fit page'}</span>
            </button>

            <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">|</span>

            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-600 dark:text-zinc-400"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-zinc-100 overflow-hidden relative">
        {isCompiling && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
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
          <iframe
            key={`pdf-${zoom}`}
            src={buildSrc(pdfUrl, zoom)}
            className="w-full h-full border-0"
            title="Compiled PDF Preview"
          />
        ) : !error && !isCompiling ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-200 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-500 font-medium">No PDF preview yet</p>
                <p className="text-zinc-400 text-sm mt-1">
                  Click <strong>Compile</strong> or press <kbd className="px-1.5 py-0.5 bg-zinc-200 rounded text-xs font-mono">Ctrl+Enter</kbd> to compile
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
