'use client';

import { Suspense, useMemo } from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, List, Check,
  PlayCircle, BookOpen, ClipboardCheck, Award,
  X, GraduationCap,
} from 'lucide-react';
import { getCourseById } from '@/lib/api/courses';
import { markLessonComplete, sendHeartbeat } from '@/lib/api/progress';
import { useLearningProgress } from '@/hooks/use-learning-progress';
import { invalidateAfterLessonComplete } from '@/lib/query/learning';
import { CertificateRequestPanel } from '@/components/learning/certificate-request-panel';
import { QuizLesson } from '@/components/learning/quiz-lesson';
import { AssignmentLesson } from '@/components/learning/assignment-lesson';
import { LessonVideoPlayer, type LessonVideoView } from '@/components/learning/lesson-video-player';
import { HtmlContent } from '@/components/editor/html-content';
import { BRAND_LOGO_SRC } from '@/components/brand-logo';
import { BookmarkButton } from '@/components/bookmark-button';
import { ReportDialog } from '@/components/report-dialog';
import { useAuthStore } from '@/lib/auth/store';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand-logo';
import { PageError } from '@/components/errors/page-error';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/errors';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'quiz' | 'assignment';
  order: number;
  isFree: boolean;
  videoUrl?: string | null;
  content?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  modules: Module[];
}

function normalizeLessonType(type: string): Lesson['type'] {
  const t = type.toLowerCase();
  if (t === 'video' || t === 'text' || t === 'quiz' || t === 'assignment' || t === 'interactive') {
    return t;
  }
  return 'text';
}

function normalizeCourse(data: CourseDetail): CourseDetail {
  return {
    ...data,
    modules: data.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((lesson) => ({
        ...lesson,
        type: normalizeLessonType(lesson.type),
      })),
    })),
  };
}

function LessonTypeIcon({ type }: { type: Lesson['type'] }) {
  switch (type) {
    case 'video': return <PlayCircle className="h-3.5 w-3.5 shrink-0" />;
    case 'text': return <BookOpen className="h-3.5 w-3.5 shrink-0" />;
    case 'quiz':
    case 'assignment': return <ClipboardCheck className="h-3.5 w-3.5 shrink-0" />;
    default: return <BookOpen className="h-3.5 w-3.5 shrink-0" />;
  }
}

function StudentLearnInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = searchParams.get('courseId');
  const { accessToken, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [completing, setCompleting] = useState(false);
  const watchedSecRef = useRef(0);

  const { data: progressData, refetch: refetchProgress } = useLearningProgress(courseId);

  const progress = useMemo(() => {
    const map: Record<string, boolean> = {};
    progressData?.lessonProgress.forEach((p) => {
      map[p.lessonId] = p.isCompleted;
    });
    return map;
  }, [progressData]);

  const enrollmentStatus = progressData?.enrollmentStatus ?? 'ACTIVE';
  const learningMinutes = progressData?.learningMinutes ?? 0;
  const isCourseCompleted = enrollmentStatus === 'COMPLETED';

  const allLessons = course?.modules.flatMap((m) => m.lessons.sort((a, b) => a.order - b.order)).sort((a, b) => a.order - b.order) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const completedCount = Object.values(progress).filter(Boolean).length;
  const localProgressPercent =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const progressPercent = isCourseCompleted
    ? 100
    : (progressData?.completionPercent ?? localProgressPercent);

  const loadCourse = useCallback(async () => {
    if (!courseId || !accessToken) return;
    setLoadError(null);
    setLoading(true);
    try {
      const raw = await getCourseById(courseId, accessToken);
      const data = normalizeCourse(raw as CourseDetail);
      setCourse(data);
      const first = data.modules[0]?.lessons[0];
      if (first) setCurrentLesson(first);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Could not load this course. You may need to enroll first.'));
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, accessToken]);

  useEffect(() => {
    if (!isAuthenticated()) {
      const redirect = courseId
        ? `/student/learn?courseId=${encodeURIComponent(courseId)}`
        : '/student/enrolled';
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    loadCourse();
  }, [loadCourse, isAuthenticated, router, courseId]);

  const handleWatchProgress = useCallback((sec: number) => {
    if (!currentLesson || !accessToken) return;
    watchedSecRef.current = sec;
    if (sec > 0 && sec % 15 === 0) {
      sendHeartbeat(currentLesson.id, sec, accessToken).catch(() => undefined);
      void refetchProgress();
    }
  }, [currentLesson, accessToken, refetchProgress]);

  useEffect(() => {
    if (currentLesson?.type !== 'video' || !currentLesson.videoUrl) {
      setCinemaMode(false);
    }
  }, [currentLesson]);

  const handleVideoViewChange = useCallback((view: LessonVideoView) => {
    const playing = view === 'playing';
    setCinemaMode(playing);
    if (playing) setSidebarOpen(false);
  }, []);

  async function markComplete(lessonId: string) {
    if (!accessToken || completing || !courseId) return;
    setCompleting(true);
    try {
      await markLessonComplete(lessonId, accessToken);
      await invalidateAfterLessonComplete(queryClient, courseId);
      toast.success(isCourseCompleted ? 'Lesson reviewed' : 'Lesson marked complete');
      if (nextLesson) setCurrentLesson(nextLesson);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not mark lesson complete'));
      await refetchProgress();
    } finally {
      setCompleting(false);
    }
  }

  if (!courseId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center font-poppins">
        <GraduationCap className="h-16 w-16 text-brand-green/30" />
        <h1 className="text-xl font-bold text-brand-ink">No course selected</h1>
        <p className="text-sm text-muted-foreground">Go to your enrolled courses and pick one to start learning.</p>
        <Button asChild className="bg-brand-green hover:bg-brand-green-dark">
          <Link href="/student/enrolled">My enrolled courses</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-poppins">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-green/20 border-t-brand-green" />
          <p className="mt-4 text-sm text-muted-foreground">Loading your course…</p>
        </div>
      </div>
    );
  }

  if (loadError || !course) {
    return (
      <div className="min-h-screen bg-white font-poppins">
        <PageError
          title="Couldn't load this course"
          message={loadError ?? 'This course may have been removed or you may not have access yet.'}
          onRetry={() => void loadCourse()}
          retrying={loading}
        />
        <div className="flex flex-wrap items-center justify-center gap-3 pb-16">
          <Button asChild variant="outline">
            <Link href="/student/enrolled">My learning</Link>
          </Button>
          <Button asChild className="bg-brand-green hover:bg-brand-green-dark">
            <Link href="/search">Browse courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-brand-green font-poppins">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <Link href="/student/enrolled" className="flex shrink-0 items-center gap-1.5 text-white/70 hover:text-white">
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span className="hidden text-xs font-medium sm:inline">My learning</span>
          <BrandLogo size="sm" variant="onDark" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-white">
            {course.title}
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-brand-mint transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-white/60">
            {progressPercent}%{isCourseCompleted ? ' · Completed' : ''} · {learningMinutes} min learned
          </span>
        </div>

        {courseId && <BookmarkButton courseId={courseId} className="text-white/70 hover:text-white" />}
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Toggle curriculum"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Main content area */}
        <main className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col bg-black',
          cinemaMode ? 'overflow-hidden' : 'overflow-y-auto bg-white',
        )}>
          {currentLesson ? (
            <>
              {/* ── VIDEO LESSON ── */}
              {currentLesson.type === 'video' && currentLesson.videoUrl ? (
                <div
                  className={cn(
                    'relative w-full shrink-0 bg-black',
                    cinemaMode
                      ? 'h-[calc(100dvh-3.5rem)]'
                      : 'aspect-video',
                  )}
                  style={!cinemaMode ? { maxHeight: 'calc(100vw * 9 / 16)' } : undefined}
                >
                  <LessonVideoPlayer
                    key={currentLesson.id}
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    coverImageUrl={currentLesson.coverImageUrl ?? course?.thumbnailUrl ?? undefined}
                    onWatchProgress={handleWatchProgress}
                    onViewChange={handleVideoViewChange}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                /* ── NON-VIDEO LESSON BANNER ── */
                <div className="relative aspect-[21/9] w-full min-h-[200px] max-h-[400px] overflow-hidden bg-brand-green">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-green via-brand-green-dark to-brand-green" />
                  <img
                    src={currentLesson.coverImageUrl || BRAND_LOGO_SRC}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-contain p-8 ${
                      currentLesson.coverImageUrl ? 'object-cover p-0 opacity-80' : 'opacity-90'
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/45 to-black/25" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                    <span className="mb-2 inline-flex w-fit rounded-full bg-white/12 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ring-1 ring-white/25">
                      {currentLesson.type === 'text' ? 'Reading' : currentLesson.type}
                    </span>
                    <h2 className="max-w-3xl text-xl font-extrabold leading-tight text-white sm:text-3xl">
                      {currentLesson.title}
                    </h2>
                  </div>
                </div>
              )}

              {/* ── LESSON BODY (hidden in cinema mode) ── */}
              {!cinemaMode && (
                <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-green/60">
                        Lesson {currentIdx + 1} of {allLessons.length}
                      </p>
                      <h1 className="mt-1 text-2xl font-extrabold text-brand-ink">{currentLesson.title}</h1>
                    </div>
                    {progress[currentLesson.id] && (
                      <span className="flex items-center gap-1.5 rounded-full bg-brand-mint/25 px-3 py-1.5 text-xs font-bold text-brand-green">
                        <Check className="h-3.5 w-3.5" />
                        Completed
                      </span>
                    )}
                  </div>

                  {currentLesson.description && (
                    <div className="mb-6 rounded-lg border border-brand-green/8 bg-brand-mint-wash p-4">
                      <HtmlContent html={currentLesson.description} className="text-sm" />
                    </div>
                  )}

                  {currentLesson.type === 'quiz' && (
                    <QuizLesson lessonId={currentLesson.id} onComplete={() => markComplete(currentLesson.id)} />
                  )}

                  {currentLesson.type === 'assignment' && (
                    <AssignmentLesson
                      lessonId={currentLesson.id}
                      onComplete={() => markComplete(currentLesson.id)}
                    />
                  )}

                  {currentLesson.type === 'text' && currentLesson.content && (
                    <HtmlContent html={currentLesson.content} className="leading-relaxed" />
                  )}

                  {!currentLesson.content && currentLesson.type === 'text' && (
                    <div className="rounded-xl border border-brand-green/8 bg-brand-mint-wash p-8 text-center">
                      <BookOpen className="mx-auto h-10 w-10 text-brand-green/30" />
                      <p className="mt-3 text-sm text-brand-ink/55">Lesson content will appear here.</p>
                    </div>
                  )}

                  {courseId && (
                    <CertificateRequestPanel
                      courseId={courseId}
                      enrollmentStatus={enrollmentStatus}
                      progressPercent={progressPercent}
                    />
                  )}

                  <div className="mt-10 flex flex-col gap-4 border-t border-brand-green/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      {prevLesson && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentLesson(prevLesson)}
                          className="gap-1.5 border-brand-green/20 text-brand-green"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                      )}
                      {nextLesson && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentLesson(nextLesson)}
                          className="gap-1.5 border-brand-green/20 text-brand-green"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <ReportDialog targetType="CONTENT" targetLabel="lesson" metadata={{ lessonId: currentLesson.id, courseId }} />

                    {!isCourseCompleted && !progress[currentLesson.id] && currentLesson.type !== 'quiz' && currentLesson.type !== 'assignment' ? (
                      <Button
                        type="button"
                        onClick={() => markComplete(currentLesson.id)}
                        disabled={completing}
                        className="rounded-full bg-brand-green px-6 font-bold hover:bg-brand-green-dark"
                      >
                        {completing ? 'Saving…' : 'Mark as complete'}
                      </Button>
                    ) : (isCourseCompleted || progress[currentLesson.id]) && nextLesson ? (
                      <Button
                        type="button"
                        onClick={() => setCurrentLesson(nextLesson)}
                        className="rounded-full bg-brand-green px-6 font-bold hover:bg-brand-green-dark"
                      >
                        {isCourseCompleted ? 'Next lesson →' : 'Continue →'}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-full bg-brand-mint/20 px-4 py-2">
                        <Award className="h-5 w-5 text-brand-green" />
                        <span className="text-sm font-bold text-brand-green">
                          {isCourseCompleted ? 'Reviewing completed course' : 'Course complete'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <PlayCircle className="h-16 w-16 text-brand-green/20" />
              <p className="mt-4 text-base font-semibold text-brand-ink">Select a lesson to start learning</p>
            </div>
          )}
        </main>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-brand-green text-white md:flex">
            <div className="border-b border-white/10 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Course curriculum</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-brand-mint transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="shrink-0 text-xs text-white/55">{progressPercent}%</span>
              </div>
              <p className="mt-1 text-xs text-white/45">{completedCount} of {allLessons.length} completed · {learningMinutes} min</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {course?.modules.map((mod) => (
                <div key={mod.id}>
                  <div className="border-b border-white/10 px-4 py-3 bg-white/[0.03]">
                    <p className="text-xs font-bold text-white/70">{mod.title}</p>
                    <p className="mt-0.5 text-[10px] text-white/35">{mod.lessons.length} lessons</p>
                  </div>
                  {mod.lessons.sort((a, b) => a.order - b.order).map((lesson) => {
                    const done = !!progress[lesson.id];
                    const active = lesson.id === currentLesson?.id;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setCurrentLesson(lesson)}
                        className={cn(
                          'flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition',
                          active ? 'bg-brand-green/60' : 'hover:bg-white/5',
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          done ? 'border-brand-mint bg-brand-mint/20 text-brand-mint' :
                          active ? 'border-white/60 text-white/80' :
                          'border-white/25 text-white/35',
                        )}>
                          {done ? <Check className="h-3 w-3" /> : <LessonTypeIcon type={lesson.type} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn('line-clamp-2 text-xs font-medium leading-snug', active ? 'text-white' : 'text-white/70')}>
                            {lesson.title}
                          </p>
                          <p className="mt-0.5 text-[10px] capitalize text-white/40">{lesson.type}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function StudentLearnPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-brand-green font-poppins">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
      </div>
    }>
      <StudentLearnInner />
    </Suspense>
  );
}
