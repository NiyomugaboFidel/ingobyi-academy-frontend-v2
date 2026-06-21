'use client';

import Link from 'next/link';
import {
  BookOpen, Clock, GraduationCap, History, Search, Sparkles, Tag, X,
} from 'lucide-react';
import type {
  CatalogSuggestions,
  SearchSuggestionCategory,
  SearchSuggestionCourse,
} from '@/lib/api/catalog';
import type { RecentSearch } from '@/lib/search/history';
import { saveRecentSearch } from '@/lib/search/history';
import { cn } from '@/lib/utils';

function formatPrice(price?: string | null) {
  if (!price || Number(price) === 0) return 'Free';
  return `RWF ${Number(price).toLocaleString()}`;
}

function SuggestionCourseCard({
  course,
  onSelect,
  compact = false,
}: {
  course: SearchSuggestionCourse;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const abbr = course.title
    .split(/\s+/)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Link
      href={`/catalog/${course.slug}`}
      onClick={onSelect}
      className={cn(
        'group flex overflow-hidden rounded-xl border border-brand-green/10 bg-white transition hover:border-brand-green/25 hover:shadow-md',
        compact ? 'gap-2 p-2' : 'gap-3 p-3',
      )}
    >
      <div className={cn(
        'relative shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-green to-brand-green-dark',
        compact ? 'h-14 w-20' : 'h-16 w-24',
      )}>
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-extrabold text-white/50">
            {abbr}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('line-clamp-2 font-semibold text-brand-ink group-hover:text-brand-green', compact ? 'text-xs' : 'text-sm')}>
          {course.title}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[11px] text-brand-muted">
          {course.category?.name ?? course.org?.name ?? 'Ingobyi Academy'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-brand-green">
          <span>{formatPrice(course.price)}</span>
          {course.level && <span className="text-brand-muted">{course.level.toLowerCase()}</span>}
        </div>
      </div>
    </Link>
  );
}

function QueryCard({
  label,
  href,
  icon: Icon,
  sublabel,
  onSelect,
  saveQuery = false,
}: {
  label: string;
  href: string;
  icon: typeof Search;
  sublabel?: string;
  onSelect?: () => void;
  saveQuery?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={() => {
        if (saveQuery) saveRecentSearch(label);
        onSelect?.();
      }}
      className="flex items-center gap-3 rounded-xl border border-brand-green/10 bg-white p-3 transition hover:border-brand-green/25 hover:bg-brand-green/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-brand-ink">{label}</p>
        {sublabel && <p className="truncate text-[11px] text-brand-muted">{sublabel}</p>}
      </div>
    </Link>
  );
}

type SearchSuggestionsPanelProps = {
  query: string;
  suggestions: CatalogSuggestions | null;
  recentSearches: RecentSearch[];
  loading?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  onClearRecent?: () => void;
  onRemoveRecent?: (query: string) => void;
};

export function SearchSuggestionsPanel({
  query,
  suggestions,
  recentSearches,
  loading = false,
  compact = false,
  onSelect,
  onClearRecent,
  onRemoveRecent,
}: SearchSuggestionsPanelProps) {
  const trimmed = query.trim();
  const hasRecent = recentSearches.length > 0;
  const hasCourses = (suggestions?.courses.length ?? 0) > 0;
  const hasCategories = (suggestions?.categories.length ?? 0) > 0;
  const hasTopics = (suggestions?.topics.length ?? 0) > 0;
  const hasPopular = (suggestions?.popularTerms.length ?? 0) > 0;
  const showEmpty = !loading && !hasRecent && !hasCourses && !hasCategories && !hasTopics && !hasPopular;

  return (
    <div className={cn(
      'overflow-auto rounded-xl border border-brand-green/10 bg-white text-brand-ink shadow-xl',
      compact ? 'max-h-[min(70vh,28rem)] p-3' : 'max-h-[min(75vh,32rem)] p-4',
    )}>
      {loading ? (
        <div className="space-y-3 p-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl bg-brand-canvas" />
          ))}
        </div>
      ) : showEmpty ? (
        <p className="px-2 py-4 text-sm text-brand-muted">Start typing to see course and topic suggestions.</p>
      ) : (
        <div className="space-y-5">
          {hasRecent && (
            <section>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-muted">
                  <History className="h-3.5 w-3.5" /> Recent searches
                </h3>
                {onClearRecent && (
                  <button
                    type="button"
                    onClick={onClearRecent}
                    className="text-[11px] font-semibold text-brand-green hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {recentSearches.map((item) => (
                  <div key={item.query} className="relative">
                    <QueryCard
                      label={item.query}
                      href={`/search?q=${encodeURIComponent(item.query)}`}
                      icon={History}
                      sublabel="From your search history"
                      onSelect={onSelect}
                    />
                    {onRemoveRecent && (
                      <button
                        type="button"
                        aria-label={`Remove ${item.query}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onRemoveRecent(item.query);
                        }}
                        className="absolute right-2 top-2 rounded-full p-1 text-brand-muted hover:bg-brand-canvas hover:text-brand-ink"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasPopular && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-muted">
                <Sparkles className="h-3.5 w-3.5" />
                {trimmed ? 'Suggested searches' : 'Popular searches'}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions!.popularTerms.map((term) => (
                  <QueryCard
                    key={term}
                    label={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    icon={Search}
                    sublabel={trimmed ? 'Matches your search' : 'Trending in catalog'}
                    onSelect={onSelect}
                    saveQuery
                  />
                ))}
              </div>
            </section>
          )}

          {hasCategories && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-muted">
                <GraduationCap className="h-3.5 w-3.5" /> Categories
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestions!.categories.map((category: SearchSuggestionCategory) => (
                  <QueryCard
                    key={category.slug}
                    label={category.name}
                    href={`/search?category=${encodeURIComponent(category.slug)}`}
                    icon={GraduationCap}
                    sublabel={
                      category.courseCount != null
                        ? `${category.courseCount} course${category.courseCount === 1 ? '' : 's'}`
                        : 'Browse category'
                    }
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </section>
          )}

          {hasCourses && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-muted">
                <BookOpen className="h-3.5 w-3.5" /> Courses
              </h3>
              <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2')}>
                {suggestions!.courses.map((course) => (
                  <SuggestionCourseCard
                    key={course.id}
                    course={course}
                    compact={compact}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </section>
          )}

          {hasTopics && (
            <section>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-muted">
                <Tag className="h-3.5 w-3.5" /> Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions!.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/search?q=${encodeURIComponent(topic)}`}
                    onClick={() => {
                      saveRecentSearch(topic);
                      onSelect?.();
                    }}
                    className="rounded-full border border-brand-green/15 bg-brand-green/5 px-3 py-1.5 text-xs font-semibold text-brand-green transition hover:bg-brand-green/10"
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {trimmed && (
            <section className="border-t border-brand-green/10 pt-3">
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                onClick={() => {
                  saveRecentSearch(trimmed);
                  onSelect?.();
                }}
                className="flex items-center justify-between rounded-xl bg-brand-green px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-green-dark"
              >
                <span>See all results for &ldquo;{trimmed}&rdquo;</span>
                <Clock className="h-4 w-4 opacity-80" />
              </Link>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
