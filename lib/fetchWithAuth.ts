/**
 * Utility function for making authenticated API calls
 * This ensures that all requests include proper authentication headers
 */
import { getAuthToken, clearAuthToken } from './auth';

/**
 * Make an authenticated API request
 * @param url The API endpoint to call
 * @param options Request options including method, body, etc.
 * @returns Response from the API
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
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
  }
}
