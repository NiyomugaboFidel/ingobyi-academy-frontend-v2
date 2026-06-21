import { apiRequest } from './client';

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender?: ChatUser;
  replyToId?: string | null;
}

export interface CourseChatRoom {
  id: string;
  courseId: string;
  messages: ChatMessage[];
}

export interface DirectMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  readAt?: string | null;
}

export function getCourseChatRoom(courseId: string, token: string) {
  return apiRequest<CourseChatRoom>(`/chat/rooms/${courseId}`, { token });
}

export function getCourseChatHistory(courseId: string, token: string, cursor?: string) {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return apiRequest<ChatMessage[]>(`/chat/rooms/${courseId}/history${qs}`, { token });
}

export function getDirectInbox(token: string) {
  return apiRequest<DirectMessage[]>('/chat/direct', { token });
}

export function getDirectThread(userId: string, token: string) {
  return apiRequest<DirectMessage[]>(`/chat/direct/${userId}`, { token });
}
