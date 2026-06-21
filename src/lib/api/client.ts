import { ApiError } from './api-error';
import { API_BASE, apiUrl } from './api-url';
import { refreshSession } from './token-refresh';
import { resolveApiErrorMessage } from './errors';
import { useAuthStore } from '@/lib/auth/store';
import type { ApiResponse } from './types';

export { ApiError } from './api-error';
export { API_BASE, apiUrl } from './api-url';

type ApiRequestOptions = RequestInit & {
  token?: string | null;
  /** Internal: prevent infinite retry loops on 401. */
  _authRetried?: boolean;
  /** Skip silent refresh (e.g. login failures). */
  skipAuthRetry?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, _authRetried, skipAuthRetry, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch {
    throw new ApiError(
      'Unable to reach the server. Check your connection and try again.',
      0,
    );
  }

  const json = (await res.json().catch(() => ({}))) as ApiResponse<T> & {
    message?: string;
    statusCode?: number;
  };

  const status = json.statusCode || res.status;

  if (
    status === 401 &&
    !skipAuthRetry &&
    !_authRetried &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/register') &&
    !path.includes('/auth/refresh')
  ) {
    try {
      const refreshed = await refreshSession();
      return apiRequest<T>(path, {
        ...options,
        token: refreshed.accessToken,
        _authRetried: true,
      });
    } catch {
      useAuthStore.getState().clearAuth();
    }
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(resolveApiErrorMessage(json.message, status), status);
  }

  return json.data;
}
