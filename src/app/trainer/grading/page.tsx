'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { getCourseById, listCourses } from '@/lib/api/courses';
import { getAssignmentByLesson, gradeSubmission, listSubmissions } from '@/lib/api/assignments';
import { useAuthStore } from '@/lib/auth/store';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { DraftBadge } from '@/components/ui/draft-badge';

export default function TrainerGradingPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  type GradingDraft = { scores: Record<string, string>; feedback: Record<string, string> };
  const {
    value: gradingDraft,
    setValue: setGradingDraft,
    clearDraft: clearGradingDraft,
    restored,
    lastSaved,
  } = useObjectDraft<GradingDraft>(
    draftKey('grading', selectedLessonId ?? 'none'),
    { scores: {}, feedback: {} },
    { enabled: !!selectedLessonId },
  );

  const scores = gradingDraft.scores;
  const feedback = gradingDraft.feedback;

  const { data: assignmentLessons = [] } = useQuery({
    queryKey: ['trainer', 'assignment-lessons'],
    queryFn: async () => {
      const page = await listCourses(token, 1, 100);
      const lessons: Array<{ id: string; title: string; courseTitle: string }> = [];
      await Promise.all(
        page.data.map(async (course) => {
          try {
            const detail = await getCourseById(course.id, token);
            for (const mod of detail.modules ?? []) {
              for (const lesson of mod.lessons) {
                if (lesson.type === 'ASSIGNMENT') {
                  lessons.push({ id: lesson.id, title: lesson.title, courseTitle: detail.title });
                }
              }
            }
          } catch { /* skip */ }
        }),
      );
      return lessons;
    },
    enabled: !!token,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', selectedLessonId],
    queryFn: async () => {
      if (!selectedLessonId) return [];
      const assignment = await getAssignmentByLesson(selectedLessonId, token);
      return listSubmissions(assignment.id, token);
    },
    enabled: !!selectedLessonId && !!token,
  });

  async function handleGrade(submissionId: string) {
    const score = Number(scores[submissionId]);
    if (!Number.isFinite(score)) return;
    try {
      await gradeSubmission(submissionId, token, {
        score,
        feedback: feedback[submissionId],
      });
      setGradingDraft({
        scores: { ...scores, [submissionId]: '' },
        feedback: { ...feedback, [submissionId]: '' },
      });
      toast.success('Graded');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['submissions', selectedLessonId] }),
        queryClient.invalidateQueries({ queryKey: ['submission'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Grading failed'));
    }
  }

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Grade assignments"
        description="Review and score student submissions."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Grading' }]}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2 rounded-xl border border-border bg-card p-3">
          <p className="px-2 text-xs font-semibold uppercase text-muted-foreground">Assignments</p>
          {assignmentLessons.length === 0 && <p className="px-2 text-sm text-muted-foreground">No assignment lessons yet.</p>}
          {assignmentLessons.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLessonId(l.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedLessonId === l.id ? 'bg-brand-green text-white' : 'hover:bg-muted'}`}
            >
              <span className="block font-medium">{l.title}</span>
              <span className={`text-xs ${selectedLessonId === l.id ? 'text-white/80' : 'text-muted-foreground'}`}>{l.courseTitle}</span>
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          {selectedLessonId && (
            <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearGradingDraft} />
          )}
          {!selectedLessonId && <p className="text-sm text-muted-foreground">Select an assignment to review submissions.</p>}
          {submissions.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-semibold">{s.user?.firstName} {s.user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{s.user?.email}</p>
              {s.textContent && <p className="mt-2 whitespace-pre-wrap text-sm">{s.textContent}</p>}
              {s.fileUrl && <a href={s.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-green hover:underline">View attachment</a>}
              {s.score != null ? (
                <p className="mt-2 text-sm font-semibold text-brand-green">Score: {s.score}%</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Score"
                    value={scores[s.id] ?? ''}
                    onChange={(e) => setGradingDraft({ ...gradingDraft, scores: { ...scores, [s.id]: e.target.value } })}
                    className="w-20 rounded border border-border px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="Feedback"
                    value={feedback[s.id] ?? ''}
                    onChange={(e) => setGradingDraft({ ...gradingDraft, feedback: { ...feedback, [s.id]: e.target.value } })}
                    className="flex-1 rounded border border-border px-2 py-1 text-sm"
                  />
                  <Button size="sm" onClick={() => handleGrade(s.id)} className="bg-brand-green hover:bg-brand-green-dark">Grade</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
