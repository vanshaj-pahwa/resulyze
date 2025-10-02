/**
 * Authentication utilities for token management and session handling
 */

/**
 * Retrieves the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem('clerk-session-token');
  } catch (error) {
    console.error('Error accessing auth token:', error);
    return null;
  }
}

/**
 * Stores the authentication token in localStorage
 * @param token The authentication token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('clerk-session-token', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
}

/**
 * Removes the authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('clerk-session-token');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Checks if the user has a valid authentication token
 * @returns True if the user has a token, false otherwise
 */
export function hasAuthToken(): boolean {
  return getAuthToken() !== null;
}