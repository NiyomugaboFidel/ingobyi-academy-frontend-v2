'use client';

import { useEffect, type ReactNode } from 'react';
import { getMe } from '@/lib/api/auth';
import { refreshSession } from '@/lib/api/token-refresh';
import { applyAuthSession } from '@/lib/api/session';
import { accessTokenNeedsRefresh, getAccessTokenExpiryMs } from '@/lib/auth/jwt';
import { useAuthStore } from '@/lib/auth/store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    async function bootstrap() {
      if (accessToken) {
        try {
          const user = await getMe(accessToken);
          setAuth(accessToken, user);
          const { syncWorkspaceFromUser } = await import('@/lib/api/session');
          syncWorkspaceFromUser(user);
          return;
        } catch {
          /* access token may have expired — fall through to refresh cookie */
        }
      }
      try {
        const data = await refreshSession();
        applyAuthSession(data);
      } catch {
        clearAuth();
      }
    }
    bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Proactively refresh before the access token expires (keeps long learning sessions alive). */
  useEffect(() => {
    if (!accessToken) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleProactiveRefresh = () => {
      const exp = getAccessTokenExpiryMs(accessToken);
      if (!exp) return;

      const delay = Math.max(exp - Date.now() - 4 * 60 * 1000, 60_000);
      timeoutId = setTimeout(() => {
        void refreshSession().catch(() => undefined);
      }, delay);
    };

    scheduleProactiveRefresh();

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      const token = useAuthStore.getState().accessToken;
      if (token && accessTokenNeedsRefresh(token, 5 * 60 * 1000)) {
        void refreshSession().catch(() => undefined);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [accessToken]);

  return <>{children}</>;
}
