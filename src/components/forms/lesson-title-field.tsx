'use client';

import { useEffect, useRef, useState } from 'react';
import { draftKey, loadDraft, removeDraft, saveDraft } from '@/lib/drafts/storage';
import { DraftBadge } from '@/components/ui/draft-badge';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';

type Props = {
  courseId: string;
  lessonId: string;
  defaultValue?: string;
  onSave: (value: string) => Promise<void>;
};

export function LessonTitleField({ courseId, lessonId, defaultValue = '', onSave }: Props) {
  const storageKey = draftKey('lesson', courseId, lessonId, 'title');
  const [value, setValue] = useState(defaultValue);
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, lessonId]);

  useEffect(() => {
    const draft = loadDraft<string>(storageKey);
    if (draft !== null && draft !== defaultValue) {
      setValue(draft);
      setRestored(true);
      toast.info('Restored unsaved lesson title', { id: storageKey, duration: 2500 });
    }
    hydrated.current = true;
  }, [storageKey, defaultValue]);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = setTimeout(() => {
      if (!value.trim() || value === defaultValue) {
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
    if (value === defaultValue) return;
    try {
      await onSave(value);
      removeDraft(storageKey);
      setLastSaved(null);
      setRestored(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save lesson title'));
    }
  }

  function discardDraft() {
    removeDraft(storageKey);
    setValue(defaultValue);
    setRestored(false);
    setLastSaved(null);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={discardDraft} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full rounded border border-border px-2 py-1 text-sm font-medium"
      />
    </div>
  );
}
