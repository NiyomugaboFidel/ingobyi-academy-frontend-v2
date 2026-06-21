'use client';

import { useEffect, useRef, useState } from 'react';
import { draftKey, loadDraft, removeDraft, saveDraft } from '@/lib/drafts/storage';
import { DraftBadge } from '@/components/ui/draft-badge';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';

type Props = {
  courseId: string;
  lessonId: string;
  field: 'videoUrl' | 'content';
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
  mono?: boolean;
  onSave: (value: string) => Promise<void>;
};

export function LessonDraftField({
  courseId,
  lessonId,
  field,
  defaultValue = '',
  rows = 4,
  placeholder,
  className,
  mono,
  onSave,
}: Props) {
  const storageKey = draftKey('lesson', courseId, lessonId, field);
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
      toast.info('Restored unsaved lesson draft', { id: storageKey, duration: 2500 });
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
      toast.error(getErrorMessage(err, 'Could not save lesson field'));
    }
  }

  function discardDraft() {
    removeDraft(storageKey);
    setValue(defaultValue);
    setRestored(false);
    setLastSaved(null);
  }

  const Input = field === 'content' && rows > 4 ? 'textarea' : field === 'content' ? 'textarea' : 'input';

  return (
    <div className="mt-2 space-y-1">
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={discardDraft} />
      {Input === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          rows={rows}
          placeholder={placeholder}
          className={className ?? `w-full rounded border border-border px-2 py-1 text-xs ${mono ? 'font-mono' : ''}`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={className ?? 'mt-2 w-full rounded border border-border px-2 py-1 text-xs'}
        />
      )}
    </div>
  );
}
