import { apiRequest } from './client';
import type { UserRole } from './types';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  scope: 'PLATFORM' | 'ORG' | 'COHORT' | 'COURSE';
  orgId?: string | null;
  cohortId?: string | null;
  courseId?: string | null;
  targetRole?: UserRole | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  isRead?: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export function listAnnouncements(token: string) {
  return apiRequest<Announcement[]>('/announcements', { token });
}

export function getAnnouncementUnreadCount(token: string) {
  return apiRequest<number>('/announcements/unread-count', { token });
}

export function markAnnouncementRead(id: string, token: string) {
  return apiRequest<void>(`/announcements/${id}/read`, { token, method: 'POST' });
}

export function createAnnouncement(
  token: string,
  data: {
    title: string;
    content: string;
    scope?: string;
    orgId?: string;
    courseId?: string;
    cohortId?: string;
    targetRole?: UserRole;
    expiresAt?: string;
  },
) {
  return apiRequest<Announcement>('/announcements', {
    token,
    method: 'POST',
    body: JSON.stringify(data),
  });
}
