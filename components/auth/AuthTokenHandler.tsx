'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * A component to store the Clerk auth token in localStorage
 */
export default function AuthTokenHandler() {
  const { getToken } = useAuth();
  
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
  
  // This component doesn't render anything visible
  return null;
}
