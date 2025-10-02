'use client';

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthToken } from "@/lib/auth";

/**
 * A component to store the Clerk auth token in localStorage
 */
export default function AuthTokenHandler() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  
  useEffect(() => {
    // Only proceed if auth is loaded and user is signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }
    
    const storeSessionToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
          console.log('Token refreshed and stored');
        } else {
          console.warn('No auth token received from Clerk');
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    
    // Immediately store the token when component mounts
    storeSessionToken();
    
    // Set up an interval to refresh the token more frequently
    // Clerk tokens typically expire after 1 hour, so refresh every 30 minutes
    const refreshInterval = setInterval(storeSessionToken, 30 * 60 * 1000); // every 30 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [getToken, isSignedIn, isLoaded]);
  
  // This component doesn't render anything visible
  return null;
}
