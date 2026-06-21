/** Decode JWT `exp` (seconds) without verifying signature — client-side scheduling only. */
export function getAccessTokenExpiryMs(token: string): number | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function accessTokenNeedsRefresh(
  token: string,
  bufferMs = 3 * 60 * 1000,
): boolean {
  const exp = getAccessTokenExpiryMs(token);
  if (!exp) return true;
  return Date.now() >= exp - bufferMs;
}
