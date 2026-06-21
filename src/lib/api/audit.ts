import { apiRequest } from './client';
import type { Paginated } from './types';

export type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  orgId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export function listAuditLogs(
  token: string,
  params: { page?: number; limit?: number; orgId?: string } = {},
) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.orgId) search.set('orgId', params.orgId);
  const qs = search.toString();
  return apiRequest<Paginated<AuditLogEntry>>(
    `/audit${qs ? `?${qs}` : ''}`,
    { token },
  );
}
