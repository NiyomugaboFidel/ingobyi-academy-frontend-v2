'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, ChevronDown, Check, Star, Clock, BookOpen,
  Users, BarChart3, X, SlidersHorizontal, Tag,
} from 'lucide-react';
import { ExploreNav } from '@/components/layout/explore-nav';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories, searchCatalog, type CatalogSearchParams } from '@/lib/api/catalog';
import type { Course } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/errors';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { SearchSuggestionsPanel } from '@/components/search/search-suggestions-panel';
import { saveRecentSearch } from '@/lib/search/history';
import { useSearchSuggestions } from '@/lib/search/use-search-suggestions';

/* ────────────────────── constants ────────────────────── */
const LEVELS = [
  { slug: 'beginner', label: 'Beginner' },
  { slug: 'intermediate', label: 'Intermediate' },
  { slug: 'advanced', label: 'Advanced' },
  { slug: 'all-levels', label: 'All levels' },
];
const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'French' },
  { code: 'sw', label: 'Swahili' },
];
const DURATION_OPTIONS = [
  { slug: '0-1', label: '0–1 hour' },
  { slug: '1-3', label: '1–3 hours' },
  { slug: '3-6', label: '3–6 hours' },
  { slug: '6-17', label: '6–17 hours' },
  { slug: '17+', label: '17+ hours' },
];
const RATINGS = [
  { min: 4.5, label: '4.5 & up' },
  { min: 4.0, label: '4.0 & up' },
  { min: 3.5, label: '3.5 & up' },
  { min: 3.0, label: '3.0 & up' },
];
const SORT_OPTIONS = [
  { id: 'relevance', label: 'Most relevant' },
  { id: 'popular', label: 'Most popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'title', label: 'Title A–Z' },
];

/* ────────────────────── helpers ────────────────────── */
function parseCsvSet(value: string | null): Record<string, boolean> {
  if (!value) return {};
  return Object.fromEntries(
    value.split(',').filter(Boolean).map((item) => [item.trim(), true]),
  );
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min total`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m total` : `${hours}h total`;
}

function formatLevel(level?: string | null): string {
  if (!level) return 'All levels';
  return level.charAt(0) + level.slice(1).toLowerCase();
}

function StarRating({ value, count }: { value?: number; count?: number }) {
  const v = value ?? 0;
  const rounded = Math.round(v * 2) / 2;
  return (
    <span className="flex items-center gap-1">
      <span className="text-xs font-bold text-amber-700">{v > 0 ? v.toFixed(1) : '–'}</span>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = i <= rounded;
          return <Star key={i} className={cn('h-3 w-3', fill ? 'fill-amber-700 text-amber-700' : 'fill-gray-200 text-gray-200')} />;
        })}
      </span>
      {typeof count === 'number' && count > 0 && (
        <span className="text-xs text-gray-500">({count.toLocaleString()})</span>
      )}
    </span>
  );
}

