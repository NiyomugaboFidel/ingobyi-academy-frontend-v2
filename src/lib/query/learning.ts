import type { QueryClient } from '@tanstack/react-query';

/** Shared React Query keys for enrollments, progress, certificates, and achievements. */
export const learningKeys = {
  myEnrollments: () => ['enrollments', 'my'] as const,
  enrollmentCheck: (courseId: string) => ['enrollment-check', courseId] as const,
  courseProgress: (courseId: string) => ['progress', 'course', courseId] as const,
  certificateRequest: (courseId: string) => ['certificate-request', courseId] as const,
  myCertificates: () => ['certificates', 'mine'] as const,
  myAchievements: () => ['achievements', 'mine'] as const,
  submissionMine: (assignmentId: string) => ['submission', 'mine', assignmentId] as const,
  wishlistCheck: (courseId: string) => ['wishlist', 'check', courseId] as const,
  myWishlist: () => ['wishlist', 'mine'] as const,
};

export async function invalidateAfterEnroll(queryClient: QueryClient, courseId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: learningKeys.enrollmentCheck(courseId) }),
    queryClient.invalidateQueries({ queryKey: learningKeys.myEnrollments() }),
    queryClient.invalidateQueries({ queryKey: ['progress'] }),
  ]);
}

export async function invalidateAfterLessonComplete(queryClient: QueryClient, courseId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: learningKeys.courseProgress(courseId) }),
    queryClient.invalidateQueries({ queryKey: learningKeys.enrollmentCheck(courseId) }),
    queryClient.invalidateQueries({ queryKey: learningKeys.myEnrollments() }),
    queryClient.invalidateQueries({ queryKey: learningKeys.certificateRequest(courseId) }),
    queryClient.invalidateQueries({ queryKey: learningKeys.myAchievements() }),
    queryClient.invalidateQueries({ queryKey: ['progress'] }),
  ]);
}

export async function invalidateAfterCertificateAction(queryClient: QueryClient, courseId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: learningKeys.certificateRequest(courseId) }),
    queryClient.invalidateQueries({ queryKey: learningKeys.myCertificates() }),
    queryClient.invalidateQueries({ queryKey: learningKeys.myAchievements() }),
  ]);
}

/** Poll while waiting for backend to mark completion or admin approval. */
export function courseProgressPollInterval(data?: {
  completionPercent?: number;
  enrollmentStatus?: string;
}): number | false {
  if (!data) return false;
  if (data.completionPercent != null && data.completionPercent >= 100 && data.enrollmentStatus !== 'COMPLETED') {
    return 4_000;
  }
  return false;
}

export function certificateRequestPollInterval(data?: {
  request?: { status?: string } | null;
  certificate?: unknown;
}): number | false {
  if (!data) return false;
  if (data.request?.status === 'PENDING') return 8_000;
  if (data.request?.status === 'APPROVED' && !data.certificate) return 5_000;
  return false;
}

export function assignmentSubmissionPollInterval(
  data?: { gradedAt?: string | null; score?: number | null } | null,
): number | false {
  if (!data) return false;
  if (data.gradedAt == null || data.score == null) return 5_000;
  return false;
}
