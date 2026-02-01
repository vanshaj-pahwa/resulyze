import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ApiLoaderProvider } from '@/components/ui/api-loader'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'Resulyze | AI-Powered Resume Builder & ATS Optimizer',
  description: 'Create ATS-optimized resumes, cover letters and prepare for interviews with AI assistance. Land your dream job faster with Resulyze.',
  keywords: 'resume builder, AI resume, ATS optimization, cover letter generator, job application, interview preparation',
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
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="min-h-screen bg-background font-body antialiased">
        <div className="flex min-h-screen flex-col">
          <ApiLoaderProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ApiLoaderProvider>
        </div>
      </body>
    </html>
  )
}
