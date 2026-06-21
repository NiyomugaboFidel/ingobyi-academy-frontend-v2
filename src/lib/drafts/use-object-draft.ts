'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isDraftEmpty, loadDraft, removeDraft, saveDraft } from './storage';

type Options<T> = {
  debounceMs?: number;
  enabled?: boolean;
  onRestore?: (draft: T) => void;
};

export function useObjectDraft<T extends Record<string, unknown>>(
  key: string,
  initial: T,
  options?: Options<T>,
) {
  const enabled = options?.enabled ?? true;
  const [value, setValue] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const saved = loadDraft<T>(key);
    if (saved && !isDraftEmpty(saved)) {
      skipNextSave.current = true;
      setValue(saved);
      setRestored(true);
      options?.onRestore?.(saved);
    }
    hydrated.current = true;
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || !hydrated.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (isDraftEmpty(value)) {
        removeDraft(key);
        setLastSaved(null);
        return;
      }
      saveDraft(key, value);
      setLastSaved(new Date());
      setRestored(false);
    }, options?.debounceMs ?? 800);
    return () => clearTimeout(timer);
  }, [key, value, enabled, options?.debounceMs]);

  const clearDraft = useCallback(() => {
    removeDraft(key);
    setRestored(false);
    setLastSaved(null);
  }, [key]);

  const reset = useCallback((next: T) => {
    skipNextSave.current = true;
    setValue(next);
    setRestored(false);
  }, []);

  return { value, setValue, clearDraft, reset, restored, lastSaved };
}
