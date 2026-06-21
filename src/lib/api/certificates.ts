import { apiRequest, apiUrl, ApiError } from './client';
import type { Paginated } from './types';

export type Certificate = {
  id: string;
  verifyCode: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  pdfUrl?: string | null;
  course?: { title: string; slug: string; thumbnailUrl?: string | null };
};

export type CertificateRequest = {
  id: string;
  userId: string;
  courseId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string | null;
  reviewNote?: string | null;
  requestedAt: string;
  reviewedAt?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
    org?: { id: string; name: string };
  };
};

export function listMyCertificates(token: string) {
  return apiRequest<Certificate[]>('/certificates/mine', { token });
}

export function getCertificateRequestStatus(courseId: string, token: string) {
  return apiRequest<{
    request: CertificateRequest | null;
    certificate: Certificate | null;
  }>(`/certificates/request/${courseId}`, { token });
}

export function requestCertificate(courseId: string, token: string, message?: string) {
  return apiRequest<CertificateRequest>(`/certificates/request/${courseId}`, {
    method: 'POST',
    token,
    body: JSON.stringify({ message }),
  });
}

export function listCertificateRequests(
  token: string,
  page = 1,
  limit = 20,
  opts?: { orgId?: string; status?: string },
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (opts?.orgId) qs.set('orgId', opts.orgId);
  if (opts?.status) qs.set('status', opts.status);
  return apiRequest<Paginated<CertificateRequest>>(`/certificates/requests?${qs}`, { token });
}

export function approveCertificateRequest(id: string, token: string) {
  return apiRequest(`/certificates/requests/${id}/approve`, {
    method: 'POST',
    token,
  });
}

export function rejectCertificateRequest(id: string, token: string, reviewNote?: string) {
  return apiRequest(`/certificates/requests/${id}/reject`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reviewNote }),
  });
}

export type CertificateVerification = {
  valid: boolean;
  verifyCode: string;
  issuedAt: string;
  userId: string;
  learner: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
  };
  course: {
    title: string;
    slug: string;
  };
  profileUrl: string;
  verifyUrl: string;
  issuedBy: string;
};

export function verifyCertificate(code: string) {
  return apiRequest<CertificateVerification>(`/certificates/verify/${encodeURIComponent(code)}`);
}

export async function downloadCertificatePdf(
  certificateId: string,
  token: string,
  suggestedFilename: string,
): Promise<void> {
  const res = await fetch(apiUrl(`/certificates/download/${certificateId}`), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    throw new ApiError(json.message || 'Failed to download certificate', res.status);
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? suggestedFilename;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
