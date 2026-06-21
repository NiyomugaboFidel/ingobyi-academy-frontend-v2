import type { User } from '@/lib/api/types';
import { getPostAuthRedirect } from '@/lib/auth/store';

/** Accept only same-app relative paths (prevents open redirects). */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = raw.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  if (path.includes('://')) return null;
  return path;
}

export function resolvePostAuthRedirect(
  user: User,
  redirectParam?: string | null,
): string {
  const sanitized = sanitizeRedirectPath(redirectParam);
  if (sanitized) return sanitized;
  return getPostAuthRedirect(user);
}

export function redirectPathLabel(path: string): string {
  if (path.startsWith('/catalog/')) return 'the course page';
  if (path.startsWith('/student/learn')) return 'your course';
  if (path.startsWith('/student/')) return 'your learning space';
  if (path.startsWith('/search')) return 'search results';
  return 'where you left off';
}
