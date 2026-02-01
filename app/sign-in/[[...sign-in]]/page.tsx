import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Page() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-heading font-bold">R</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Resulyze</h1>
          </div>
          <p className="text-gray-600">Welcome back! Sign in to continue optimizing your career.</p>
        </div>
        <div className="glass-card rounded-xl p-8">
          <p className="text-center text-gray-500 mb-6">Sign-in functionality has been disabled.</p>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold gap-2">
              Return Home
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
