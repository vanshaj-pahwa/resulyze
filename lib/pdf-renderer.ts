const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174'
const PDFJS_NPM = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174'

/** Cache version — bump to invalidate sessionStorage template caches. */
export const PDF_CACHE_VERSION = 4

let pdfjsLib: any = null

/** Load pdf.js from CDN once (singleton). */
export function loadPdfjs(): Promise<any> {
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

/** Load a PDF document with proper font/cMap configuration. */
export function loadDocument(lib: any, src: string | ArrayBuffer) {
  const source = typeof src === 'string' ? { url: src } : { data: src }
  return lib.getDocument({
    ...source,
    cMapUrl: `${PDFJS_NPM}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${PDFJS_NPM}/standard_fonts/`,
    disableFontFace: false,
  }).promise
}

/** Render a single PDF page onto a canvas with optional link annotations. */
export async function renderPage(
  pdfDoc: any,
  pageNum: number,
  canvas: HTMLCanvasElement,
  annotationDiv: HTMLDivElement | null,
  containerWidth: number,
  scale: number
) {
  const page = await pdfDoc.getPage(pageNum)
  const targetWidth = Math.max(containerWidth * scale, 100)
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

  if (!annotationDiv) return

  annotationDiv.innerHTML = ''
  annotationDiv.style.width = `${viewport.width}px`
  annotationDiv.style.height = `${viewport.height}px`

  try {
    const annotations = await page.getAnnotations()
    for (const annotation of annotations) {
      if (annotation.subtype !== 'Link') continue
      const url = annotation.url || annotation.unsafeUrl
      if (!url) continue

      const rect = viewport.convertToViewportRectangle(annotation.rect)
      const left = Math.min(rect[0], rect[2])
      const top = Math.min(rect[1], rect[3])
      const width = Math.abs(rect[2] - rect[0])
      const height = Math.abs(rect[3] - rect[1])

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.style.cssText = `position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;pointer-events:auto;cursor:pointer;`
      annotationDiv.appendChild(link)
    }
  } catch {
    // Annotation rendering is non-critical
  }
}
