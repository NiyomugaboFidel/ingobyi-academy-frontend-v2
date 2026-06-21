'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, Eye, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { approveCourse, getCoursePreviewBySlug, rejectCourse } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

type Props = { slug: string };

export function CatalogCourseUnavailable({ slug }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.platformRole);
  const orgRole = useAuthStore((s) => s.user?.activeOrgRole);
  const canApprove = role === 'SUPERADMIN' || orgRole === 'ADMIN';
  const isTrainer = role === 'TRAINER' || role === 'SUPERADMIN';
  const queryClient = useQueryClient();

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-preview', slug],
    queryFn: () => getCoursePreviewBySlug(slug, token!),
    enabled: !!token && !!slug,
    retry: false,
  });

  async function handleApprove() {
    if (!course || !token) return;
    try {
      await approveCourse(course.id, token);
      toast.success('Course approved and published');
      await queryClient.invalidateQueries({ queryKey: ['course-preview', slug] });
      window.location.href = `/catalog/${slug}`;
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  async function handleReject() {
    if (!course || !token) return;
    try {
      await rejectCourse(course.id, token);
      toast.success('Course returned to draft');
      await queryClient.invalidateQueries({ queryKey: ['course-preview', slug] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const approvalsHref =
    role === 'SUPERADMIN' ? '/superadmin/course-approvals' : '/admin/course-approvals';
  const coursesHref =
    role === 'SUPERADMIN' ? '/superadmin/courses' : role === 'TRAINER' ? '/trainer/courses' : '/admin/courses';

  return (
    <div className="min-h-screen bg-brand-surface font-poppins">
      <ExploreNav showCatalogQuickNav={false} />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-brand-green/12 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <BookOpen className="h-6 w-6" />
          </div>

          {!token && (
            <>
              <h1 className="text-xl font-extrabold text-brand-ink">Course not available yet</h1>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                This course is not published in the public catalog. If you are the trainer or an admin,
                sign in to preview, improve, or approve it.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-brand-green hover:bg-brand-green-dark">
                  <Link href={`/login?redirect=/catalog/${slug}`}>Sign in to continue</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/catalog">Browse catalog</Link>
                </Button>
              </div>
            </>
          )}

          {token && isLoading && (
            <p className="text-sm text-brand-muted">Checking course access…</p>
          )}

          {token && !isLoading && error && (
            <>
              <h1 className="text-xl font-extrabold text-brand-ink">Course not found</h1>
              <p className="mt-2 text-sm text-brand-muted">
                No published course matches <strong className="text-brand-ink">/{slug}</strong>, or you
                don&apos;t have permission to view it.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/catalog">Back to catalog</Link>
              </Button>
            </>
          )}

          {token && course && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                {course.status === 'PENDING_REVIEW' ? 'Awaiting approval' : 'Not published'}
              </p>
              <h1 className="mt-1 text-xl font-extrabold text-brand-ink">{course.title}</h1>
              {course.shortDescription && (
                <p className="mt-2 text-sm text-brand-muted">{course.shortDescription}</p>
              )}

              <p className="mt-4 rounded-lg border border-brand-green/10 bg-brand-mint-wash px-4 py-3 text-sm text-brand-ink">
                {course.status === 'PENDING_REVIEW' && canApprove && (
                  <>Review this course below, then approve to publish it at <strong>/catalog/{slug}</strong>.</>
                )}
                {course.status === 'PENDING_REVIEW' && !canApprove && isTrainer && (
                  <>Submitted for review. You can still improve content before an admin approves it.</>
                )}
                {course.status === 'DRAFT' && isTrainer && (
                  <>Complete details and lessons, then submit for review from the course editor.</>
                )}
                {course.status === 'DRAFT' && canApprove && (
                  <>This course is still a draft. Trainers must submit it for review before you can approve.</>
                )}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button asChild size="sm" className="gap-1.5 bg-brand-green hover:bg-brand-green-dark">
                  <Link href={`/courses/preview/${slug}`}>
                    <Eye className="h-4 w-4" /> Full preview
                  </Link>
                </Button>

                {isTrainer && (
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href={`/trainer/courses/${course.id}/edit`}>
                      <Pencil className="h-4 w-4" /> Improve course
                    </Link>
                  </Button>
                )}

                {course.status === 'PENDING_REVIEW' && canApprove && (
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

                <Button asChild size="sm" variant="ghost" className="text-brand-green">
                  <Link href={canApprove ? approvalsHref : coursesHref}>Dashboard</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
