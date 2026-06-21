import { apiRequest } from './client';
import type { UserRole } from './types';

export interface MessagingUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  platformRole?: UserRole;
  lastSeenAt?: string | null;
  contactLabel?: string;
}

export interface MessageAttachment {
  id: string;
  url: string;
  mimeType: string;
  filename: string;
  size?: number | null;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user?: MessagingUser;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  plainText: string;
  replyToId?: string | null;
  threadRootId?: string | null;
  threadCount?: number;
  isPinned?: boolean;
  isAnnouncement?: boolean;
  editedAt?: string | null;
  createdAt: string;
  sender: MessagingUser;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  replyTo?: { id: string; plainText: string; sender: MessagingUser } | null;
}

export interface ThreadResponse {
  root: Message | null;
  replies: Message[];
}

export interface SharedAttachment extends MessageAttachment {
  message: {
    id: string;
    createdAt: string;
    sender: MessagingUser;
  };
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'COURSE_ROOM';
  title: string;
  courseId?: string | null;
  course?: { id: string; title: string; slug: string; thumbnailUrl?: string | null } | null;
  otherUser?: MessagingUser | null;
  participants: MessagingUser[];
  lastMessage?: {
    id: string;
    plainText: string;
    content: string;
    createdAt: string;
    senderId: string;
    sender: MessagingUser;
    isAnnouncement?: boolean;
  } | null;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  isStarred: boolean;
  typingUsers: string[];
  updatedAt: string;
}

export interface SendMessagePayload {
  content: string;
  plainText?: string;
  replyToId?: string;
  threadRootId?: string;
  isAnnouncement?: boolean;
  mentionIds?: string[];
  attachments?: Array<{ url: string; mimeType: string; filename: string; size?: number }>;
}

export interface PresenceInfo {
  userId: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeenAt?: string | null;
}

export function listConversations(token: string, filter?: 'archived' | 'starred' | 'all') {
  const qs = filter ? `?filter=${filter}` : '';
  return apiRequest<Conversation[]>(`/messaging/conversations${qs}`, { token });
}

export function getConversation(id: string, token: string) {
  return apiRequest<Conversation>(`/messaging/conversations/${id}`, { token });
}

export function createDirectConversation(userId: string, token: string) {
  return apiRequest<Conversation>(`/messaging/conversations/direct/${userId}`, {
    token,
    method: 'POST',
  });
}

export function listMessages(conversationId: string, token: string, cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiRequest<Message[]>(`/messaging/conversations/${conversationId}/messages${qs}`, { token });
}

export function sendMessage(conversationId: string, token: string, payload: SendMessagePayload) {
  return apiRequest<Message>(`/messaging/conversations/${conversationId}/messages`, {
    token,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function editMessage(messageId: string, token: string, content: string, plainText?: string) {
  return apiRequest<Message>(`/messaging/messages/${messageId}`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ content, plainText }),
  });
}

export function deleteMessage(messageId: string, token: string) {
  return apiRequest<void>(`/messaging/messages/${messageId}`, { token, method: 'DELETE' });
}

export function reactToMessage(messageId: string, token: string, emoji: string) {
  return apiRequest<MessageReaction>(`/messaging/messages/${messageId}/react`, {
    token,
    method: 'POST',
    body: JSON.stringify({ emoji }),
  });
}

export function markConversationRead(conversationId: string, token: string, messageId?: string) {
  const qs = messageId ? `?messageId=${messageId}` : '';
  return apiRequest<{ read: number }>(`/messaging/conversations/${conversationId}/read${qs}`, {
    token,
    method: 'POST',
  });
}

export function getUnreadCount(token: string) {
  return apiRequest<number>('/messaging/unread-count', { token });
}

export function searchMessages(token: string, q: string) {
  return apiRequest<Message[]>(`/messaging/search?q=${encodeURIComponent(q)}`, { token });
}

export function getContacts(token: string) {
  return apiRequest<MessagingUser[]>('/messaging/contacts', { token });
}

export function getPresence(token: string, userIds: string[]) {
  if (!userIds.length) return Promise.resolve([] as PresenceInfo[]);
  return apiRequest<PresenceInfo[]>(`/messaging/presence?ids=${userIds.join(',')}`, { token });
}

export interface PresenceStats {
  online: number;
  away: number;
  total: number;
}

export function getPresenceStats(token: string, orgId?: string) {
  const q = orgId ? `?orgId=${encodeURIComponent(orgId)}` : '';
  return apiRequest<PresenceStats>(`/messaging/presence/stats${q}`, { token });
}

export function archiveConversation(id: string, token: string, archived: boolean) {
  return apiRequest<void>(`/messaging/conversations/${id}/archive`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ archived }),
  });
}

export function starConversation(id: string, token: string, starred: boolean) {
  return apiRequest<void>(`/messaging/conversations/${id}/star`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ starred }),
  });
}

export function muteConversation(id: string, token: string, muted: boolean) {
  return apiRequest<void>(`/messaging/conversations/${id}/mute`, {
    token,
    method: 'PATCH',
    body: JSON.stringify({ muted }),
  });
}

export function pinMessage(conversationId: string, messageId: string, token: string) {
  return apiRequest<Message>(`/messaging/conversations/${conversationId}/pin/${messageId}`, {
    token,
    method: 'POST',
  });
}

export function getPinnedMessages(conversationId: string, token: string) {
  return apiRequest<Message[]>(`/messaging/conversations/${conversationId}/pinned`, { token });
}

export function getCourseConversation(courseId: string, token: string) {
  return apiRequest<Conversation>(`/messaging/courses/${courseId}/conversation`, { token });
}

export function getThreadReplies(messageId: string, token: string) {
  return apiRequest<ThreadResponse>(`/messaging/messages/${messageId}/thread`, { token });
}

export function getSharedAttachments(conversationId: string, token: string) {
  return apiRequest<SharedAttachment[]>(`/messaging/conversations/${conversationId}/attachments`, { token });
}
