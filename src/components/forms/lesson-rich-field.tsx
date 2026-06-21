'use client';

import { useEffect, useRef, useState } from 'react';
import { draftKey, loadDraft, removeDraft, saveDraft } from '@/lib/drafts/storage';
import { DraftBadge } from '@/components/ui/draft-badge';
import { RichTextEditor, type RichTextSize } from '@/components/editor/rich-text-editor';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { isHtmlEmpty } from '@/lib/utils/html';

type Props = {
  courseId: string;
  lessonId: string;
  field: 'content' | 'description';
  defaultValue?: string;
  placeholder?: string;
  size?: RichTextSize;
  onSave: (value: string) => Promise<void>;
};

export function LessonRichField({
  courseId,
  lessonId,
  field,
  defaultValue = '',
  placeholder,
  size = 'lg',
  onSave,
}: Props) {
  const storageKey = draftKey('lesson', courseId, lessonId, field);
  const [value, setValue] = useState(defaultValue || '<p></p>');
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);
  const saving = useRef(false);

  useEffect(() => {
    setValue(defaultValue || '<p></p>');
  }, [defaultValue, lessonId]);

  useEffect(() => {
    const draft = loadDraft<string>(storageKey);
    if (draft !== null && draft !== defaultValue && !isHtmlEmpty(draft)) {
      setValue(draft);
      setRestored(true);
      toast.info('Restored unsaved lesson draft', { id: storageKey, duration: 2500 });
    }
    hydrated.current = true;
  }, [storageKey, defaultValue]);

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
    if (value === defaultValue || saving.current) return;
    saving.current = true;
    try {
      await onSave(value);
      removeDraft(storageKey);
      setLastSaved(null);
      setRestored(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save lesson field'));
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

  return (
    <div className="mt-2 space-y-1.5">
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={discardDraft} />
      <RichTextEditor
        value={value}
        onChange={setValue}
        onBlur={handleBlur}
        placeholder={placeholder}
        size={size}
      />
    </div>
  );
}
