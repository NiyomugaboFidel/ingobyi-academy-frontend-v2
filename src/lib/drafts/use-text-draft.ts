'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isDraftEmpty, loadDraft, removeDraft, saveDraft } from './storage';

type Options = {
  debounceMs?: number;
  enabled?: boolean;
  onRestore?: () => void;
};

export function useTextDraft(key: string, defaultValue = '', options?: Options) {
  const enabled = options?.enabled ?? true;
  const [text, setText] = useState(defaultValue);
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const saved = loadDraft<string>(key);
    if (saved !== null && saved.trim()) {
      setText(saved);
      setRestored(true);
      options?.onRestore?.();
    }
    hydrated.current = true;
  }, [key, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled || !hydrated.current) return;
    const timer = setTimeout(() => {
      if (isDraftEmpty(text)) {
        removeDraft(key);
        setLastSaved(null);
        return;
      }
      saveDraft(key, text);
      setLastSaved(new Date());
      setRestored(false);
    }, options?.debounceMs ?? 600);
    return () => clearTimeout(timer);
  }, [key, text, enabled, options?.debounceMs]);

  const clearDraft = useCallback(() => {
    removeDraft(key);
    setRestored(false);
    setLastSaved(null);
  }, [key]);

  return { text, setText, clearDraft, restored, lastSaved };
}
