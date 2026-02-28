import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ApiLoaderProvider } from '@/components/ui/api-loader'
import { Toaster } from 'sonner'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'Resulyze | Open-Source AI Resume Optimizer',
  description: 'Optimize your resume for any job with AI. Open-source, bring your own API key. ATS optimization, cover letters, and interview prep.',
  keywords: 'resume optimizer, AI resume, ATS optimization, cover letter generator, interview preparation, open source',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.svg',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark'||(!localStorage.getItem('theme')&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}` }} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="min-h-screen bg-background font-body antialiased">
        <div className="flex min-h-screen flex-col">
          <ApiLoaderProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'font-body',
                style: { fontFamily: 'var(--font-body)' },
              }}
              richColors
              closeButton
            />
          </ApiLoaderProvider>
        </div>
      </body>
    </html>
  )
}
