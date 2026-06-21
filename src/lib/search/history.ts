const STORAGE_KEY = 'ia_search_history_v1';
const MAX_ITEMS = 12;

export type RecentSearch = {
  query: string;
  searchedAt: number;
};

function readAll(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: RecentSearch[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore quota errors */
  }
}

export function listRecentSearches(limit = MAX_ITEMS): RecentSearch[] {
  return readAll()
    .sort((a, b) => b.searchedAt - a.searchedAt)
    .slice(0, limit);
}

export function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const next = [
    { query: trimmed, searchedAt: Date.now() },
    ...readAll().filter((item) => item.query.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, MAX_ITEMS);
  writeAll(next);
}

export function removeRecentSearch(query: string) {
  writeAll(readAll().filter((item) => item.query !== query));
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function filterRecentSearches(query: string, limit = 6): RecentSearch[] {
  const q = query.trim().toLowerCase();
  const items = listRecentSearches();
  if (!q) return items.slice(0, limit);
  return items
    .filter((item) => item.query.toLowerCase().includes(q))
    .slice(0, limit);
}
