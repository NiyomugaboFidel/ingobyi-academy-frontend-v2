import { apiRequest } from './client';
import type { Paginated } from './types';
import { clampLimit, clampPage } from './pagination';

export type IssueReport = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  user?: { id: string; firstName: string; lastName: string; email: string };
};

export function submitReport(
  token: string,
  body: { type: string; title: string; description: string; metadata?: Record<string, unknown> },
) {
  return apiRequest<IssueReport>('/reports', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function listMyReports(token: string) {
  return apiRequest<IssueReport[]>('/reports/mine', { token });
}

export function listAllReports(token: string, page = 1, limit = 20, orgId?: string) {
  const qs = new URLSearchParams({
    page: String(clampPage(page)),
    limit: String(clampLimit(limit)),
  });
  if (orgId) qs.set('orgId', orgId);
  return apiRequest<Paginated<IssueReport>>(`/reports?${qs}`, { token });
}

export function resolveReport(id: string, token: string) {
  return apiRequest(`/reports/${id}/resolve`, { method: 'PATCH', token });
}

export function dismissReport(id: string, token: string) {
  return apiRequest(`/reports/${id}/dismiss`, { method: 'PATCH', token });
}
