'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react'

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [dbConnected, setDbConnected] = useState(true)

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check database connection periodically
    const checkDbConnection = async () => {
      try {
        const response = await fetch('/api/health', { method: 'HEAD' })
        setDbConnected(response.ok)
      } catch (error) {
        setDbConnected(false)
      }
    }

    checkDbConnection()
    const interval = setInterval(checkDbConnection, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (isOnline && dbConnected) {
    return null // Don't show anything when everything is working
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg shadow-lg">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Offline - Changes saved locally</span>
          </>
        ) : !dbConnected ? (
          <>
            <CloudOff className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Database offline - Using local storage</span>
          </>
        ) : null}
      </div>
    </div>
  )
}