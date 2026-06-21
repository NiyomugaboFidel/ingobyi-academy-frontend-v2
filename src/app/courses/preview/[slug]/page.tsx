'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Check, Clock, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { Button } from '@/components/ui/button';
import { approveCourse, getCoursePreviewBySlug, rejectCourse } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { HtmlContent } from '@/components/editor/html-content';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
};

export default function CoursePreviewPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken)!;
  const role = useAuthStore((s) => s.user?.platformRole);
  const orgRole = useAuthStore((s) => s.user?.activeOrgRole);
  const canApprove = role === 'SUPERADMIN' || orgRole === 'ADMIN';
  const queryClient = useQueryClient();

  const { data: course, error, isLoading, refetch } = useQuery({
    queryKey: ['course-preview', slug],
    queryFn: () => getCoursePreviewBySlug(slug, token),
    enabled: !!token && !!slug,
  });

  const totalLessons =
    course?.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  async function handleApprove() {
    if (!course || !canApprove) return;
    try {
      await approveCourse(course.id, token);
      toast.success('Course approved and published');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'courses'] });
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'courses-pending'] });
      const dest = role === 'SUPERADMIN' ? '/superadmin/courses' : '/admin/courses';
      router.push(dest);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleReject() {
    if (!course || !canApprove) return;
    try {
      await rejectCourse(course.id, token);
      toast.success('Course returned to draft');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'courses-pending'] });
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'courses-pending'] });
      const dest = role === 'SUPERADMIN' ? '/superadmin/course-approvals' : '/admin/course-approvals';
      router.push(dest);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const backHref =
    role === 'SUPERADMIN' ? '/superadmin/courses' : role === 'TRAINER' ? '/trainer/courses' : '/admin/courses';

  return (
    <DashboardShell allowedRoles={['ADMIN', 'TRAINER', 'SUPERADMIN']}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Preview — not published
            </p>
            <h1 className="text-2xl font-extrabold text-brand-ink">
              {course?.title ?? 'Course preview'}
            </h1>
            {course?.org && (
              <p className="mt-1 text-sm text-brand-muted">by {course.org.name}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={backHref}>Back to courses</Link>
            </Button>
            {(role === 'TRAINER' || role === 'SUPERADMIN') && course && (
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link href={`/trainer/courses/${course.id}/edit`}>Improve course</Link>
              </Button>
            )}
            {course?.status === 'PENDING_REVIEW' && canApprove && (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5 bg-brand-green hover:bg-brand-green-dark"
                  onClick={() => void handleApprove()}
                >
                  <Check className="h-4 w-4" /> Approve & publish
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => void handleReject()}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}
            {course?.status === 'PUBLISHED' && (
              <Button asChild size="sm" className="bg-brand-green hover:bg-brand-green-dark">
                <Link href={`/catalog/${course.slug}`}>View live catalog</Link>
              </Button>
            )}
          </div>
        </div>

        {error && (
          <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} />
        )}

        {isLoading && (
          <div className="dash-card h-48 animate-pulse bg-brand-canvas" />
        )}

        {course && (
          <>
            <div className="dash-card grid gap-4 p-6 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Eye className="h-4 w-4 text-brand-green" />
                Status: <strong className="text-brand-ink">{course.status}</strong>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <BookOpen className="h-4 w-4 text-brand-green" />
                {totalLessons} lessons · {course.modules?.length ?? 0} modules
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Clock className="h-4 w-4 text-brand-green" />
                Level: {LEVEL_LABELS[course.level ?? ''] ?? course.level ?? '—'}
              </div>
            </div>

            {course.shortDescription && (
              <p className="text-sm leading-relaxed text-brand-muted">{course.shortDescription}</p>
            )}

            {course.description && (
              <div className="dash-card p-6">
                <h2 className="font-bold text-brand-ink">Description</h2>
                <HtmlContent html={course.description} className="mt-3 text-sm" />
              </div>
            )}

            <div className="space-y-4">
              <h2 className="font-bold text-brand-ink">Curriculum (including drafts)</h2>
              {course.modules?.map((mod) => (
                <div key={mod.id} className="dash-card p-4">
                  <h3 className="font-semibold text-brand-ink">{mod.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {mod.lessons?.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg border border-brand-green/10 px-3 py-2 text-sm"
                      >
                        <span>{lesson.title}</span>
                        <span className="text-[11px] text-brand-muted">
                          {lesson.type}
                          {!lesson.isPublished && ' · draft'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
