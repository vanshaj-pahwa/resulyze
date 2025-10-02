'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * A component that ensures the Clerk session token is available for API calls
 * This should be placed near the root of your app
 */
export function ClerkSessionProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  
  // Store the session token in localStorage whenever it changes
  useEffect(() => {
    const storeSessionToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          localStorage.setItem('clerk-session-token', token);
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    
    storeSessionToken();
    
    // Set up an interval to refresh the token periodically
    const refreshInterval = setInterval(storeSessionToken, 5 * 60 * 1000); // every 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [getToken]);
  
  return <>{children}</>;
}
