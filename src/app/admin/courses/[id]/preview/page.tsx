'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, BookOpen, Check, Clock, GraduationCap, PlayCircle, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { Button } from '@/components/ui/button';
import { DetailPageSkeleton } from '@/components/dashboard/table-skeleton';
import { HtmlContent } from '@/components/editor/html-content';
import {
  approveCourse,
  getCourseById,
  rejectCourse,
} from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
};

export default function AdminCoursePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [acting, setActing] = useState(false);

  const { data: course, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'course-preview', id],
    queryFn: () => getCourseById(id, token),
    enabled: !!token && !!id,
  });

  async function handleAction(action: 'approve' | 'reject') {
    setActing(true);
    try {
      if (action === 'approve') {
        await approveCourse(id, token);
        toast.success('Course approved and published');
      } else {
        await rejectCourse(id, token);
        toast.success('Course sent back to draft');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      router.push('/admin/course-approvals');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  }

  const levelLabel = LEVEL_LABELS[course?.level ?? ''] ?? course?.level ?? 'All levels';
  const priceLabel = course?.price ? `RWF ${Number(course.price).toLocaleString()}` : 'Free';
  const totalLessons =
    course?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;
  const isPending = course?.status === 'PENDING_REVIEW';

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title={course?.title ?? 'Course preview'}
        description="Preview this course as learners will see it before approving."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Approvals', href: '/admin/course-approvals' },
          { label: 'Preview' },
        ]}
        actions={
          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded text-xs">
            <Link href="/admin/course-approvals"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
          </Button>
        }
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {isLoading ? (
        <DetailPageSkeleton />
      ) : course ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/15 bg-brand-green/5 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-brand-ink">Learner preview</p>
              <p className="text-xs text-brand-muted">
                Status: <span className="font-medium">{course.status?.replace('_', ' ') ?? 'DRAFT'}</span>
                {isPending ? ' — ready for your review' : ''}
              </p>
            </div>
            {isPending && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={acting}
                  className="h-8 gap-1 rounded bg-brand-green text-xs hover:bg-brand-green-dark"
                  onClick={() => handleAction('approve')}
                >
                  <Check className="h-3.5 w-3.5" /> Approve & publish
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={acting}
                  className="h-8 gap-1 rounded border-red-200 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => handleAction('reject')}
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="bg-brand-green px-6 py-8 text-white">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                <span>{levelLabel}</span>
                <span>·</span>
                <span>{priceLabel}</span>
                {course.category && (
                  <>
                    <span>·</span>
                    <span>{course.category.name}</span>
                  </>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
              {course.shortDescription && (
                <p className="mt-2 max-w-3xl text-sm text-white/85">{course.shortDescription}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/80">
                <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.modules?.length ?? 0} modules</span>
                <span className="inline-flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {totalLessons} lessons</span>
                <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {course.language ?? 'en'}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Self-paced</span>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                {course.description && (
                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-brand-ink">About this course</h2>
                    <HtmlContent html={course.description} className="prose-sm text-brand-muted" />
                  </section>
                )}

                <section>
                  <h2 className="mb-3 text-sm font-semibold text-brand-ink">Curriculum</h2>
                  <div className="space-y-3">
                    {(course.modules ?? []).map((mod, idx) => (
                      <div key={mod.id} className="rounded-lg border border-border p-4">
                        <p className="text-sm font-semibold text-brand-ink">
                          Module {idx + 1}: {mod.title}
                        </p>
                        {mod.description && (
                          <p className="mt-1 text-xs text-brand-muted">{mod.description}</p>
                        )}
                        <ul className="mt-3 space-y-2">
                          {mod.lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center gap-2 text-xs text-brand-muted">
                              <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-green" />
                              <span>{lesson.title}</span>
                              <span className="rounded bg-brand-canvas px-1.5 py-0.5 text-[10px] uppercase">{lesson.type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {!course.modules?.length && (
                      <p className="text-sm text-brand-muted">No modules added yet.</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                {course.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnailUrl}
                    alt=""
                    className="w-full rounded-lg border border-border object-cover"
                  />
                )}
                <div className="rounded-lg border border-border bg-brand-canvas p-4 text-sm">
                  <p className="font-semibold text-brand-ink">Trainer</p>
                  <p className="mt-1 text-brand-muted">
                    {course.trainers?.map((t) => `${t.user.firstName} ${t.user.lastName}`).join(', ') || '—'}
                  </p>
                </div>
                {course.status === 'PUBLISHED' && (
                  <Button asChild className="w-full bg-brand-green hover:bg-brand-green-dark">
                    <Link href={`/catalog/${course.slug}`}>View in catalog</Link>
                  </Button>
                )}
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
