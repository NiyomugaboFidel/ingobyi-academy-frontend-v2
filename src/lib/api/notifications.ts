import { apiRequest } from './client';
import type { Paginated } from './types';
import { clampLimit, clampPage } from './pagination';

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
};

export function listNotifications(
  token: string,
  params: { unreadOnly?: boolean; page?: number; limit?: number } = {},
) {
  const search = new URLSearchParams();
  search.set('page', String(clampPage(params.page)));
  search.set('limit', String(clampLimit(params.limit, 20)));
  if (params.unreadOnly) search.set('unread', 'true');
  return apiRequest<Paginated<AppNotification>>(`/notifications?${search.toString()}`, { token });
}

export function markNotificationRead(id: string, token: string) {
  return apiRequest<AppNotification>(`/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
}
