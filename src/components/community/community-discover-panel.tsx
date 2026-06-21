'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Sparkles, TrendingUp, Users } from 'lucide-react';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { CommunityPersonRow } from '@/components/community/community-person-row';
import {
  getPeopleYouMayKnow,
  getPopularCommunityPeople,
  searchCommunityPeople,
} from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

type Props = {
  token: string;
  currentUserId?: string;
};

export function CommunityDiscoverPanel({ token, currentUserId }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const invalidatePeople = () => {
    void queryClient.invalidateQueries({ queryKey: ['community', 'people'] });
    void queryClient.invalidateQueries({ queryKey: ['community', 'following'] });
  };

  const {
    data: suggestions = [],
    isLoading: loadingSuggestions,
  } = useQuery({
    queryKey: ['community', 'people', 'suggestions'],
    queryFn: () => getPeopleYouMayKnow(token),
    enabled: !!token && !debounced,
  });

  const {
    data: popular = [],
    isLoading: loadingPopular,
  } = useQuery({
    queryKey: ['community', 'people', 'popular'],
    queryFn: () => getPopularCommunityPeople(token),
    enabled: !!token && !debounced,
  });

  const {
    data: searchResults,
    isLoading: loadingSearch,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ['community', 'people', 'search', debounced],
    queryFn: () => searchCommunityPeople(token, debounced, 1, 20),
    enabled: !!token && debounced.length >= 2,
  });

  const isSearching = debounced.length >= 2;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people by name or email…"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-brand-green/40 focus:ring-2 focus:ring-brand-green/10"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Find learners, trainers, and admins in your organization.
        </p>
      </div>

      {isSearching ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">
              Search results
              {searchResults?.meta.total != null && (
                <span className="ml-2 font-normal text-muted-foreground">
                  ({searchResults.meta.total})
                </span>
              )}
            </h2>
          </div>
          {searchError && (
            <div className="p-4">
              <ApiErrorBanner message={getErrorMessage(searchError)} onRetry={() => refetchSearch()} />
            </div>
          )}
          {loadingSearch ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : searchResults?.data.length ? (
            <ul className="space-y-2 p-3">
              {searchResults.data.map((person) => (
                <li key={person.id}>
                  <CommunityPersonRow
                    person={person}
                    token={token}
                    currentUserId={currentUserId}
                    showReason={false}
                    onFollowChange={invalidatePeople}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              No people found for &ldquo;{debounced}&rdquo;. Try another name.
            </p>
          )}
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Sparkles className="h-4 w-4 text-brand-green" />
              <h2 className="text-sm font-bold text-foreground">People you may know</h2>
            </div>
            {loadingSuggestions ? (
              <div className="grid gap-2 p-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : suggestions.length ? (
              <ul className={cn('grid gap-2 p-3', 'sm:grid-cols-2')}>
                {suggestions.map((person) => (
                  <li key={person.id}>
                    <CommunityPersonRow
                      person={person}
                      token={token}
                      currentUserId={currentUserId}
                      compact
                      onFollowChange={invalidatePeople}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                Follow more people or join courses to get personalized suggestions.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <TrendingUp className="h-4 w-4 text-brand-green" />
              <h2 className="text-sm font-bold text-foreground">Popular in community</h2>
            </div>
            {loadingPopular ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2 p-3">
                {popular.map((person) => (
                  <li key={person.id}>
                    <CommunityPersonRow
                      person={person}
                      token={token}
                      currentUserId={currentUserId}
                      onFollowChange={invalidatePeople}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-dashed border-brand-green/25 bg-brand-mint-wash/30 p-5 text-center">
            <Users className="mx-auto h-8 w-8 text-brand-green/70" />
            <p className="mt-2 text-sm font-semibold text-brand-ink">Grow your network</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow trainers and classmates to see their posts and message them directly.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
