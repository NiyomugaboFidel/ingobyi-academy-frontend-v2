'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/auth/store';
import { getCourseBySlug, type CatalogCourseDetail } from '@/lib/api/catalog';
import { listCourseStudents } from '@/lib/api/courses';
import {
  getCourseConversation,
  getSharedAttachments,
} from '@/lib/api/messaging';
import { DetailPageSkeleton } from '@/components/dashboard/table-skeleton';
import { MessagingDashboard } from './messaging-dashboard';

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

interface CourseChatViewProps {
  slug: string;
}

export function CourseChatView({ slug }: CourseChatViewProps) {
  const { accessToken } = useAuthStore();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course-slug', slug],
    queryFn: () => getCourseBySlug(slug),
  });

  const { data: conversation } = useQuery({
    queryKey: ['course-conversation', course?.id],
    queryFn: () => getCourseConversation(course!.id, accessToken!),
    enabled: !!accessToken && !!course?.id,
  });

  const { data: studentsPage } = useQuery({
    queryKey: ['course-students', course?.id],
    queryFn: () => listCourseStudents(course!.id, accessToken!, 1, 20),
    enabled: !!accessToken && !!course?.id,
  });

  const { data: sharedFiles = [] } = useQuery({
    queryKey: ['course-shared-files', conversation?.id],
    queryFn: () => getSharedAttachments(conversation!.id, accessToken!),
    enabled: !!accessToken && !!conversation?.id,
  });

  if (courseLoading) {
    return <DetailPageSkeleton />;
  }

  if (!course) {
    return <p className="text-sm text-muted-foreground p-8">Course not found.</p>;
  }

  const courseDetail = course as CatalogCourseDetail;
  const trainers = courseDetail.trainers ?? [];
  const students = studentsPage?.data ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[520px] gap-4 overflow-hidden">
      {/* Course sidebar */}
      <aside className="hidden xl:flex w-64 shrink-0 flex-col rounded-2xl border border-border/60 bg-muted/20 overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <Link href={`/catalog/${slug}`} className="text-xs text-brand-green hover:underline">
            ← Back to course
          </Link>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
              <BookOpen className="h-6 w-6 text-brand-green" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm leading-tight line-clamp-2">{course.title}</h2>
              {course.org && (
                <p className="text-xs text-muted-foreground mt-0.5">{course.org.name}</p>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-5">
            <section>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <GraduationCap className="h-3.5 w-3.5" />
                Trainers
              </h3>
              <div className="space-y-2">
                {trainers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No trainers listed</p>
                ) : (
                  trainers.map((t) => (
                    <div key={t.user.id} className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={t.user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[9px]">
                          {initials(t.user.firstName, t.user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {t.user.firstName} {t.user.lastName}
                        </p>
                        {t.isPrimary && (
                          <p className="text-[10px] text-brand-green">Primary trainer</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <Users className="h-3.5 w-3.5" />
                Members ({students.length}{studentsPage && studentsPage.meta.total > students.length ? `+` : ''})
              </h3>
              <div className="space-y-2">
                {students.slice(0, 12).map((e) => (
                  <div key={e.id} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={e.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[9px]">
                        {initials(e.user.firstName, e.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs truncate">
                      {e.user.firstName} {e.user.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <FileText className="h-3.5 w-3.5" />
                Shared files
              </h3>
              {sharedFiles.length === 0 ? (
                <p className="text-xs text-muted-foreground">No files shared yet</p>
              ) : (
                <div className="space-y-1.5">
                  {sharedFiles.slice(0, 8).map((f) => (
                    <a
                      key={f.id}
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      <span className="truncate flex-1">{f.filename}</span>
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </aside>

      {/* Main chat */}
      <div className="flex-1 min-w-0">
        <MessagingDashboard
          courseId={course.id}
          courseTitle={course.title}
          compact
          initialFilter="courses"
        />
      </div>
    </div>
  );
}
