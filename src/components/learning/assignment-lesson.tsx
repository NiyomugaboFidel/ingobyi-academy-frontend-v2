'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { getAssignmentByLesson, getMySubmission, submitAssignment } from '@/lib/api/assignments';
import { uploadDocument } from '@/lib/api/uploads';
import { assignmentSubmissionPollInterval, learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { HtmlContent } from '@/components/editor/html-content';

export function AssignmentLesson({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete?: () => void;
}) {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', lessonId],
    queryFn: () => getAssignmentByLesson(lessonId, token),
    enabled: !!token,
  });

  const { data: mySubmission, refetch: refetchSubmission } = useQuery({
    queryKey: learningKeys.submissionMine(assignment?.id ?? ''),
    queryFn: () => getMySubmission(assignment!.id, token),
    enabled: !!token && !!assignment?.id,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => assignmentSubmissionPollInterval(query.state.data),
  });

  const {
    text,
    setText,
    clearDraft,
    restored,
    lastSaved,
  } = useTextDraft(
    draftKey('assignment', lessonId),
    '',
    { enabled: !!lessonId, onRestore: () => toast.info('Restored unsaved assignment draft') },
  );

  useEffect(() => {
    if (mySubmission?.gradedAt && mySubmission.score != null) {
      onComplete?.();
    }
  }, [mySubmission?.gradedAt, mySubmission?.score, onComplete]);

  async function refreshAfterSubmit() {
    await refetchSubmission();
    await queryClient.invalidateQueries({ queryKey: ['progress'] });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment) return;
    setSubmitting(true);
    try {
      await submitAssignment(assignment.id, token, { textContent: text.trim() });
      clearDraft();
      toast.success('Assignment submitted — waiting for trainer review');
      await refreshAfterSubmit();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFile(file: File) {
    if (!assignment) return;
    setSubmitting(true);
    try {
      const uploaded = await uploadDocument(file, token);
      await submitAssignment(assignment.id, token, { fileUrl: uploaded.url, textContent: text.trim() || undefined });
      clearDraft();
      toast.success('File submitted — waiting for trainer review');
      await refreshAfterSubmit();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading assignment…</p>;
  if (!assignment) return <p className="text-sm text-muted-foreground">No assignment for this lesson.</p>;

  const isGraded = mySubmission?.gradedAt != null && mySubmission.score != null;
  const isPending = mySubmission && !isGraded;

  if (isGraded) {
    return (
      <div className="space-y-4 rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-2 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <h3 className="font-bold">Assignment graded</h3>
        </div>
        <p className="text-sm text-green-900">
          Score: <strong>{mySubmission.score}</strong> / {assignment.maxScore}
        </p>
        {mySubmission.feedback && (
          <p className="text-sm text-green-800">{mySubmission.feedback}</p>
        )}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2 text-amber-900">
          <Clock className="h-5 w-5" />
          <h3 className="font-bold">Submitted — awaiting review</h3>
        </div>
        <p className="text-sm text-amber-800">
          Your trainer will grade this assignment. You will be able to complete the course once it is approved.
        </p>
        {mySubmission.textContent && (
          <div className="rounded-lg border border-amber-200 bg-white p-3 text-sm text-foreground">
            {mySubmission.textContent}
          </div>
        )}
        <p className="text-xs text-amber-700">
          Submitted {new Date(mySubmission.submittedAt).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-5">
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />
      <h3 className="font-bold">{assignment.title}</h3>
      <HtmlContent html={assignment.instructions} className="text-muted-foreground" />
      {assignment.dueDate && (
        <p className="text-xs text-amber-700">Due {new Date(assignment.dueDate).toLocaleString()}</p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Your answer…"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark">Submit for review</Button>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
          Attach file
          <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </label>
      </div>
    </form>
  );
}
