'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/auth";

/**
 * A component that ensures the Clerk session token is available for API calls
 * Uses a long-lived token (24h expiry) to prevent frequent authentication issues
 * This should be placed near the root of your app
 */
export function ClerkSessionProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  // Store the session token in localStorage whenever it changes
  useEffect(() => {
    // Only proceed if auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }
    
    const storeSessionToken = async () => {
      try {
        // Request the long-lived token with 24h expiry
        const token = await getToken({ template: 'long_token' });
        if (token) {
          setAuthToken(token);
          console.log('Long-lived token successfully stored');
        } else {
          console.warn('No auth token received from Clerk');
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    
    // Immediately store the token when component mounts
    storeSessionToken();
    
    // Set up an interval to refresh the token
    // We're using a long-lived token with 24h expiry, so refresh every 12 hours
    const refreshInterval = setInterval(storeSessionToken, 12 * 60 * 60 * 1000); // every 12 hours
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [getToken, isSignedIn, isLoaded]);
  
  return <>{children}</>;
}
