'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

interface ApiLoaderContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
  pendingRequests: number
}

const ApiLoaderContext = createContext<ApiLoaderContextType>({
  isLoading: false,
  setLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  pendingRequests: 0
})

export const useApiLoader = () => useContext(ApiLoaderContext)

export function ApiLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)

  const MIN_LOADING_TIME = 300

  const startLoading = useCallback(() => {
    setPendingRequests(prev => prev + 1)
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setPendingRequests(prev => Math.max(0, prev - 1))
  }, [])

  useEffect(() => {
    if (pendingRequests > 0) {
      setIsLoading(true)
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, MIN_LOADING_TIME)
      return () => clearTimeout(timer)
    }
  }, [pendingRequests])

  return (
    <ApiLoaderContext.Provider
      value={{
        isLoading,
        setLoading: setIsLoading,
        startLoading,
        stopLoading,
        pendingRequests
      }}
    >
      {children}

      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full w-1/3 bg-zinc-900 dark:bg-zinc-100 animate-loading-bar" />
        </div>
      )}
    </ApiLoaderContext.Provider>
  )
}
