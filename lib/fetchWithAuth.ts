/**
 * Utility function for making authenticated API calls
 * This ensures that all requests include proper authentication headers
 */
import { getAuthToken, clearAuthToken } from './auth';

// For client-side use only
let apiLoader: {
  startLoading: () => void;
  stopLoading: () => void;
} | null = null;

// Function to set the API loader instance
export const setApiLoader = (loader: { startLoading: () => void; stopLoading: () => void }) => {
  apiLoader = loader;
};

/**
 * Make an authenticated API request
 * @param url The API endpoint to call
 * @param options Request options including method, body, etc.
 * @param showLoader Whether to show the global loader (defaults to true)
 * @returns Response from the API
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}, showLoader = true) {
  // Get auth token if available
  const authToken = getAuthToken() || '';

  // Set up headers
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Add auth token if available
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  // Include credentials to send cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  // Show loader if requested and available
  if (showLoader && typeof window !== 'undefined' && apiLoader) {
    apiLoader.startLoading();
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle 401 errors
    if (response.status === 401) {
      console.error('Authentication failed. User may need to log in again.');
      
      // Clear the expired token
      clearAuthToken();
      
      // If in client-side environment, redirect to sign-in
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
        // Redirect to sign-in if not already there
        window.location.href = '/sign-in';
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  } finally {
    // Hide loader if it was shown
    if (showLoader && typeof window !== 'undefined' && apiLoader) {
      apiLoader.stopLoading();
    }
  }
}
