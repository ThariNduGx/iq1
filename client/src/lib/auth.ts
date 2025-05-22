/**
 * Authentication utilities for OAuth 2.0 with PKCE
 * Used for secure authentication with ad platforms
 */

// Generate a random string for code verifier
export function generateCodeVerifier(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const values = new Uint8Array(length);
  
  // Generate random values
  window.crypto.getRandomValues(values);
  
  // Convert to string using the allowed charset
  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }
  
  return result;
}

// Convert string to base64 URL encoded string
function base64UrlEncode(str: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate code challenge from verifier using SHA-256
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  
  return base64UrlEncode(digest);
}

// Get OAuth state from URL after redirect
export function getOAuthStateFromUrl(): { code?: string, state?: string, error?: string } {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    code: urlParams.get('code') || undefined,
    state: urlParams.get('state') || undefined,
    error: urlParams.get('error') || undefined
  };
}

// Clear OAuth parameters from URL
export function clearOAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  
  window.history.replaceState({}, document.title, url.toString());
}

// Get PKCE code verifier from localStorage
export function getStoredCodeVerifier(platform: string): string | null {
  return localStorage.getItem(`${platform}_code_verifier`);
}

// Clear stored code verifier
export function clearStoredCodeVerifier(platform: string): void {
  localStorage.removeItem(`${platform}_code_verifier`);
}
