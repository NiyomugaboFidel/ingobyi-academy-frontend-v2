import { apiRequest } from './client';
import type { Course } from './types';

export type WishlistItem = {
  id: string;
  courseId: string;
  addedAt: string;
  course: Pick<Course, 'id' | 'title' | 'slug' | 'thumbnailUrl' | 'price'>;
};

export function listWishlist(token: string) {
  return apiRequest<WishlistItem[]>('/wishlist', { token });
}

export function checkWishlist(courseId: string, token: string) {
  return apiRequest<{ saved: boolean }>(`/wishlist/${courseId}/check`, { token });
}

export function addToWishlist(courseId: string, token: string) {
  return apiRequest<WishlistItem>(`/wishlist/${courseId}`, { method: 'POST', token });
}

export function removeFromWishlist(courseId: string, token: string) {
  return apiRequest(`/wishlist/${courseId}`, { method: 'DELETE', token });
}
