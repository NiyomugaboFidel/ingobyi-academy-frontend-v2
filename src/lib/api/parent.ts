import { apiRequest } from './client';

export type ParentChildCourse = {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  status: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  lastActivityAt: string;
  trainer: { id: string; name: string } | null;
};

export type ParentChild = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string | null;
  email: string;
  organization: { id: string; name: string; slug: string } | null;
  courseCount: number;
  avgProgress: number;
  achievements: number;
  lastActiveAt: string | null;
  courses: ParentChildCourse[];
};

export function listParentChildren(token: string) {
  return apiRequest<ParentChild[]>('/parent/children', { token });
}

export function getParentChild(childId: string, token: string) {
  return apiRequest<ParentChild & {
    achievements: Array<{ id: string; earnedAt: string; definition: { name: string; description?: string } }>;
    upcomingAssignments: Array<{
      id: string;
      title: string;
      dueAt?: string | null;
      lesson: { title: string; module: { course: { title: string; slug: string } } };
    }>;
  }>(`/parent/children/${childId}`, { token });
}