function Thumbnail({ title, url, className }: { title: string; url?: string | null; className?: string }) {
  if (url) return (
    <div className={cn('shrink-0 overflow-hidden bg-gray-200', className)}>
      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
  const abbr = title.split(/\s+/).slice(0, 4).map((w) => w[0]?.toUpperCase() ?? '').join('').slice(0, 4);
  return (
    <div className={cn('flex shrink-0 items-center justify-center bg-gradient-to-br from-brand-green to-brand-green-dark', className)}>
      <span className="px-2 text-center text-sm font-extrabold text-white/40">{abbr || title.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

/* ────────────────────── filter section ────────────────────── */
function FilterSection({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 py-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-sm font-bold text-gray-800">{title}</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange, count }: {
  label: string; checked: boolean; onChange: () => void; count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 group">
      <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center border', checked ? 'border-brand-green bg-brand-green' : 'border-gray-400 bg-white group-hover:border-gray-600')}>
        {checked && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      {typeof count === 'number' && <span className="text-xs text-gray-400">({count.toLocaleString()})</span>}
    </label>
  );
}

function isRecentlyUpdated(course: Course): boolean {
  if (!course.updatedAt) return false;
  const updated = new Date(course.updatedAt).getTime();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return updated >= thirtyDaysAgo;
}

/* ────────────────────── course row (Udemy-style) ────────────────────── */
function CourseRow({ course }: { course: Course }) {
  const price = course.price ? `RWF ${Number(course.price).toLocaleString()}` : 'Free';
  const lessonCount = course.lessonCount ?? course.modules?.reduce((a, m) => a + m.lessons.length, 0) ?? 0;
  const durationLabel = formatDuration(course.totalDurationMinutes ?? lessonCount * 15);
  const showNew = isRecentlyUpdated(course);

  return (
    <Link href={`/catalog/${course.slug}`} className="group flex gap-0 border-b border-gray-200 py-4 hover:bg-gray-50/50 transition-colors">
      {/* Thumbnail */}
      <Thumbnail title={course.title} url={course.thumbnailUrl} className="h-[135px] w-[240px]" />

      {/* Middle */}
      <div className="min-w-0 flex-1 px-4">
        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900 group-hover:text-brand-green">
          {course.title}
        </h3>
        {/* Desc */}
        {course.shortDescription && (
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{course.shortDescription}</p>
        )}
        {/* Instructor */}
        <p className="mt-1 text-xs text-gray-500">
          {course.org?.name ?? 'Ingobyi Academy'}
        </p>
        {/* Rating */}
        {(course.avgRating != null || (course.reviewCount ?? 0) > 0) && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating value={course.avgRating ?? undefined} count={course.reviewCount} />
          </div>
        )}
        {/* Meta */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
          {durationLabel && (
            <>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {durationLabel}</span>
              <span>·</span>
            </>
          )}
          {lessonCount > 0 && (
            <>
              <span className="flex items-center gap-0.5"><BookOpen className="h-3 w-3" /> {lessonCount} lessons</span>
              <span>·</span>
            </>
          )}
          <span className="flex items-center gap-0.5"><BarChart3 className="h-3 w-3" /> {formatLevel(course.level)}</span>
        </div>
        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {course.type === 'OPEN' && (
            <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">Popular</span>
          )}
          {showNew && (
            <span className="rounded-sm bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">New</span>
          )}
          {course.category && (
            <span className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
              {course.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="shrink-0 w-24 text-right pl-2">
        <p className="text-base font-bold text-gray-900">{price}</p>
      </div>
    </Link>
  );
}

/* ────────────────────── main inner component ────────────────────── */
function SearchPageInner() {
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get('q') ?? '';
  const catParam = params.get('category') ?? params.get('categories') ?? '';
  const pageParam = params.get('page') ?? '1';

  const [searchInput, setSearchInput] = useState(q);
  const [categories, setCategories] = useState<Array<{ slug: string; label: string }>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(() => Math.max(1, Number(pageParam) || 1));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortId, setSortId] = useState(() => params.get('sort') ?? 'relevance');
  const [showSort, setShowSort] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const {
    suggestions,
    loading: suggestionsLoading,
    recentSearches,
    refreshRecent,
    clearRecent,
    removeRecent,
  } = useSearchSuggestions(searchInput, suggestOpen || !q);

  // filter state
  const [ratingMin, setRatingMin] = useState<number | null>(() => {
    const value = params.get('ratingMin');
    return value ? Number(value) : null;
  });
  const [durationSet, setDurationSet] = useState<Record<string, boolean>>(() => parseCsvSet(params.get('duration')));
  const [levelSet, setLevelSet] = useState<Record<string, boolean>>(() => parseCsvSet(params.get('levels') ?? params.get('level')));
  const [catSet, setCatSet] = useState<Record<string, boolean>>(() => parseCsvSet(catParam || null));
  const [langSet, setLangSet] = useState<Record<string, boolean>>(() => {
    const codes = parseCsvSet(params.get('language'));
    return Object.fromEntries(
      Object.keys(codes).map((code) => {
        const match = LANGUAGE_OPTIONS.find((option) => option.code === code);
        return [match?.label ?? code, true];
      }),
    );
  });
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>(() => {
    const value = params.get('price');
    return value === 'free' || value === 'paid' ? value : 'all';
  });
  const [showMoreLevels, setShowMoreLevels] = useState(false);
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [showMoreLangs, setShowMoreLangs] = useState(false);

  // section open state
  const [sections, setSections] = useState({
    rating: true, duration: true, level: true,
    category: true, language: false, price: true,
  });

  const sortRef = useRef<HTMLDivElement>(null);
  const skipUrlSync = useRef(true);

  const selectedLevels = Object.entries(levelSet).filter(([, v]) => v).map(([k]) => k).filter((k) => k !== 'all-levels');
  const selectedCats = Object.entries(catSet).filter(([, v]) => v).map(([k]) => k);
  const selectedLangs = Object.entries(langSet).filter(([, v]) => v).map(([k]) => k);
  const selectedDurs = Object.entries(durationSet).filter(([, v]) => v).map(([k]) => k);
  const selectedLangCodes = selectedLangs
    .map((label) => LANGUAGE_OPTIONS.find((option) => option.label === label)?.code ?? label)
    .filter(Boolean);
  const levelKey = selectedLevels.join(',');
  const catKey = selectedCats.join(',');
  const langKey = selectedLangCodes.join(',');
  const durKey = selectedDurs.join(',');

  const activeCount =
    (ratingMin != null ? 1 : 0) +
    selectedDurs.length +
    selectedLevels.length +
    selectedCats.length +
    selectedLangs.length +
    (priceFilter !== 'all' ? 1 : 0);

  const buildSearchParams = useCallback((): CatalogSearchParams => {
    const levels = levelKey ? levelKey.split(',') : [];
    const cats = catKey ? catKey.split(',') : [];
    return {
      ...(q ? { q } : {}),
      ...(levels.length === 1 ? { level: levels[0] } : levels.length > 1 ? { levels: levelKey } : {}),
      ...(cats.length === 1 ? { category: cats[0] } : cats.length > 1 ? { categories: catKey } : {}),
      ...(langKey ? { language: langKey } : {}),
      ...(durKey ? { duration: durKey } : {}),
      ...(ratingMin != null ? { ratingMin: String(ratingMin) } : {}),
      ...(priceFilter !== 'all' ? { price: priceFilter } : {}),
      ...(sortId !== 'relevance' ? { sort: sortId as CatalogSearchParams['sort'] } : {}),
      page: String(page),
      limit: 20,
    };
  }, [q, levelKey, catKey, langKey, durKey, ratingMin, priceFilter, sortId, page]);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchCatalog(buildSearchParams());
      setCourses(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setCourses([]);
      setTotal(0);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  useEffect(() => {
    getCategories()
      .then((items) => setCategories(items.map((item) => ({ slug: item.slug, label: item.name }))))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const buildBrowserQuery = useCallback((nextPage = page) => {
    const cats = catKey ? catKey.split(',') : [];
    const levels = levelKey ? levelKey.split(',') : [];
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (cats.length === 1) next.set('category', cats[0]!);
    else if (cats.length > 1) next.set('categories', catKey);
    if (levels.length === 1) next.set('level', levels[0]!);
    else if (levels.length > 1) next.set('levels', levelKey);
    if (langKey) next.set('language', langKey);
    if (durKey) next.set('duration', durKey);
    if (ratingMin != null) next.set('ratingMin', String(ratingMin));
    if (priceFilter !== 'all') next.set('price', priceFilter);
    if (sortId !== 'relevance') next.set('sort', sortId);
    if (nextPage > 1) next.set('page', String(nextPage));
    return next.toString();
  }, [q, catKey, levelKey, langKey, durKey, ratingMin, priceFilter, sortId, page]);

  const syncBrowserUrl = useCallback((nextPage = page) => {
    const nextQs = buildBrowserQuery(nextPage);
    const href = nextQs ? `/search?${nextQs}` : '/search';
    if (href !== `${window.location.pathname}${window.location.search}`) {
      router.replace(href, { scroll: false });
    }
  }, [buildBrowserQuery, page, router]);

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    syncBrowserUrl(page);
  }, [levelKey, catKey, langKey, durKey, ratingMin, priceFilter, sortId, page, syncBrowserUrl]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!sortRef.current?.contains(e.target as Node)) setShowSort(false);
      if (!searchWrapRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSuggestOpen(false);
    const trimmed = searchInput.trim();
    if (trimmed) saveRecentSearch(trimmed);
    refreshRecent();
    const next = new URLSearchParams();
    if (trimmed) next.set('q', trimmed);
    const qs = next.toString();
    router.push(qs ? `/search?${qs}` : '/search');
  }

  function clearAll() {
    setRatingMin(null);
    setDurationSet({});
    setLevelSet({});
    setCatSet({});
    setLangSet({});
    setPriceFilter('all');
    setSortId('relevance');
    setPage(1);
    router.replace(q ? `/search?q=${encodeURIComponent(q)}` : '/search', { scroll: false });
  }

  function goToPage(nextPage: number) {
    setPage(nextPage);
    syncBrowserUrl(nextPage);
  }

  const bumpFilters = () => setPage(1);

  const toggleSection = (key: keyof typeof sections) =>
    setSections((p) => ({ ...p, [key]: !p[key] }));

  /* chip row */
  const chips: { label: string; clear: () => void }[] = [
    ...(ratingMin != null ? [{ label: `${ratingMin}+ stars`, clear: () => { setRatingMin(null); bumpFilters(); } }] : []),
    ...selectedDurs.map((d) => ({
      label: DURATION_OPTIONS.find((o) => o.slug === d)?.label ?? d,
      clear: () => { setDurationSet((p) => ({ ...p, [d]: false })); bumpFilters(); },
    })),
    ...selectedLevels.map((l) => ({
      label: LEVELS.find((o) => o.slug === l)?.label ?? l,
      clear: () => { setLevelSet((p) => ({ ...p, [l]: false })); bumpFilters(); },
    })),
    ...selectedCats.map((c) => ({
      label: categories.find((o) => o.slug === c)?.label ?? c,
      clear: () => { setCatSet((p) => ({ ...p, [c]: false })); bumpFilters(); },
    })),
    ...selectedLangs.map((l) => ({
      label: l,
      clear: () => { setLangSet((p) => ({ ...p, [l]: false })); bumpFilters(); },
    })),
    ...(priceFilter !== 'all' ? [{ label: priceFilter === 'free' ? 'Free' : 'Paid', clear: () => { setPriceFilter('all'); bumpFilters(); } }] : []),
  ];

  const SidebarContent = (
    <div className="w-full">
      {activeCount > 0 && (
        <div className="mb-1 flex items-center justify-between py-2">
          <span className="text-sm font-bold text-gray-800">{activeCount} filter{activeCount > 1 ? 's' : ''}</span>
          <button type="button" onClick={clearAll} className="text-xs font-bold text-brand-green hover:underline">Clear all</button>
        </div>
      )}

      {/* Ratings */}
      <FilterSection title="Ratings" open={sections.rating} onToggle={() => toggleSection('rating')}>
        {RATINGS.map((r) => (
          <label key={r.min} className="flex cursor-pointer items-center gap-2.5 group">
            <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', ratingMin === r.min ? 'border-brand-green bg-brand-green' : 'border-gray-400 bg-white group-hover:border-gray-600')}>
              {ratingMin === r.min && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <input type="radio" name="rating" className="sr-only" checked={ratingMin === r.min} onChange={() => { setRatingMin(r.min); bumpFilters(); }} />
            <div className="flex flex-1 items-center gap-1.5">
              <div className="relative h-2 w-20 overflow-hidden rounded-sm bg-gray-200">
                <div className="absolute inset-y-0 left-0 bg-amber-400" style={{ width: `${(r.min / 5) * 100}%` }} />
              </div>
              <span className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={cn('h-2.5 w-2.5', i <= Math.floor(r.min) ? 'fill-amber-700 text-amber-700' : 'fill-gray-200 text-gray-200')} />
                ))}
              </span>
              <span className="text-xs text-gray-600">{r.label}</span>
            </div>
          </label>
        ))}
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Video Duration" open={sections.duration} onToggle={() => toggleSection('duration')}>
        {DURATION_OPTIONS.map((d) => (
          <FilterCheckbox
            key={d.slug} label={d.label}
            checked={!!durationSet[d.slug]}
            onChange={() => { setDurationSet((p) => ({ ...p, [d.slug]: !p[d.slug] })); bumpFilters(); }}
          />
        ))}
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level" open={sections.level} onToggle={() => toggleSection('level')}>
        {(showMoreLevels ? LEVELS : LEVELS.slice(0, 4)).map((l) => (
          <FilterCheckbox
            key={l.slug} label={l.label}
            checked={!!levelSet[l.slug]}
            onChange={() => { setLevelSet((p) => ({ ...p, [l.slug]: !p[l.slug] })); bumpFilters(); }}
          />
        ))}
      </FilterSection>

      {/* Category / Topic */}
      <FilterSection title="Topic" open={sections.category} onToggle={() => toggleSection('category')}>
        {(showMoreCats ? categories : categories.slice(0, 5)).map((c) => (
          <FilterCheckbox
            key={c.slug} label={c.label}
            checked={!!catSet[c.slug]}
            onChange={() => { setCatSet((p) => ({ ...p, [c.slug]: !p[c.slug] })); bumpFilters(); }}
          />
        ))}
        {categories.length > 5 && (
          <button type="button" onClick={() => setShowMoreCats((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline">
            {showMoreCats ? 'Show less' : `Show ${categories.length - 5} more`}
            <ChevronDown className={cn('h-3 w-3', showMoreCats && 'rotate-180')} />
          </button>
        )}
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language" open={sections.language} onToggle={() => toggleSection('language')}>
        {(showMoreLangs ? LANGUAGE_OPTIONS : LANGUAGE_OPTIONS.slice(0, 4)).map((l) => (
          <FilterCheckbox
            key={l.code} label={l.label}
            checked={!!langSet[l.label]}
            onChange={() => { setLangSet((p) => ({ ...p, [l.label]: !p[l.label] })); bumpFilters(); }}
          />
        ))}
        {LANGUAGE_OPTIONS.length > 4 && (
          <button type="button" onClick={() => setShowMoreLangs((v) => !v)}
            className="flex items-center gap-1 text-xs font-bold text-brand-green hover:underline">
            {showMoreLangs ? 'Show less' : `Show ${LANGUAGE_OPTIONS.length - 4} more`}
            <ChevronDown className={cn('h-3 w-3', showMoreLangs && 'rotate-180')} />
          </button>
        )}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price" open={sections.price} onToggle={() => toggleSection('price')}>
        {([['all', 'All'], ['free', 'Free'], ['paid', 'Paid']] as const).map(([val, lbl]) => (
          <label key={val} className="flex cursor-pointer items-center gap-2.5 group">
            <div className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', priceFilter === val ? 'border-brand-green bg-brand-green' : 'border-gray-400 bg-white group-hover:border-gray-600')}>
              {priceFilter === val && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <input type="radio" name="price" className="sr-only" checked={priceFilter === val} onChange={() => { setPriceFilter(val); bumpFilters(); }} />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">{lbl}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  );

  const primaryCategory = selectedCats[0] ?? catParam;
  const pageTitle = q
    ? `${total.toLocaleString()} results for "${q}"`
    : primaryCategory
    ? `${categories.find((c) => c.slug === primaryCategory)?.label ?? primaryCategory} Courses`
    : 'All Courses';

  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav showCatalogQuickNav />

      {/* ── Dark banner ── */}
      <div className="bg-brand-green text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-2 flex items-center gap-1 text-xs text-white/60">
            <Link href="/" className="hover:text-white hover:underline">Home</Link>
            <span>›</span>
            <Link href="/catalog" className="hover:text-white hover:underline">Courses</Link>
            {primaryCategory && (
              <>
                <span>›</span>
                <span className="text-white/80">{categories.find((c) => c.slug === primaryCategory)?.label ?? primaryCategory}</span>
              </>
            )}
            {q && (
              <>
                <span>›</span>
                <span className="text-white/80">{q}</span>
              </>
            )}
          </nav>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{pageTitle}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* ── Active filter chips ── */}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 py-3">
            <span className="text-xs font-semibold text-gray-500">Filters:</span>
            {chips.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={chip.clear}
                className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="text-xs font-bold text-brand-green hover:underline ml-1">
              Clear all
            </button>
          </div>
        )}

        {/* ── Main 2-col layout ── */}
        <div className="flex min-h-0 gap-8 py-6">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden w-[280px] shrink-0 lg:block">
            {SidebarContent}
          </aside>

          {/* ── Course list ── */}
          <div className="min-w-0 flex-1">
            {/* Top bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-700">
                <strong>{total.toLocaleString()}</strong> {total === 1 ? 'result' : 'results'}
                {q && <> for <span className="italic text-gray-900">&ldquo;{q}&rdquo;</span></>}
              </p>
              <div className="flex items-center gap-2">
                {/* Mobile filter */}
                <button
                  type="button"
                  onClick={() => setShowMobileFilter(true)}
                  className="flex items-center gap-1.5 rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 lg:hidden"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                  {activeCount > 0 && (
                    <span className="rounded-full bg-brand-green px-1.5 py-0.5 text-[10px] text-white">{activeCount}</span>
                  )}
                </button>
                {/* Sort */}
                <div className="relative flex items-center gap-1.5" ref={sortRef}>
                  <span className="hidden text-xs text-gray-500 sm:block">Sort by:</span>
                  <button
                    type="button"
                    onClick={() => setShowSort((v) => !v)}
                    className="flex min-w-44 items-center justify-between gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {SORT_OPTIONS.find((o) => o.id === sortId)?.label}
                    <ChevronDown className={cn('h-3.5 w-3.5 text-gray-500 transition-transform', showSort && 'rotate-180')} />
                  </button>
                  {showSort && (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded border border-gray-200 bg-white py-1 shadow-xl">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => { setSortId(o.id); bumpFilters(); setShowSort(false); }}
                          className={cn('flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-gray-50', sortId === o.id ? 'font-bold text-brand-green' : 'text-gray-700')}
                        >
                          {o.label}
                          {sortId === o.id && <Check className="h-3.5 w-3.5 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search bar (in-page) */}
            <div ref={searchWrapRef} className="relative mb-5">
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded border-2 border-brand-green bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  placeholder="Search courses…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  aria-expanded={suggestOpen}
                />
                <Button type="submit" className="h-8 rounded-none bg-brand-green px-4 text-xs font-bold text-white hover:bg-brand-green-dark">
                  Search
                </Button>
              </form>

              {suggestOpen && (
                <div className="absolute left-0 right-0 top-full z-40 mt-2">
                  <SearchSuggestionsPanel
                    query={searchInput}
                    suggestions={suggestions}
                    recentSearches={recentSearches}
                    loading={suggestionsLoading}
                    onSelect={() => setSuggestOpen(false)}
                    onClearRecent={clearRecent}
                    onRemoveRecent={removeRecent}
                  />
                </div>
              )}
            </div>

            {!q && !suggestOpen && suggestions && !loading && (
              <div className="mb-6">
                <SearchSuggestionsPanel
                  query=""
                  suggestions={suggestions}
                  recentSearches={recentSearches}
                  loading={suggestionsLoading}
                  onClearRecent={clearRecent}
                  onRemoveRecent={removeRecent}
                />
              </div>
            )}

            {error && (
              <ApiErrorBanner
                message={error}
                onRetry={fetchCourses}
                onDismiss={() => setError(null)}
                retrying={loading}
                className="mb-5"
              />
            )}

            {/* Results */}
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 border-b border-gray-200 py-4">
                    <Skeleton className="h-[135px] w-[240px] shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                    <div className="w-24 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <Search className="h-16 w-16 text-gray-200" />
                <h3 className="mt-4 text-lg font-bold text-gray-800">No courses found</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Try adjusting your search or filters, or{' '}
                  <button type="button" onClick={clearAll} className="font-bold text-brand-green hover:underline">clear all filters</button>.
                </p>
                <Link href="/catalog" className="mt-6 rounded-sm bg-brand-green px-6 py-3 text-sm font-bold text-white hover:bg-brand-green-dark">
                  Browse all courses
                </Link>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {courses.map((c) => <CourseRow key={c.id} course={c} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1">
                    <button
                      type="button" onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      aria-label="Previous"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                      return start + i;
                    }).map((p) => (
                      <button
                        key={p} type="button" onClick={() => goToPage(p)}
                        className={cn('flex h-10 w-10 items-center justify-center rounded text-sm font-medium', p === page ? 'bg-brand-green text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50')}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button" onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="flex h-10 w-10 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      aria-label="Next"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-brand-ink/50" onClick={() => setShowMobileFilter(false)} />
          <div className="relative ml-0 flex h-full w-[300px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-bold text-gray-900">Filter & sort</h3>
              <button type="button" onClick={() => setShowMobileFilter(false)} className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">{SidebarContent}</div>
            <div className="border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="w-full rounded-sm bg-brand-green py-3 text-sm font-bold text-white hover:bg-brand-green-dark"
              >
                Show {total.toLocaleString()} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teach CTA */}
      <div className="border-t border-gray-200 bg-brand-canvas px-4 py-12 text-center">
        <Tag className="mx-auto h-10 w-10 text-brand-green/30" />
        <h2 className="mt-3 text-xl font-extrabold text-gray-900">Teach the world with Ingobyi Academy</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Create a course, share your knowledge, and reach motivated learners across Rwanda.
        </p>
        <Button asChild className="mt-5 rounded-none bg-brand-green px-8 py-3 font-bold text-white hover:bg-brand-green-dark">
          <Link href="/login?mode=signup">Start teaching today</Link>
        </Button>
      </div>

      <LandingFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center font-poppins">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-green" />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}
