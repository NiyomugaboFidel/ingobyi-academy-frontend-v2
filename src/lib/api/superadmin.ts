import { apiRequest } from './client';
import { fetchAllPages } from './pagination';
import {
  listOrgJoinRequests,
  reviewJoinRequest,
  type EnrichedJoinRequest,
  type JoinRequest,
} from './organizations';
import type { PlatformStats } from './analytics';
import { getPlatformStats } from './analytics';
import type { Paginated } from './types';
import type { UserRole } from './types';

export type SuperadminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  platformRole: string;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
};

export type SuperadminOrg = {
  id: string;
  name: string;
  slug: string;
  type: string;
  createdAt?: string;
};

export type PendingCourse = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type?: string;
  level?: string;
  createdAt: string;
  org?: { name: string };
  category?: { name: string };
};

export type CourseCategory = {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
};

/** @deprecated Use `JoinRequest` from organizations.ts */
export type OrgJoinRequest = JoinRequest;

export { listOrgJoinRequests, reviewJoinRequest };
export type { EnrichedJoinRequest };

export function listSuperadminUsers(token: string, page = 1, limit = 50) {
  return apiRequest<Paginated<SuperadminUser>>(
    `/superadmin/users?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function listAllSuperadminUsers(token: string) {
  return fetchAllPages((page, limit) => listSuperadminUsers(token, page, limit));
}

export function listSuperadminOrgs(token: string, page = 1, limit = 50) {
  return apiRequest<Paginated<SuperadminOrg>>(
    `/superadmin/orgs?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function listAllSuperadminOrgs(token: string) {
  return fetchAllPages((page, limit) => listSuperadminOrgs(token, page, limit));
}

export function activateUser(id: string, token: string) {
  return apiRequest(`/superadmin/users/${id}/activate`, { method: 'PATCH', token });
}

export function deactivateUser(id: string, token: string) {
  return apiRequest(`/superadmin/users/${id}/deactivate`, { method: 'PATCH', token });
}

export function createPlatformUser(
  token: string,
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    platformRole?: UserRole;
    organizationId?: string;
    orgRole?: UserRole;
  },
) {
  return apiRequest<SuperadminUser>('/superadmin/users', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function updatePlatformUser(
  id: string,
  token: string,
  payload: {
    firstName?: string;
    lastName?: string;
    platformRole?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
    password?: string;
  },
) {
  return apiRequest<SuperadminUser>(`/superadmin/users/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export function revokeUserSessions(id: string, token: string) {
  return apiRequest<{ message: string }>(`/superadmin/users/${id}/revoke-sessions`, {
    method: 'POST',
    token,
  });
}

export function listPendingCourses(token: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<Paginated<PendingCourse>>(`/superadmin/courses/pending?${qs}`, { token });
}

export function approveCourse(id: string, token: string) {
  return apiRequest(`/superadmin/courses/${id}/approve`, { method: 'POST', token });
}

export function rejectCourse(id: string, token: string) {
  return apiRequest(`/superadmin/courses/${id}/reject`, { method: 'POST', token });
}

export function getSuperadminStats(token: string) {
  return apiRequest<PlatformStats>('/superadmin/stats', { token });
}

export async function getPlatformStatsSafe(token: string): Promise<PlatformStats> {
  try {
    return await getSuperadminStats(token);
  } catch {
    return getPlatformStats(token);
  }
}

export function listCategories() {
  return apiRequest<CourseCategory[]>('/catalog/categories');
}

export async function listAllJoinRequests(token: string): Promise<EnrichedJoinRequest[]> {
  const orgs = await listAllSuperadminOrgs(token);
  const results = await Promise.all(
    orgs.map(async (org) => {
      try {
        const reqs = await listOrgJoinRequests(org.id, token);
        return reqs.map((r) => ({
          ...r,
          orgName: org.name,
          userName:
            r.userName ??
            (r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Unknown user'),
          userEmail: r.userEmail ?? r.user?.email ?? '—',
        }));
      } catch {
        return [];
      }
    }),
  );
  return results.flat().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
