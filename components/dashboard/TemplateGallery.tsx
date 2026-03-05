'use client'

import { useState, useEffect, useRef } from 'react'
import { TEMPLATES, type ResumeTemplate } from '@/lib/templates'
import { loadPdfjs, loadDocument, renderPage, PDF_CACHE_VERSION } from '@/lib/pdf-renderer'
import { fetchWithKey } from '@/lib/fetch'
import { Loader2 } from 'lucide-react'
import TemplatePreviewModal from './TemplatePreviewModal'

function hashSource(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h.toString(36)
}

// ─── Serial pipeline — one template at a time (compile → load → render) ─────

let pipeline: Promise<void> = Promise.resolve()

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  let resolve: (v: T) => void
  let reject: (e: any) => void
  const result = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  pipeline = pipeline.then(() => fn().then(resolve!, reject!), () => fn().then(resolve!, reject!))
  return result
}

function getCacheKey(template: ResumeTemplate) {
  return `resulyze-tpl-v${PDF_CACHE_VERSION}-${template.id}-${hashSource(template.source)}`
}

function getCachedBlob(key: string): Blob | null {
  const cached = sessionStorage.getItem(key)
  if (!cached) return null
  const binary = atob(cached)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: 'application/pdf' })
}

function saveBlobToCache(key: string, blob: Blob) {
  blob.arrayBuffer().then(buffer => {
    try {
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192) as unknown as number[])
      }
      sessionStorage.setItem(key, btoa(binary))
    } catch {
      // sessionStorage full
    }
  })
}

// ─── PDF Thumbnail for a template ────────────────────────────────────────────

function TemplateThumbnail({ template, onClick }: { template: ResumeTemplate; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Entire compile→load→render pipeline is serialized through one queue
    enqueue(async () => {
      if (cancelled) return

      const key = getCacheKey(template)
      let pdfBlob = getCachedBlob(key)

      if (!pdfBlob) {
        const res = await fetchWithKey('/api/compile-latex', {
          method: 'POST',
          body: JSON.stringify({ source: template.source }),
        })
        if (!res.ok) throw new Error('Compile failed')
        pdfBlob = await res.blob()
        saveBlobToCache(key, pdfBlob)
      }

      if (cancelled) return

      const blobUrl = URL.createObjectURL(pdfBlob)
      try {
        const lib = await loadPdfjs()
        const doc = await loadDocument(lib, blobUrl)

        if (cancelled) return

        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        await renderPage(doc, 1, canvas, null, container.clientWidth, 1)
      } finally {
        URL.revokeObjectURL(blobUrl)
      }

      if (!cancelled) setLoading(false)
    }).catch(() => {
      if (!cancelled) {
        setError(true)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [template])

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col rounded-lg border-2 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all duration-150 overflow-hidden text-left"
    >
      {/* PDF preview */}
      <div ref={containerRef} className="relative bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-400">Preview unavailable</span>
          </div>
        )}
        <canvas ref={canvasRef} className={`w-full h-full object-contain ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`} />
      </div>

      {/* Card footer */}
      <div className="p-2.5 bg-white dark:bg-zinc-900">
        <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
          {template.name}
        </p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-0.5 mt-1.5">
          {template.tags.map(tag => (
            <span
              key={tag}
              className="text-[9px] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

export default function TemplateGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)

  return (
    <div id="templates">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Templates</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pick a template to create a new resume</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map(template => (
          <TemplateThumbnail
            key={template.id}
            template={template}
            onClick={() => setSelectedTemplate(template)}
          />
        ))}
      </div>

      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  )
}
