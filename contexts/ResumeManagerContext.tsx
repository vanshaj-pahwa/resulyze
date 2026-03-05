'use client'

import { createContext, useContext } from 'react'
import { useResumeManager, type ResumeManager } from '@/hooks/useResumeManager'

const ResumeManagerContext = createContext<ResumeManager | null>(null)

export function ResumeManagerProvider({ children }: { children: React.ReactNode }) {
  const manager = useResumeManager()
  return (
    <ResumeManagerContext.Provider value={manager}>
      {children}
    </ResumeManagerContext.Provider>
  )
}

export function useResumeManagerContext(): ResumeManager {
  const ctx = useContext(ResumeManagerContext)
  if (!ctx) throw new Error('useResumeManagerContext must be used within a ResumeManagerProvider')
  return ctx
}
