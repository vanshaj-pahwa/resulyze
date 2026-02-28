'use client'

import { useState, useEffect } from 'react'
import { WifiOff, CloudOff } from 'lucide-react'

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [dbConnected, setDbConnected] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const checkDbConnection = async () => {
      try {
        const response = await fetch('/api/health', { method: 'HEAD' })
        setDbConnected(response.ok)
      } catch {
        setDbConnected(false)
      }
    }

    checkDbConnection()
    const interval = setInterval(checkDbConnection, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (isOnline && dbConnected) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-card text-sm text-zinc-700 dark:text-zinc-300">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline - Changes saved locally</span>
          </>
        ) : !dbConnected ? (
          <>
            <CloudOff className="w-4 h-4" />
            <span>Database offline - Using local storage</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
