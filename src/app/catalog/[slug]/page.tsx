import React from 'react';
import Link from 'next/link';
import { ExploreNav } from '@/components/layout/explore-nav';
import { getCourseBySlug } from '@/lib/api/catalog';
import { EnrollButton } from '@/components/enroll-button';
import { BookmarkButton } from '@/components/bookmark-button';
import { CourseReviewsPanel } from '@/components/catalog/course-reviews-panel';
import { StarRating } from '@/components/ui/star-rating';
import { LandingFooter } from '@/components/landing/landing-footer';
import {
  GraduationCap, BookOpen, PlayCircle, Globe2,
  Clock, Users, BarChart3, Check, Award,
} from 'lucide-react';
import { HtmlContent } from '@/components/editor/html-content';

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  ALL_LEVELS: 'All levels',
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let course;
  try {
    course = await getCourseBySlug(slug);
  } catch {
    const { CatalogCourseUnavailable } = await import('@/components/courses/catalog-course-unavailable');
    return <CatalogCourseUnavailable slug={slug} />;
  }

  const levelLabel = LEVEL_LABELS[course.level] ?? course.level;
  const priceLabel = course.price ? `RWF ${Number(course.price).toLocaleString()}` : 'Free';
  const totalLessons = course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-brand-surface font-poppins">
      <ExploreNav showCatalogQuickNav={false} />

      {/* Hero banner */}
      <div className="bg-brand-green text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:pr-[340px]">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>›</span>
            <Link href="/catalog" className="hover:text-white">Catalog</Link>
            {course.category && (
              <>
                <span>›</span>
                <Link href={`/catalog?category=${course.category.slug}`} className="hover:text-white">{course.category.name}</Link>
              </>
            )}
            <span>›</span>
            <span className="text-white/80 line-clamp-1">{course.title}</span>
          </nav>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            {course.title}
          </h1>
          {course.shortDescription && (
            <p className="mt-3 text-base text-white/80">{course.shortDescription}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <StarRating
              value={course.avgRating}
              reviewCount={course.reviewCount}
              showValue
              className="text-brand-yellow [&_span]:text-white/90"
            />
            <span className="text-white/60">·</span>
            <span className="text-white/80"><strong className="text-white">{totalLessons}</strong> lessons</span>
            {course.org && (
              <>
                <span className="text-white/60">·</span>
                <span className="text-white/80">by <strong className="text-white">{course.org.name}</strong></span>
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/75">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {levelLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-4 w-4" />
              English / Kinyarwanda
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Self-paced
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              All ages
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* What you'll learn */}
            <div className="mb-6 rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-extrabold text-brand-ink">What you&apos;ll learn</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  'Hands-on practical skills',
                  'Industry-relevant knowledge',
                  'Problem-solving techniques',
                  'Collaborative project work',
                  'Certificate of completion',
                  'Progress tracking & quizzes',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    <span className="text-sm text-brand-ink">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-extrabold text-brand-ink">About this course</h2>
              {course.description ? (
                <HtmlContent html={course.description} className="leading-relaxed" />
              ) : (
                <p className="text-sm leading-relaxed text-brand-ink/75">
                  {course.shortDescription || 'A comprehensive course designed to help you build practical skills through structured lessons, quizzes, and hands-on activities. Taught by experienced Ingobyi mentors.'}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div className="mb-6 rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-extrabold text-brand-ink">Requirements</h2>
              <ul className="space-y-1.5">
                {['No prior experience required', 'Access to a computer or smartphone', 'Willingness to learn and practice'].map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-brand-ink/75">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <div className="rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-brand-ink">Course curriculum</h2>
                  <span className="text-xs text-brand-ink/55">
                    {totalLessons} lessons · {course.modules.length} sections
                  </span>
                </div>
                <div className="space-y-3">
                  {course.modules.map((mod) => (
                    <div key={mod.id} className="overflow-hidden rounded-lg border border-brand-green/10">
                      <div className="flex items-center justify-between bg-brand-mint-wash px-4 py-3">
                        <h3 className="text-sm font-bold text-brand-green">{mod.title}</h3>
                        <span className="text-xs text-brand-ink/55">{mod.lessons.length} lessons</span>
                      </div>
                      <ul className="divide-y divide-brand-green/6">
                        {mod.lessons.map((l) => (
                          <li key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                            <PlayCircle className="h-3.5 w-3.5 shrink-0 text-brand-green/50" />
                            <span className="flex-1 text-sm text-brand-ink/80">{l.title}</span>
                            {l.isFree && (
                              <span className="rounded-full bg-brand-mint/30 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                                Preview
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <CourseReviewsPanel
                courseId={course.id}
                avgRating={course.avgRating}
                reviewCount={course.reviewCount}
                ratingDistribution={course.ratingDistribution}
                reviews={course.reviews}
              />
            </div>

            {/* Instructor */}
            {course.org && (
              <div className="mt-6 rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-extrabold text-brand-ink">About the instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-green text-2xl font-extrabold text-white">
                    {course.org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">{course.org.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Ingobyi Academy instructor</p>
                    <p className="mt-2 text-sm text-brand-ink/70">
                      Certified Ingobyi Academy trainer with expertise in delivering practical, hands-on learning experiences for Rwandan learners.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="w-full lg:sticky lg:top-20 lg:w-[320px] lg:shrink-0">
            <div className="overflow-hidden rounded-xl border border-brand-green/15 bg-white shadow-lg">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-brand-green/10">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-green to-brand-green-dark">
                    <span className="text-5xl font-extrabold text-white/20">
                      {course.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-brand-green shadow-lg">
                    <PlayCircle className="h-8 w-8" />
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-brand-green">{priceLabel}</span>
                  {course.price && <span className="text-sm text-muted-foreground line-through">RWF {Number(course.price) * 2}</span>}
                </div>

                {/* CTA */}
                <div className="mb-4 flex items-center gap-2">
                  <EnrollButton courseId={course.id} courseSlug={course.slug} />
                  <BookmarkButton courseId={course.id} className="shrink-0 border border-brand-green/15" />
                </div>

                <p className="mb-4 text-center text-xs text-brand-ink/55">30-day money-back guarantee</p>

                {/* Features */}
                <div className="space-y-2.5 border-t border-brand-green/8 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-green">This course includes:</p>
                  {[
                    [BookOpen, `${totalLessons || '?'} on-demand lessons`],
                    [Clock, 'Self-paced, lifetime access'],
                    [Globe2, 'Access on mobile & desktop'],
                    [Award, 'Certificate of completion'],
                  ].map(([IconComp, text]) => {
                    const I = IconComp as React.ElementType;
                    return (
                      <div key={String(text)} className="flex items-center gap-2 text-sm text-brand-ink/70">
                        <I className="h-4 w-4 text-brand-green" />
                        {String(text)}
                      </div>
                    );
                  })}
                </div>

                {/* Badges */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-green/8 pt-4">
                  <span className="flex items-center gap-1 rounded-full bg-brand-green/8 px-2.5 py-1 text-xs font-bold text-brand-green">
                    <GraduationCap className="h-3 w-3" /> {levelLabel}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-brand-mint/30 px-2.5 py-1 text-xs font-bold text-brand-green">
                    <BookOpen className="h-3 w-3" /> {course.type?.replace('_', ' ') || 'Course'}
                  </span>
                  {course.category && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-yellow/25 px-2.5 py-1 text-xs font-bold text-brand-green">
                      {course.category.name}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-brand-green/8 pt-4">
                  <Link href="/catalog" className="flex-1 rounded-lg border border-brand-green/20 py-2 text-center text-xs font-semibold text-brand-green hover:bg-brand-green/5">
                    Browse catalog
                  </Link>
                  <Link href="/contact" className="flex-1 rounded-lg border border-brand-green/20 py-2 text-center text-xs font-semibold text-brand-green hover:bg-brand-green/5">
                    Share
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
