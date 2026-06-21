'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssignmentByLesson, updateAssignment } from '@/lib/api/assignments';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey, loadDraft, removeDraft, saveDraft } from '@/lib/drafts/storage';
import { DraftBadge } from '@/components/ui/draft-badge';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { isHtmlEmpty } from '@/lib/utils/html';

type Props = {
  lessonId: string;
  onSaved?: () => void;
};

export function AssignmentInstructionsField({ lessonId, onSaved }: Props) {
  const token = useAuthStore((s) => s.accessToken)!;
  const storageKey = draftKey('assignment', lessonId, 'instructions');
  const [value, setValue] = useState('<p></p>');
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);
  const saving = useRef(false);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', lessonId],
    queryFn: () => getAssignmentByLesson(lessonId, token),
    enabled: !!token && !!lessonId,
  });

  const defaultValue = assignment?.instructions ?? '';

  useEffect(() => {
    if (!assignment) return;
    setValue(assignment.instructions || '<p></p>');
  }, [assignment?.id, assignment?.instructions]);

  useEffect(() => {
    if (!assignment || hydrated.current) return;
    const draft = loadDraft<string>(storageKey);
    if (draft !== null && draft !== defaultValue && !isHtmlEmpty(draft)) {
      setValue(draft);
      setRestored(true);
      toast.info('Restored unsaved assignment draft', { id: storageKey, duration: 2500 });
    }
    hydrated.current = true;
  }, [storageKey, defaultValue, assignment]);

  useEffect(() => {
    hydrated.current = false;
  }, [lessonId]);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = setTimeout(() => {
      if (isHtmlEmpty(value) || value === defaultValue) {
        removeDraft(storageKey);
        setLastSaved(null);
        return;
      }
      saveDraft(storageKey, value);
      setLastSaved(new Date());
      setRestored(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [value, defaultValue, storageKey]);

  async function handleBlur() {
    if (!assignment || value === defaultValue || saving.current) return;
    saving.current = true;
    try {
      await updateAssignment(token, assignment.id, { instructions: value });
      onSaved?.();
      removeDraft(storageKey);
      setLastSaved(null);
      setRestored(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save assignment'));
    } finally {
      saving.current = false;
    }
  }

  function discardDraft() {
    removeDraft(storageKey);
    setValue(defaultValue || '<p></p>');
    setRestored(false);
    setLastSaved(null);
  }

  if (isLoading) {
    return <p className="mt-2 text-xs text-muted-foreground">Loading assignment…</p>;
  }

  if (!assignment) {
    return <p className="mt-2 text-xs text-muted-foreground">No assignment linked to this lesson.</p>;
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Instructions</p>
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={discardDraft} />
      <RichTextEditor
        value={value}
        onChange={setValue}
        onBlur={handleBlur}
        placeholder="Describe what students should submit…"
        size="md"
      />
    </div>
  );
}
