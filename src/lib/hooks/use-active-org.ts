'use client';

import { getEffectiveRole, useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import type { UserRole } from '@/lib/api/types';

/** Resolve active workspace from JWT-backed user + persisted org store. */
export function useActiveOrg() {
  const user = useAuthStore((s) => s.user);
  const storeOrgId = useOrgStore((s) => s.activeOrgId);

  const orgId =
    storeOrgId ?? user?.activeOrgId ?? user?.memberships?.[0]?.org?.id ?? undefined;

  const membership =
    user?.memberships?.find((m) => m.org.id === orgId) ?? user?.memberships?.[0];

  const effectiveRole: UserRole | null = user
    ? getEffectiveRole(user, orgId)
    : null;

  return {
    orgId,
    orgName: membership?.org?.name,
    orgSlug: membership?.org?.slug,
    orgRole: membership?.role ?? user?.activeOrgRole,
    effectiveRole: effectiveRole ?? undefined,
    membership,
    user,
  };
}
