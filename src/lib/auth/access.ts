import type { UserRole } from '@/lib/api/types';

/** Superadmin has unrestricted access to every dashboard route. */
export function canAccessDashboard(
  role: UserRole,
  allowedRoles?: UserRole[],
): boolean {
  if (role === 'SUPERADMIN') return true;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

export const SUPERADMIN_FULL_NAV = true;
