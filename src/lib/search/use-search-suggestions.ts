'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSearchSuggestions, type CatalogSuggestions } from '@/lib/api/catalog';
import {
  filterRecentSearches,
  listRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
} from '@/lib/search/history';

export function useSearchSuggestions(query: string, enabled = true) {
  const [suggestions, setSuggestions] = useState<CatalogSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentVersion, setRecentVersion] = useState(0);

  const trimmed = query.trim();
  const recentSearches = useMemo(() => {
    void recentVersion;
    return filterRecentSearches(trimmed, 6);
  }, [trimmed, recentVersion]);

  useEffect(() => {
    if (!enabled) {
      setSuggestions(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getSearchSuggestions(trimmed || undefined)
      .then((result) => {
        if (!cancelled) setSuggestions(result);
      })
      .catch(() => {
        if (!cancelled) setSuggestions(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed, enabled]);

  return {
    suggestions,
    loading,
    recentSearches,
    refreshRecent: () => setRecentVersion((value) => value + 1),
    clearRecent: () => {
      clearRecentSearches();
      setRecentVersion((value) => value + 1);
    },
    removeRecent: (term: string) => {
      removeRecentSearch(term);
      setRecentVersion((value) => value + 1);
    },
  };
}
