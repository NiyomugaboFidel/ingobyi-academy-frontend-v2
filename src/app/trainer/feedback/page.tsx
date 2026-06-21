'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Star } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { listCourseReviews } from '@/lib/api/catalog';
import { listCourses } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-brand-muted-light'}`}
        />
      ))}
    </span>
  );
}

export default function TrainerFeedbackPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trainer', 'feedback'],
    queryFn: async () => {
      const coursesPage = await listCourses(token, 1, 100);
      const slugs = coursesPage.data.map((c) => c.slug);
      return listCourseReviews(slugs);
    },
    enabled: !!token,
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Student feedback"
        description="Course reviews from the public catalog."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Feedback' }]}
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {avgRating && (
        <div className="dash-card flex items-center gap-4 px-5 py-4">
          <div className="text-center">
            <p className="font-display text-3xl text-brand-ink">{avgRating}</p>
            <Stars value={Math.round(Number(avgRating))} />
          </div>
          <p className="text-sm text-brand-muted">{reviews.length} review{reviews.length === 1 ? '' : 's'} across your courses</p>
        </div>
      )}

      {isLoading ? (
        <ListPageSkeleton />
      ) : reviews.length === 0 && !error ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Student reviews will appear here once learners rate your published courses."
          primaryAction={{ label: 'My courses', href: '/trainer/courses' }}
        />
      ) : (
        <div className="space-y-2">
          {reviews.map((item) => (
            <div key={item.id} className="dash-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Stars value={item.rating} />
                    <span className="text-[11px] font-medium text-brand-muted">
                      {item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Student'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-brand-green">{item.courseTitle}</p>
                  {item.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-brand-ink">{item.comment}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-brand-muted">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
