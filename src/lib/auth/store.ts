'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/api/types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAuth: (accessToken, user) => set({ accessToken, user }),
      clearAuth: () => set({ accessToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken && !!get().user,
    }),
    { name: 'ia_auth_v2' },
  ),
);

export function getEffectiveRole(
  user: Pick<User, 'platformRole' | 'memberships' | 'activeOrgId' | 'activeOrgRole'>,
  activeOrgId?: string | null,
): User['platformRole'] {
  if (user.platformRole === 'SUPERADMIN') return 'SUPERADMIN';

  const orgId = activeOrgId ?? user.activeOrgId;
  if (orgId) {
    const membership = user.memberships?.find(
      (m) => m.org.id === orgId || m.orgId === orgId,
    );
    if (membership) return membership.role;
    if (user.activeOrgRole) return user.activeOrgRole;
  }

  const priority: User['platformRole'][] = ['ADMIN', 'TRAINER', 'PARENT', 'STUDENT'];
  for (const role of priority) {
    if (user.memberships?.some((m) => m.role === role)) return role;
  }
  return user.platformRole;
}

export function hasActiveMembership(
  user: Pick<User, 'platformRole' | 'memberships'>,
): boolean {
  if (user.platformRole === 'SUPERADMIN') return true;
  return (
    user.memberships?.some((m) => m.status !== 'SUSPENDED') ?? false
  );
}

export function needsOnboarding(
  user: Pick<User, 'platformRole' | 'memberships'>,
): boolean {
  return !hasActiveMembership(user);
}

export function getRoleHome(
  roleOrUser: string | Pick<User, 'platformRole' | 'memberships'>,
): string {
  const role =
    typeof roleOrUser === 'string' ? roleOrUser : getEffectiveRole(roleOrUser);
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TRAINER':
      return '/trainer/dashboard';
    case 'PARENT':
      return '/parent/dashboard';
    default:
      return '/student/dashboard';
  }
}

/** Where to send the user right after login or email verification. */
export function getPostAuthRedirect(user: User): string {
  if (needsOnboarding(user)) return '/onboarding';
  return getRoleHome(user);
}
