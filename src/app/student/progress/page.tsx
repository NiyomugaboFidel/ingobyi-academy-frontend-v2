'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LearningShell } from '@/components/layout/learning-shell';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/table-skeleton';
import { myEnrollments } from '@/lib/api/enrollments';
import { getErrorMessage } from '@/lib/api/errors';
import { useEnrollmentProgressMap } from '@/hooks/use-enrollment-progress-map';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';
import { Trophy, BookOpen, Target } from 'lucide-react';

export default function StudentProgressPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: enrollments = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: learningKeys.myEnrollments(),
    queryFn: () => myEnrollments(token),
    enabled: !!token,
  });

  const { data: progressMap = {} } = useEnrollmentProgressMap(enrollments, token);

  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const inProgress = enrollments.filter((e) => e.status !== 'COMPLETED').length;

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">My progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track lesson completion and pick up where you left off.
        </p>
      </div>

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} className="mb-6" />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: 'Total enrolled', value: enrollments.length },
          { icon: Target, label: 'In progress', value: inProgress },
          { icon: Trophy, label: 'Completed', value: completed },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand-green/10 bg-brand-green/5 text-brand-green">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Your courses</h2>
        {isLoading ? (
          <CardGridSkeleton count={3} columns="sm:grid-cols-2 lg:grid-cols-3" />
        ) : enrollments.length === 0 && !error ? (
          <EmptyState
            icon={BookOpen}
            title="No enrollments yet"
            description="Enroll in a course to start tracking your progress."
            primaryAction={{ label: 'Browse courses', href: '/search' }}
            className="border border-border bg-card shadow-sm"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((e) => {
              const pct = e.status === 'COMPLETED' ? 100 : (progressMap[e.course.id] ?? 0);
              return (
                <Link
                  key={e.id}
                  href={`/student/learn?courseId=${e.course.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-brand-green/25 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-xs font-bold text-brand-green">
                    {e.course.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-foreground">{e.course.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{pct}%</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {e.status === 'COMPLETED' ? 'Completed · Review anytime' : 'Tap to continue learning'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </LearningShell>
  );
}
