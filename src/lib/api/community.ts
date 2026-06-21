import { apiRequest } from './client';
import type { Paginated, UserRole } from './types';
import type { UnifiedAchievement } from './achievements';
import { clampLimit, clampPage } from './pagination';

export type CommunityUserStats = {
  coursesCompleted: number;
  certificatesEarned: number;
  achievementPoints: number;
  reviewsWritten: number;
  trainerRating: number | null;
  trainerReviewCount: number;
};

export type CommunityAuthor = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  platformRole?: UserRole;
  displayRole?: UserRole;
  isVerified?: boolean;
  stats?: CommunityUserStats | null;
  isFollowing?: boolean;
  followerCount?: number;
  mutualCount?: number;
  suggestionReason?: string;
};

export type CommunityPost = {
  id: string;
  content: string;
  orgId?: string | null;
  likesCount: number;
  isPinned: boolean;
  createdAt: string;
  author: CommunityAuthor;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: CommunityAuthor;
  }>;
};

export type CommunityProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  createdAt?: string;
  platformRole?: UserRole;
  displayRole?: UserRole;
  isVerified?: boolean;
  stats?: CommunityUserStats;
  posts: CommunityPost[];
  achievements: UnifiedAchievement[];
  followers: Array<{ followerId: string }>;
  following: Array<{ followingId: string }>;
  followerUsers?: CommunityAuthor[];
  followingUsers?: CommunityAuthor[];
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
};

export function getCommunityFeed(token?: string | null, params: { orgId?: string; page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  if (params.orgId) search.set('orgId', params.orgId);
  search.set('page', String(clampPage(params.page)));
  search.set('limit', String(clampLimit(params.limit, 20)));
  const qs = search.toString();
  return apiRequest<Paginated<CommunityPost>>(`/community/feed?${qs}`, { token });
}

export function createCommunityPost(token: string, body: { content: string; orgId?: string }) {
  return apiRequest<CommunityPost>('/community/posts', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function likeCommunityPost(postId: string, token: string) {
  return apiRequest(`/community/posts/${postId}/like`, { method: 'POST', token });
}

export function commentOnPost(postId: string, token: string, content: string) {
  return apiRequest(`/community/posts/${postId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ content }),
  });
}

export function toggleFollow(userId: string, token: string) {
  return apiRequest<{ following: boolean }>(`/community/follow/${userId}`, {
    method: 'POST',
    token,
  });
}

export function getCommunityLeaderboard(token?: string | null) {
  return apiRequest<Array<{ user?: CommunityAuthor; points: number }>>('/community/leaderboard', { token });
}

export function getCommunityProfile(userId: string, token?: string | null) {
  return apiRequest<CommunityProfile>(`/community/${userId}/profile`, { token });
}

export function searchCommunityUsers(token: string, q: string, limit = 20) {
  const qs = new URLSearchParams({ q, limit: String(limit) });
  return apiRequest<CommunityAuthor[]>(`/community/search?${qs}`, { token });
}

export function sharePostOnLinkedIn(postUrl: string, text: string) {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}&summary=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getCommunityFollowers(userId: string, token?: string | null, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest<Paginated<CommunityAuthor>>(`/community/${userId}/followers?${qs}`, { token });
}

export function getCommunityFollowing(userId: string, token?: string | null, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest<Paginated<CommunityAuthor>>(`/community/${userId}/following?${qs}`, { token });
}

export function searchCommunityPeople(token: string, q: string, page = 1, limit = 20) {
  const qs = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<Paginated<CommunityAuthor>>(`/community/people/search?${qs}`, { token });
}

export function getPeopleYouMayKnow(token: string) {
  return apiRequest<CommunityAuthor[]>('/community/people/suggestions', { token });
}

export function getPopularCommunityPeople(token?: string | null) {
  return apiRequest<CommunityAuthor[]>('/community/people/popular', { token });
}

export function deleteCommunityPost(postId: string, token: string) {
  return apiRequest(`/community/posts/${postId}`, { method: 'DELETE', token });
}

export function adminListPosts(token: string, page = 1, limit = 20, orgId?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (orgId) qs.set('orgId', orgId);
  return apiRequest<Paginated<CommunityPost & { _count?: { comments: number } }>>(
    `/community/admin/posts?${qs}`,
    { token },
  );
}

export function adminDeletePost(postId: string, token: string) {
  return apiRequest(`/community/admin/posts/${postId}`, { method: 'DELETE', token });
}

export function adminDeleteComment(commentId: string, token: string) {
  return apiRequest(`/community/admin/comments/${commentId}`, { method: 'DELETE', token });
}
