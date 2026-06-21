import { apiRequest } from './client';

export interface LessonProgress {
  lessonId: string;
  isCompleted: boolean;
  watchSeconds?: number;
}

export interface CourseProgress {
  courseId: string;
  enrollmentStatus: string;
  completionPercent: number;
  lessonsCompleted: number;
  totalLessons: number;
  learningMinutes: number;
  learningHours: number;
  lessonProgress: LessonProgress[];
}

type BackendCourseProgress = {
  enrollment?: {
    status?: string;
    progress?: Array<{ lessonId: string; isCompleted: boolean; watchedSec?: number }>;
  };
  stats?: {
    totalLessons: number;
    completed: number;
    percent: number;
    learningMinutes?: number;
    learningHours?: number;
  };
};

export async function getCourseProgress(courseId: string, token: string): Promise<CourseProgress> {
  const data = await apiRequest<BackendCourseProgress>(`/progress/course/${courseId}`, { token });
  const progress = data.enrollment?.progress ?? [];
  const totalWatchedSec = progress.reduce((sum, p) => sum + (p.watchedSec ?? 0), 0);
  return {
    courseId,
    enrollmentStatus: data.enrollment?.status ?? 'ACTIVE',
    completionPercent: data.stats?.percent ?? 0,
    lessonsCompleted: data.stats?.completed ?? 0,
    totalLessons: data.stats?.totalLessons ?? 0,
    learningMinutes: data.stats?.learningMinutes ?? Math.round(totalWatchedSec / 60),
    learningHours: data.stats?.learningHours ?? Math.round((totalWatchedSec / 3600) * 10) / 10,
    lessonProgress: progress.map((p) => ({
      lessonId: p.lessonId,
      isCompleted: p.isCompleted,
      watchSeconds: p.watchedSec,
    })),
  };
}

export function markLessonComplete(lessonId: string, token: string) {
  return apiRequest(`/progress/complete/${lessonId}`, { method: 'POST', token });
}

export function sendHeartbeat(lessonId: string, watchedSec: number, token: string) {
  return apiRequest('/progress/heartbeat', {
    method: 'POST',
    token,
    body: JSON.stringify({ lessonId, watchedSec }),
  });
}
