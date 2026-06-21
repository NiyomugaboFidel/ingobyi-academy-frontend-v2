import { useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import type { AuthTokens, User } from './types';

/** Sync Zustand org store from user / token workspace fields. */
export function syncWorkspaceFromUser(
  user: Pick<User, 'activeOrgId'> | null | undefined,
  explicitOrgId?: string | null,
) {
  const orgId = explicitOrgId ?? user?.activeOrgId;
  if (orgId) {
    useOrgStore.getState().setActiveOrgId(orgId);
  }
}

/** Apply login / refresh / switch-org response to auth + org stores. */
export function applyAuthSession(tokens: AuthTokens) {
  const user: User = {
    ...tokens.user,
    activeOrgId: tokens.activeOrgId ?? tokens.user.activeOrgId ?? null,
    activeOrgRole: tokens.activeOrgRole ?? tokens.user.activeOrgRole ?? null,
  };
  useAuthStore.getState().setAuth(tokens.accessToken, user);
  syncWorkspaceFromUser(user, tokens.activeOrgId);
}
