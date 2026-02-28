import { NextRequest, NextResponse } from 'next/server'

const COMPILE_URL = 'https://latex.ytotech.com/builds/sync'

async function compileWithRetry(source: string, retries = 2): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(COMPILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'pdflatex',
          resources: [{ main: true, content: source }],
        }),
        signal: AbortSignal.timeout(30000),
      })

      // If the service returns a server error (5xx), retry
      if (response.status >= 500 && attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
        continue
      }

      return response
    } catch (err: any) {
      lastError = err
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Compilation failed after retries')
}

export async function POST(request: NextRequest) {
  try {
    const { source } = await request.json()

    if (!source?.trim()) {
      return NextResponse.json({ error: 'LaTeX source is required' }, { status: 400 })
    }

    const compileResponse = await compileWithRetry(source)

    if (!compileResponse.ok) {
      const errorText = await compileResponse.text()
      return NextResponse.json(
        { error: 'Compilation failed', details: errorText },
        { status: 422 }
      )
    }

    const contentType = compileResponse.headers.get('content-type') || ''

    if (!contentType.includes('application/pdf')) {
      const errorText = await compileResponse.text()
      return NextResponse.json(
        { error: 'Compilation failed', details: errorText },
        { status: 422 }
      )
    }

    const pdfBuffer = await compileResponse.arrayBuffer()

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=resume.pdf',
      },
    })
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Compilation timed out. The service may be busy — please try again.' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'Compilation service unavailable. Please try again.', details: error.message },
      { status: 502 }
    )
  }
}
