import { apiRequest } from './client';
import { fetchAllPages } from './pagination';
import type {
  Organization,
  Paginated,
  UserRole,
} from './types';

export type OrgMember = {
  id: string;
  userId: string;
  orgId: string;
  role: UserRole;
  status: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
};

export type MyMembership = {
  organizationId: string;
  role: UserRole;
  status: string;
  joinedAt: string;
  org: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    type?: string;
    isActive?: boolean;
  };
};

export type JoinRequest = {
  id: string;
  orgId: string;
  userId: string;
  requestedRole: UserRole;
  message?: string | null;
  status: string;
  createdAt: string;
  org?: Organization;
  userName?: string;
  userEmail?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
};

export type EnrichedJoinRequest = JoinRequest & {
  orgName: string;
};

export type OrgPermission = {
  id: string;
  orgId: string;
  role: UserRole;
  permission: string;
  granted: boolean;
};

// ── Memberships & directory ──────────────────────────────────────────

export function listMyMemberships(token: string) {
  return apiRequest<MyMembership[]>('/organizations/me', { token });
}

export function listOrganizations(token: string, page = 1, limit = 50) {
  return apiRequest<Paginated<Organization>>(
    `/organizations?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function listAllOrganizations(token: string) {
  return fetchAllPages((page, limit) => listOrganizations(token, page, limit));
}

export function listOrgDirectory(page = 1, limit = 50) {
  return apiRequest<Paginated<Organization>>(
    `/organizations/directory?page=${page}&limit=${limit}`,
  );
}

export async function listAllOrgDirectory() {
  return fetchAllPages((page, limit) => listOrgDirectory(page, limit));
}

export function getOrganizationBySlug(slug: string) {
  return apiRequest<Organization>(`/organizations/slug/${slug}`);
}

export function createOrganization(
  token: string,
  data: {
    name: string;
    type: string;
    description?: string;
    logoUrl?: string;
    country?: string;
    city?: string;
  },
) {
  return apiRequest<Organization>('/organizations', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function bootstrapOrganization(
  token: string,
  data: {
    name: string;
    type: string;
    description?: string;
    country?: string;
    city?: string;
  },
) {
  return apiRequest<Organization>('/organizations/bootstrap', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateOrganization(
  id: string,
  token: string,
  body: Partial<Organization>,
) {
  return apiRequest<Organization>(`/organizations/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export type CertificateSignatorySettings = {
  ceoName: string;
  ceoTitle: string;
  programLeaderName: string;
  programLeaderTitle: string;
  issuerOrgName: string;
};

export function getCertificateSettings(orgId: string, token: string) {
  return apiRequest<{
    orgId: string;
    orgName: string;
    issuerName: string;
    settings: CertificateSignatorySettings;
    defaults: CertificateSignatorySettings;
  }>(`/organizations/${orgId}/certificate-settings`, { token });
}

export function updateCertificateSettings(
  orgId: string,
  token: string,
  body: Partial<CertificateSignatorySettings>,
) {
  return apiRequest<{
    orgId: string;
    orgName: string;
    settings: CertificateSignatorySettings;
  }>(`/organizations/${orgId}/certificate-settings`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

// ── Members ──────────────────────────────────────────────────────────

export function listOrgMembers(orgId: string, token: string, page = 1, limit = 50) {
  return apiRequest<Paginated<OrgMember>>(
    `/organizations/${orgId}/members?page=${page}&limit=${limit}`,
    { token },
  );
}

export async function listAllOrgMembers(orgId: string, token: string) {
  return fetchAllPages((page, limit) => listOrgMembers(orgId, token, page, limit));
}

export function addOrgMember(
  orgId: string,
  token: string,
  email: string,
  role: UserRole,
) {
  return apiRequest<OrgMember>(`/organizations/${orgId}/members`, {
    method: 'POST',
    token,
    body: JSON.stringify({ email, role }),
  });
}

export function updateOrgMember(
  orgId: string,
  userId: string,
  token: string,
  role: UserRole,
) {
  return apiRequest(`/organizations/${orgId}/members/${userId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ role }),
  });
}

export function suspendOrgMember(orgId: string, userId: string, token: string) {
  return apiRequest(`/organizations/${orgId}/members/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export function inviteMember(
  orgId: string,
  token: string,
  email: string,
  role?: UserRole,
) {
  return apiRequest(`/organizations/${orgId}/invite`, {
    method: 'POST',
    token,
    body: JSON.stringify({ email, role }),
  });
}

export function redeemOrgInvite(token: string, inviteToken: string) {
  return apiRequest<{ message: string; organizationId: string }>(
    '/organizations/invites/redeem',
    {
      method: 'POST',
      token,
      body: JSON.stringify({ token: inviteToken }),
    },
  );
}

// ── Join requests ────────────────────────────────────────────────────

export function submitJoinRequest(
  token: string,
  data: {
    organizationId: string;
    requestedRole?: UserRole;
    message?: string;
  },
) {
  return apiRequest<JoinRequest>('/organizations/join-requests', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function requestJoinOrg(
  orgId: string,
  token: string,
  options?: { message?: string; requestedRole?: UserRole },
) {
  return apiRequest<JoinRequest>(`/organizations/${orgId}/join`, {
    method: 'POST',
    token,
    body: JSON.stringify(options ?? {}),
  });
}

export function listMyJoinRequests(token: string) {
  return apiRequest<JoinRequest[]>('/organizations/my-join-requests', { token });
}

export function listOrgJoinRequests(orgId: string, token: string) {
  return apiRequest<JoinRequest[]>(`/organizations/${orgId}/join-requests`, {
    token,
  });
}

export function reviewJoinRequest(
  orgId: string,
  reqId: string,
  token: string,
  data: {
    status: 'APPROVED' | 'REJECTED';
    approvedRole?: UserRole;
  },
) {
  return apiRequest<{ message: string }>(
    `/organizations/${orgId}/join-requests/${reqId}`,
    {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    },
  );
}

// ── Permissions ────────────────────────────────────────────────────────

export function getOrgPermissions(orgId: string, token: string) {
  return apiRequest<OrgPermission[]>(`/organizations/${orgId}/permissions`, {
    token,
  });
}

export function updateOrgPermissions(
  orgId: string,
  token: string,
  permissions: Array<{ role: UserRole; permission: string; granted: boolean }>,
) {
  return apiRequest<OrgPermission[]>(`/organizations/${orgId}/permissions`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ permissions }),
  });
}
