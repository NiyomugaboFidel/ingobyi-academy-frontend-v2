import { apiRequest } from './client';

export type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  content?: string | null;
  videoUrl?: string | null;
  duration?: number | null;
  order: number;
  isFree: boolean;
  isPublished: boolean;
};

export function createLesson(
  courseId: string,
  moduleId: string,
  token: string,
  body: Partial<Lesson>,
) {
  return apiRequest<Lesson>(
    `/courses/${courseId}/modules/${moduleId}/lessons`,
    { method: 'POST', token, body: JSON.stringify(body) },
  );
}

export function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  token: string,
  body: Partial<Lesson>,
) {
  return apiRequest<Lesson>(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    { method: 'PATCH', token, body: JSON.stringify(body) },
  );
}

export function deleteLesson(courseId: string, moduleId: string, lessonId: string, token: string) {
  return apiRequest(
    `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    { method: 'DELETE', token },
  );
}
