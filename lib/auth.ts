const AUTH_SESSION_KEY = 'stego_authenticated';

/**
 * Check if the provided password matches the environment variable
 */
export function checkPassword(password: string): boolean {
  const correctPassword = process.env.NEXT_PUBLIC_SUBMIT_PASSWORD;
  return password === correctPassword;
}

/**
 * Check if the user is authenticated by checking sessionStorage
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
}

/**
 * Set authentication state in sessionStorage
 */
export function setAuthenticated(authenticated: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (authenticated) {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  }
}

/**
 * Clear authentication state
 */
export function logout(): void {
  setAuthenticated(false);
}
