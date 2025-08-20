export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};
export const getUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_id');
  }
  return null;
};
export const isAccessTokenExpired = (): boolean => {
  if (typeof window !== 'undefined') {
    const exp = localStorage.getItem('access_token_exp');
    if (!exp) return true; // treat as expired if no expiry info
    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds >= parseInt(exp, 10);
  }
  return true; // treat as expired if not in browser
};
export const setAccessToken = (token: string, expiresAtSeconds: number): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
    localStorage.setItem('access_token_exp', String(expiresAtSeconds));
  }
};
export const clearAccessToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_exp');
  }
};
