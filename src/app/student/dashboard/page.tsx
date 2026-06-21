'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Award, BookOpen, Compass, Play, Sparkles, Trophy, Users,
} from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { Button } from '@/components/ui/button';
import { getFeatured, getCategories } from '@/lib/api/catalog';
import { myEnrollments } from '@/lib/api/enrollments';
import { getMyAchievements } from '@/lib/api/achievements';
import { getCommunityFeed } from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { useEnrollmentProgressMap } from '@/hooks/use-enrollment-progress-map';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

export default function StudentDashboardPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);

  const {
    data: enrollments = [],
    error: enrollError,
    refetch: refetchEnrollments,
    isLoading: loadingEnrollments,
  } = useQuery({
    queryKey: learningKeys.myEnrollments(),
    queryFn: () => myEnrollments(token),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: learningKeys.myAchievements(),
    queryFn: () => getMyAchievements(token),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  const { data: progressMap = {} } = useEnrollmentProgressMap(enrollments, token);

  const { data: featured = [] } = useQuery({
    queryKey: ['catalog', 'featured'],
    queryFn: () => getFeatured(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => getCategories(),
  });

  const { data: feed } = useQuery({
    queryKey: ['community', 'feed', 'preview'],
    queryFn: () => getCommunityFeed(token, { limit: 3 }),
    enabled: !!token,
  });

  const active = enrollments.filter((e) => e.status === 'ACTIVE');
  const hasEnrollments = enrollments.length > 0;
  const continueCourses = active
    .map((e) => ({ ...e, progress: progressMap[e.course.id] ?? 0 }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4);

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      {enrollError ? (
        <ApiErrorBanner
          message={getErrorMessage(enrollError)}
          onRetry={() => refetchEnrollments()}
          retrying={loadingEnrollments}
          className="mb-6"
        />
      ) : null}

      <section className="relative overflow-hidden rounded-2xl border border-brand-green/15 bg-gradient-to-br from-brand-green to-brand-green-dark px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-white/75">Your learning space</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {user?.firstName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            {hasEnrollments
              ? 'Pick up where you left off, explore new skills, and connect with learners across Ingobyi Academy.'
              : 'Browse courses, enroll in your first one, and start building skills today.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {hasEnrollments ? (
              <Button asChild size="sm" className="rounded-full bg-white text-brand-green hover:bg-white/90">
                <Link href="/student/enrolled"><Play className="mr-1.5 h-4 w-4" /> Continue learning</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-full bg-white text-brand-green hover:bg-white/90">
                <Link href="/search"><Compass className="mr-1.5 h-4 w-4" /> Find your first course</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/search"><Compass className="mr-1.5 h-4 w-4" /> Explore courses</Link>
            </Button>
          </div>
        </div>
        <Sparkles className="absolute -right-4 -top-4 h-32 w-32 text-white/10" />
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {!loadingEnrollments && !hasEnrollments && !enrollError ? (
            <EmptyState
              icon={BookOpen}
              title="You're not enrolled yet"
              description="Explore our catalog and enroll in a course to start tracking progress, earning certificates, and joining the community."
              primaryAction={{ label: 'Browse courses', href: '/search' }}
              secondaryAction={{ label: 'Popular categories', href: '/search?category=technology' }}
              className="border border-border bg-card shadow-sm"
            />
          ) : null}

          {continueCourses.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Continue learning</h2>
                <Link href="/student/enrolled" className="text-sm font-semibold text-brand-green hover:underline">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {continueCourses.map((e) => (
                  <Link
                    key={e.id}
                    href={`/student/learn?courseId=${e.course.id}`}
                    className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-green/25 hover:shadow-md"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-green/10">
                      {e.course.thumbnailUrl ? (
                        <img src={e.course.thumbnailUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                      ) : (
                        <BookOpen className="h-7 w-7 text-brand-green" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-foreground group-hover:text-brand-green">{e.course.title}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${e.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{e.progress}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {featured.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Recommended for you</h2>
                <Link href="/search" className="text-sm font-semibold text-brand-green hover:underline">Explore</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {featured.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/catalog/${course.slug}`}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-brand-green/25"
                  >
                    <p className="font-semibold text-foreground">{course.title}</p>
                    {course.shortDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-foreground">Popular categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/search?category=${cat.slug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand-green/30 hover:bg-brand-green/5"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-bold text-foreground">Your progress</h3>
            <div className="mt-4 flex items-center justify-center">
              <ProgressRing
                value={enrollments.length
                  ? Math.round(enrollments.reduce((s, e) => s + (progressMap[e.course.id] ?? 0), 0) / enrollments.length)
                  : 0}
                size={120}
              />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div><dt className="text-muted-foreground">Enrolled</dt><dd className="text-lg font-bold">{enrollments.length}</dd></div>
              <div><dt className="text-muted-foreground">Active</dt><dd className="text-lg font-bold">{active.length}</dd></div>
            </dl>
            {!hasEnrollments && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Enroll in a course to start tracking your progress here.
              </p>
            )}
          </div>

          {achievements.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-green" />
                <h3 className="font-bold text-foreground">Achievements</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {achievements.slice(0, 3).map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {feed && feed.data.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-green" />
                  <h3 className="font-bold text-foreground">Community</h3>
                </div>
                <Link href="/community" className="text-xs font-semibold text-brand-green hover:underline">See all</Link>
              </div>
              <ul className="space-y-3">
                {feed.data.map((post) => (
                  <li key={post.id} className="text-sm">
                    <p className="font-medium text-foreground">
                      {post.author.firstName} {post.author.lastName}
                    </p>
                    <p className="line-clamp-2 text-muted-foreground">{post.content}</p>
                  </li>
                ))}
              </ul>
              <Link href="/community" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:underline">
                Join the conversation <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </LearningShell>
  );
}
