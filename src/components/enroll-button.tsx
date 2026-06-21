'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { checkEnrollment, enroll } from '@/lib/api/enrollments';
import { invalidateAfterEnroll, learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

type Props = {
  courseId: string;
  courseSlug?: string;
  className?: string;
  compact?: boolean;
};

export function EnrollButton({ courseId, courseSlug, className, compact }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { data: enrollment, isLoading: checking } = useQuery({
    queryKey: learningKeys.enrollmentCheck(courseId),
    queryFn: () => checkEnrollment(courseId, accessToken!),
    enabled: !!accessToken && isAuthenticated(),
    refetchOnWindowFocus: true,
  });

  async function handleEnroll() {
    if (!isAuthenticated() || !accessToken) {
      const returnTo = courseSlug ? `/catalog/${courseSlug}` : `/catalog`;
      router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (enrollment?.enrolled) {
      router.push(`/student/learn?courseId=${courseId}`);
      return;
    }
    setLoading(true);
    try {
      await enroll(courseId, accessToken);
      await invalidateAfterEnroll(queryClient, courseId);
      toast.success('Enrolled! Starting your course…');
      router.push(`/student/learn?courseId=${courseId}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not enroll in this course'));
    } finally {
      setLoading(false);
    }
  }

  if (checking && isAuthenticated()) {
    return (
      <Button disabled variant="secondary" className={cn('flex-1', className)}>
        Checking…
      </Button>
    );
  }

  if (enrollment?.enrolled) {
    const learnHref = `/student/learn?courseId=${courseId}`;
    const isCompleted = enrollment.status === 'COMPLETED';

    return (
      <div className={cn('flex flex-1 flex-col gap-2', className)}>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-brand-green/25 bg-brand-mint-wash px-3 py-2 text-sm font-semibold text-brand-green">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {isCompleted ? 'Course completed' : 'Already enrolled'}
        </div>
        <Button asChild className="w-full bg-brand-green hover:bg-brand-green-dark">
          <Link href={learnHref}>
            <PlayCircle className="mr-1.5 h-4 w-4" />
            {isCompleted ? 'Review course' : 'Continue learning'}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={loading}
      variant="secondary"
      className={cn(compact ? '' : 'flex-1', className)}
    >
      {loading ? 'Enrolling…' : 'Enroll for free'}
    </Button>
  );
}
