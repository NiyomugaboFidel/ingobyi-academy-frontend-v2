import { apiRequest } from './client';

export type UnifiedAchievement = {
  id: string;
  kind: 'certificate' | 'badge' | 'course' | 'custom';
  title: string;
  description: string;
  earnedAt: string;
  points: number;
  iconUrl?: string | null;
  courseTitle?: string;
  courseSlug?: string;
  certificateId?: string;
  verifyCode?: string;
  pdfUrl?: string | null;
  definitionId?: string;
};

export function getMyAchievements(token: string) {
  return apiRequest<UnifiedAchievement[]>('/achievements/mine', { token });
}

export function getUserAchievementsUnified(userId: string) {
  return apiRequest<UnifiedAchievement[]>(`/achievements/user/${userId}`);
}

export function awardCustomAchievement(
  token: string,
  body: {
    userId: string;
    title: string;
    description: string;
    points?: number;
    iconUrl?: string;
  },
) {
  return apiRequest<UnifiedAchievement[]>('/achievements/award', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
