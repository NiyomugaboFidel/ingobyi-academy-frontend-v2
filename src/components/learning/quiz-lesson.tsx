'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { getQuiz, submitQuiz } from '@/lib/api/quizzes';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { toast } from 'sonner';

export function QuizLesson({
  lessonId,
  onComplete,
}: {
  lessonId: string;
  onComplete: () => void;
}) {
  const token = useAuthStore((s) => s.accessToken)!;
  const [result, setResult] = useState<{ score: number; isPassed: boolean; passingScore: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    value: answers,
    setValue: setAnswers,
    clearDraft,
    restored,
    lastSaved,
  } = useObjectDraft<Record<string, number>>(
    draftKey('quiz', lessonId),
    {},
    {
      enabled: !!lessonId && !result,
      onRestore: () => toast.info('Restored your quiz answers'),
    },
  );

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: () => getQuiz(lessonId, token),
    enabled: !!token,
  });

  async function handleSubmit() {
    if (!quiz) return;
    const ordered = quiz.questions.map((q) => answers[q.id] ?? -1);
    if (ordered.some((a) => a < 0)) {
      toast.error('Please answer every question before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitQuiz(lessonId, token, ordered);
      clearDraft();
      setResult({ score: res.score, isPassed: res.isPassed, passingScore: res.passingScore });
      if (res.isPassed) onComplete();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not submit quiz'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setResult(null);
    setAnswers({});
    clearDraft();
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading quiz…</p>;
  if (!quiz) return <p className="text-sm text-red-600">Quiz unavailable.</p>;

  if (result) {
    return (
      <div className={`rounded-xl border p-6 text-center ${result.isPassed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        {result.isPassed ? <CheckCircle className="mx-auto h-10 w-10 text-green-600" /> : <XCircle className="mx-auto h-10 w-10 text-amber-600" />}
        <p className="mt-2 text-lg font-bold">{result.score}%</p>
        <p className="text-sm text-muted-foreground">
          {result.isPassed ? 'You passed!' : `Need ${result.passingScore}% to pass. Try again.`}
        </p>
        {!result.isPassed && (
          <Button className="mt-4" size="sm" onClick={handleRetry}>Retry</Button>
        )}
      </div>
    );
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-brand-green/15 bg-brand-green/5 px-4 py-3">
        <p className="text-sm font-semibold text-brand-green">Multiple choice quiz</p>
        <p className="text-xs text-muted-foreground">Choose one answer per question. Passing score: {quiz.passingScore ?? 70}%</p>
      </div>
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />
      {quiz.questions.map((q, qi) => (
        <fieldset key={q.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <legend className="px-1 text-sm font-bold text-foreground">
            Question {qi + 1} of {quiz.questions.length}
          </legend>
          <p className="mb-4 text-sm leading-relaxed text-foreground">{q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <label
                  key={oi}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                    selected
                      ? 'border-brand-green bg-brand-green/8 font-medium text-brand-green'
                      : 'border-border hover:border-brand-green/30 hover:bg-muted/40'
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected ? 'bg-brand-green text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {letters[oi] ?? oi + 1}
                  </span>
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected}
                    onChange={() => setAnswers({ ...answers, [q.id]: oi })}
                    className="sr-only"
                  />
                  <span className="flex-1">{opt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
      <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-brand-green hover:bg-brand-green-dark sm:w-auto">
        {submitting ? 'Submitting…' : 'Submit answers'}
      </Button>
    </div>
  );
}
