'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Clock, GraduationCap } from 'lucide-react';
import { BookmarkButton } from '@/components/bookmark-button';
import { StarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';
import { myEnrollments } from '@/lib/api/enrollments';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';
import type { Course } from '@/lib/api/types';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

type Props = {
  course: Course;
  className?: string;
};

export function CourseCard({ course, className }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);

  const { data: enrollments = [] } = useQuery({
    queryKey: learningKeys.myEnrollments(),
    queryFn: () => myEnrollments(token!),
    enabled: !!token && isAuthenticated,
    refetchOnWindowFocus: true,
  });

  const enrollment = enrollments.find((e) => e.course.id === course.id);
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'COMPLETED';

  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const priceLabel = course.price ? `RWF ${course.price}` : 'Free';

  return (
    <div
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-green/8 transition hover:ring-brand-mint/40 hover:shadow-md',
        isEnrolled && 'ring-brand-green/25',
        className,
      )}
    >
      <Link href={`/catalog/${course.slug}`} className="flex min-h-0 flex-1 flex-col">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-brand-card-tint">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-green/10 text-sm font-bold text-brand-green">
              {course.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          {isEnrolled && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-green px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
              {isCompleted ? 'Completed' : 'Enrolled'}
            </span>
          )}
          {course.type && !isEnrolled ? (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green shadow-sm ring-1 ring-brand-green/10">
              {course.type.replace('_', ' ')}
            </span>
          ) : null}
          {course.type && isEnrolled ? (
            <span className="absolute left-2 top-8 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-green shadow-sm ring-1 ring-brand-green/10">
              {course.type.replace('_', ' ')}
            </span>
          ) : null}
          <span className="absolute bottom-2 right-2 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-brand-green shadow-sm ring-1 ring-brand-green/10">
            {priceLabel}
          </span>
          <BookmarkButton
            courseId={course.id}
            className="absolute right-2 top-2 bg-white/90 text-brand-ink shadow-sm hover:bg-white"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-2 font-poppins">
          <h3 className="line-clamp-2 min-h-[2.35rem] text-sm font-bold leading-snug text-brand-ink group-hover:text-brand-green">
            {course.title}
          </h3>

          {course.shortDescription ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-brand-ink/65">
              {course.shortDescription}
            </p>
          ) : null}

          {course.org ? (
            <p className="text-[11px] font-medium text-brand-ink/55">{course.org.name}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-brand-ink/70">
            <StarRating
              value={course.avgRating}
              reviewCount={course.reviewCount}
              showValue
              size="xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {levelLabel ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/8 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                <GraduationCap className="h-3 w-3" />
                {levelLabel}
              </span>
            ) : null}
            {course.category ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint/30 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                <BookOpen className="h-3 w-3" />
                {course.category.name}
              </span>
            ) : null}
            {isEnrolled && !isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                <Clock className="h-3 w-3" />
                In progress
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
