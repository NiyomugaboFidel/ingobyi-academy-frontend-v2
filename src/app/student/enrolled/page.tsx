'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LearningShell } from '@/components/layout/learning-shell';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { myEnrollments } from '@/lib/api/enrollments';
import { getErrorMessage } from '@/lib/api/errors';
import { useEnrollmentProgressMap } from '@/hooks/use-enrollment-progress-map';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';
import { BookOpen } from 'lucide-react';

export default function StudentEnrolledPage() {
  const token = useAuthStore((s) => s.accessToken);

  const {
    data: enrollments = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: learningKeys.myEnrollments(),
    queryFn: () => myEnrollments(token!),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  const { data: progressMap = {} } = useEnrollmentProgressMap(enrollments, token);

  const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const inProgressCount = enrollments.length - completedCount;

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">My learning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {inProgressCount > 0 && `${inProgressCount} in progress`}
          {inProgressCount > 0 && completedCount > 0 && ' · '}
          {completedCount > 0 && `${completedCount} completed`}
          {enrollments.length === 0 && !isLoading && !error && 'Your enrolled courses appear here'}
        </p>
      </div>

      {error ? (
        <ApiErrorBanner
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
          className="mb-6"
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[220px] animate-pulse rounded-xl bg-brand-green/5" />
          ))}
        </div>
      ) : enrollments.length === 0 && !error ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="When you enroll in a course, it will show up here with your progress so you can continue anytime."
          primaryAction={{ label: 'Browse courses', href: '/search' }}
          secondaryAction={{ label: 'View certificates', href: '/student/certificates' }}
          className="border border-dashed border-brand-green/20 bg-brand-mint-wash/30"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => {
            const progress = e.status === 'COMPLETED' ? 100 : (progressMap[e.course.id] ?? 0);
            return (
              <div
                key={e.id}
                className="flex flex-col rounded-xl border border-brand-green/10 bg-white shadow-sm transition hover:border-brand-green/25 hover:shadow-md"
              >
                <Link href={`/student/learn?courseId=${e.course.id}`} className="block">
                  <div className="relative h-32 overflow-hidden rounded-t-xl bg-gradient-to-br from-brand-green to-brand-green-dark">
                    {e.course.thumbnailUrl ? (
                      <img src={e.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-3xl font-extrabold text-white/30">{e.course.title.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <Link href={`/student/learn?courseId=${e.course.id}`} className="group">
                    <p className="line-clamp-2 text-sm font-semibold text-brand-ink group-hover:text-brand-green">
                      {e.course.title}
                    </p>
                  </Link>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-green/10">
                      <div
                        className="h-full rounded-full bg-brand-green transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        e.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      }`}
                    >
                      {e.status === 'COMPLETED' ? '✓ Completed' : '● In progress'}
                    </span>
                    <Link
                      href={`/student/learn?courseId=${e.course.id}`}
                      className="rounded-full bg-brand-green px-3 py-1 text-[10px] font-bold text-white hover:bg-brand-green-dark"
                    >
                      {e.status === 'COMPLETED' ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LearningShell>
  );
}
