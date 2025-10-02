/**
 * Utility function for making authenticated API calls
 * This ensures that all requests include proper authentication headers
 */

/**
 * Make an authenticated API request
 * @param url The API endpoint to call
 * @param options Request options including method, body, etc.
 * @returns Response from the API
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get auth token if available
  let authToken = '';
  
  try {
    // Try to get token from localStorage if in browser environment
    if (typeof window !== 'undefined') {
      // Check for Clerk session token
      const sessionToken = localStorage.getItem('clerk-session-token');
      if (sessionToken) {
        authToken = sessionToken;
      }
    }
  } catch (error) {
    console.error('Error accessing auth token:', error);
  }

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
      // You could redirect to login page or refresh auth token here
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
