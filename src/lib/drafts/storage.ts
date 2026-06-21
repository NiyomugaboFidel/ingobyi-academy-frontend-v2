const PREFIX = 'ia_draft_';

type DraftEnvelope<T> = {
  data: T;
  savedAt: number;
};

export function draftKey(...parts: string[]) {
  return `${PREFIX}${parts.join('_')}`;
}

export function loadDraft<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    return parsed?.data ?? null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    const envelope: DraftEnvelope<T> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function removeDraft(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function hasDraft(key: string) {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}

export function isDraftEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((v) => isDraftEmpty(v));
  }
  return false;
}
