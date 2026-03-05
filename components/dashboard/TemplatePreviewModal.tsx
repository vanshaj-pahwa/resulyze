'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ResumeTemplate } from '@/lib/templates'
import { useResumeManagerContext } from '@/contexts/ResumeManagerContext'
import { trackAnalyticsEvent } from '@/hooks/useAnalytics'
import { loadPdfjs, loadDocument, renderPage, PDF_CACHE_VERSION } from '@/lib/pdf-renderer'
import { fetchWithKey } from '@/lib/fetch'

function hashSource(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h.toString(36)
}

interface TemplatePreviewModalProps {
  template: ResumeTemplate
  onClose: () => void
}

export default function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resumeManager = useResumeManagerContext()
  const router = useRouter()

  // Compile and render PDF preview
  useEffect(() => {
    let cancelled = false

    async function compile() {
      try {
        const cacheKey = `resulyze-tpl-v${PDF_CACHE_VERSION}-${template.id}-${hashSource(template.source)}`
        const cached = sessionStorage.getItem(cacheKey)

        let pdfBlob: Blob
        if (cached) {
          const binary = atob(cached)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          pdfBlob = new Blob([bytes], { type: 'application/pdf' })
        } else {
          const res = await fetchWithKey('/api/compile-latex', {
            method: 'POST',
            body: JSON.stringify({ source: template.source }),
          })
          if (!res.ok) throw new Error('Compile failed')
          pdfBlob = await res.blob()
        }

        if (cancelled) return

        const blobUrl = URL.createObjectURL(pdfBlob)
        const lib = await loadPdfjs()
        const doc = await loadDocument(lib, blobUrl)

        if (cancelled) { URL.revokeObjectURL(blobUrl); return }

        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) { URL.revokeObjectURL(blobUrl); return }

        const width = container.clientWidth
        await renderPage(doc, 1, canvas, null, width, 1)
        URL.revokeObjectURL(blobUrl)

        if (!cancelled) setLoading(false)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    compile()
    return () => { cancelled = true }
  }, [template])

  const handleCreate = () => {
    const name = title.trim() || `${template.name} Resume`
    resumeManager.createResume(name, template.id, template.source)
    trackAnalyticsEvent('resume_created', { template: template.name })
    onClose()
    router.push('/dashboard/resume')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{template.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900 flex items-start justify-center p-6">
          {loading && (
            <div className="flex flex-col items-center gap-2 py-12">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-400">Loading preview...</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`shadow-lg rounded bg-white ${loading ? 'hidden' : ''}`}
          />
        </div>

        {/* Footer — name input + create button */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`${template.name} Resume`}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="flex-1 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-zinc-900 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Resume
          </button>
        </div>
      </div>
    </div>
  )
}
