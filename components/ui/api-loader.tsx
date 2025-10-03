'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Loader2 } from 'lucide-react'
import { setApiLoader } from '@/lib/fetchWithAuth'

interface ApiLoaderContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
  pendingRequests: number
}

// Create context with default values
const ApiLoaderContext = createContext<ApiLoaderContextType>({
  isLoading: false,
  setLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  pendingRequests: 0
})

// Hook to use the API loader
export const useApiLoader = () => useContext(ApiLoaderContext)

// Provider component to wrap application with
export function ApiLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null)
  
  // Minimum display time to avoid flickering for quick requests (300ms)
  const MIN_LOADING_TIME = 300

  const startLoading = () => {
    setPendingRequests(prev => prev + 1)
    
    // Clear any existing timeout
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      setLoadingTimer(null)
    }
    
    // Show loading immediately
    setIsLoading(true)
  }

  const stopLoading = () => {
    setPendingRequests(prev => Math.max(0, prev - 1))
  }

  // Effect to handle pending requests
  useEffect(() => {
    if (pendingRequests > 0) {
      setIsLoading(true)
    } else {
      // When no more requests are pending, set a minimum display time
      // to avoid flickering for quick consecutive requests
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, MIN_LOADING_TIME)
      
      setLoadingTimer(timer)
      return () => clearTimeout(timer)
    }
  }, [pendingRequests])

  // Register with fetchWithAuth utility
  useEffect(() => {
    const loader = { startLoading, stopLoading };
    setApiLoader(loader)
    // Clean up by passing a null-safe object when unmounting
    return () => setApiLoader({ startLoading: () => {}, stopLoading: () => {} })
  }, [startLoading, stopLoading])

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
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="relative h-24 w-24 mb-4 flex items-center justify-center">
              {/* R logo with gradient animation */}
              <svg 
                width="90" 
                height="90" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-md"
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feFlood floodColor="#3b82f6" floodOpacity="0.3" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
                    <feComposite in="SourceGraphic" in2="coloredBlur" operator="over" />
                  </filter>
                  
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6">
                      <animate attributeName="stop-color" 
                        values="#3b82f6; #4f46e5; #3b82f6" 
                        dur="3s" 
                        repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#8b5cf6">
                      <animate attributeName="stop-color" 
                        values="#8b5cf6; #c026d3; #8b5cf6" 
                        dur="3s" 
                        repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                  
                  {/* Create text path for animation */}
                  <path id="textPath" d="M0,0" />
                </defs>
                
                {/* R lettermark spinner animation using Arial Bold font */}
                <text 
                  x="29" 
                  y="75" 
                  fontFamily="Arial-BoldMT, Arial" 
                  fontWeight="bold" 
                  fontSize="70"
                  stroke="url(#logoGradient)"
                  strokeWidth="1.5"
                  fill="transparent"
                  filter="url(#glow)"
                  className="animate-lettermark-spinner"
                >
                  R
                </text>
              </svg>
            </div>
          </div>
      )}
    </ApiLoaderContext.Provider>
  )
}