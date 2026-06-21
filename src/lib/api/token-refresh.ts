import { apiUrl } from './api-url';
import { ApiError } from './api-error';
import { resolveApiErrorMessage } from './errors';
import { applyAuthSession } from './session';
import type { ApiResponse, AuthTokens } from './types';

let refreshInflight: Promise<AuthTokens> | null = null;

/** Rotate refresh cookie and update the in-memory access token (deduped across tabs/requests). */
export async function refreshSession(): Promise<AuthTokens> {
  if (refreshInflight) return refreshInflight;

  refreshInflight = (async () => {
    let res: Response;
    try {
      res = await fetch(apiUrl('/auth/refresh'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      throw new ApiError(
        'Unable to reach the server. Check your connection and try again.',
        0,
      );
    }

    const json = (await res.json().catch(() => ({}))) as ApiResponse<AuthTokens> & {
      message?: string;
      statusCode?: number;
    };

    if (!res.ok || json.success === false) {
      throw new ApiError(
        json.message || 'Your session has expired. Please sign in again.',
        json.statusCode || res.status,
      );
    }

    applyAuthSession(json.data);
    return json.data;
  })().finally(() => {
    refreshInflight = null;
  });

  return refreshInflight;
}
