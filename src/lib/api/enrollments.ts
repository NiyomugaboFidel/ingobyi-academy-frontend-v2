import { apiRequest } from './client';

export async function myEnrollments(token: string) {
  return apiRequest<
    Array<{
      id: string;
      status: string;
      enrolledAt: string;
      course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl?: string | null;
      };
    }>
  >('/enrollments/my', { token });
}

export async function enroll(courseId: string, token: string) {
  return apiRequest<unknown>('/enrollments/enroll', {
    method: 'POST',
    token,
    body: JSON.stringify({ courseId }),
  });
}

export function checkEnrollment(courseId: string, token: string) {
  return apiRequest<{
    enrolled: boolean;
    status: string | null;
    enrollmentId?: string;
    completedAt?: string | null;
  }>(`/enrollments/${courseId}/check`, { token });
}

export function unenroll(courseId: string, token: string) {
  return apiRequest(`/enrollments/enroll/${courseId}`, {
    method: 'DELETE',
    token,
  });
}
