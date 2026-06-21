import { apiRequest } from './client';
import { fetchAllPages } from './pagination';
import type { Course, CourseModule, Paginated } from './types';

export type CourseEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  completedAt?: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
};

export function listCourses(
  token: string,
  page = 1,
  limit = 20,
  params?: { status?: string },
) {
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params?.status) qs.set('status', params.status);
  return apiRequest<Paginated<Course>>(`/courses?${qs.toString()}`, { token });
}

export async function listAllCourses(token: string) {
  return fetchAllPages((page, limit) => listCourses(token, page, limit));
}

export function getCourseById(id: string, token: string) {
  return apiRequest<CourseDetail>(`/courses/${id}`, { token });
}

export function listCourseStudents(courseId: string, token: string, page = 1, limit = 50) {
  return apiRequest<Paginated<CourseEnrollment>>(
    `/courses/${courseId}/students?page=${page}&limit=${limit}`,
    { token },
  );
}

export type CourseDetail = Course & {
  modules: CourseModule[];
};

export function createCourse(
  token: string,
  body: {
    title: string;
    orgId?: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    price?: number;
    type?: string;
  },
) {
  return apiRequest<Course>('/courses', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function updateCourse(
  id: string,
  token: string,
  body: Partial<{
    title: string;
    description: string;
    shortDescription: string;
    thumbnailUrl: string;
    categoryId: string;
    price: number;
    level: string;
    language: string;
  }>,
) {
  return apiRequest<Course>(`/courses/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export function createModule(
  courseId: string,
  token: string,
  body: { title: string; description?: string; order: number },
) {
  return apiRequest<CourseModule>(`/courses/${courseId}/modules`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function updateModule(
  courseId: string,
  moduleId: string,
  token: string,
  body: { title: string; description?: string; order: number },
) {
  return apiRequest<CourseModule>(`/courses/${courseId}/modules/${moduleId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export function deleteModule(courseId: string, moduleId: string, token: string) {
  return apiRequest(`/courses/${courseId}/modules/${moduleId}`, { method: 'DELETE', token });
}

export function publishCourse(id: string, token: string) {
  return apiRequest(`/courses/${id}/publish`, { method: 'POST', token });
}

export function listPendingCourses(token: string) {
  return apiRequest<Course[]>('/courses/pending', { token });
}

export function getCoursePreviewBySlug(slug: string, token: string) {
  return apiRequest<CourseDetail>(`/courses/preview/${slug}`, { token });
}

export function approveCourse(id: string, token: string) {
  return apiRequest<Course>(`/courses/${id}/approve`, { method: 'POST', token });
}

export function rejectCourse(id: string, token: string) {
  return apiRequest<Course>(`/courses/${id}/reject`, { method: 'POST', token });
}

/** Aggregate students across all trainer courses. */
export async function listTrainerStudents(token: string) {
  const coursesPage = await listCourses(token, 1, 100);
  const rows: Array<CourseEnrollment & { course: { id: string; title: string; slug: string } }> = [];

  await Promise.all(
    coursesPage.data.map(async (course) => {
      try {
        const students = await listCourseStudents(course.id, token, 1, 100);
        for (const enrollment of students.data) {
          rows.push({
            ...enrollment,
            course: { id: course.id, title: course.title, slug: course.slug },
          });
        }
      } catch {
        /* skip courses without access */
      }
    }),
  );

  return rows.sort(
    (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
  );
}
