import { apiRequest, apiUrl } from './client';

export interface OrgStats {
  enrollments: number;
  completions: number;
  members: number;
  courses: number;
  revenue?: {
    totalRevenue: number;
    paidEnrollments: number;
    currency: string;
  };
}

export interface PlatformStats {
  users: number;
  orgs: number;
  courses: number;
  enrollments: number;
}

export interface CourseStats {
  enrolled: number;
  completed: number;
  lessonsCompleted: number;
}

export interface TrainerDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  activeStudents: number;
  completedEnrollments: number;
  lessonsCompleted: number;
  avgRating: number | null;
  reviewCount?: number;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseTitle: string;
    status: string;
    enrolledAt: string;
  }>;
  courseBreakdown: Array<{
    courseId: string;
    title: string;
    status: string;
    enrolled: number;
    completed: number;
    lessonsCompleted: number;
  }>;
}

export function getOrgStats(orgId: string, token: string) {
  return apiRequest<OrgStats>(`/analytics/org/${orgId}`, { token });
}

export function getPlatformStats(token: string) {
  return apiRequest<PlatformStats>('/analytics/platform', { token });
}

export function getCourseStats(courseId: string, token: string) {
  return apiRequest<CourseStats>(`/analytics/course/${courseId}`, { token });
}

export function getTrainerDashboard(token: string) {
  return apiRequest<TrainerDashboardStats>('/analytics/trainer/me', { token });
}

export async function exportOrgData(orgId: string, format: 'csv' | 'xlsx' | 'json', token: string) {
  const res = await fetch(apiUrl(`/analytics/export/${orgId}?format=${format}`), {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const ext = format === 'xlsx' ? 'xlsx' : format === 'json' ? 'json' : 'csv';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `org-export-${orgId.slice(0, 8)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}
