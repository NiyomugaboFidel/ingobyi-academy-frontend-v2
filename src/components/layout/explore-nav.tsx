'use client';

import {
  type FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  MoreHorizontal,
  Newspaper,
  Search,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore, getEffectiveRole, getRoleHome } from '@/lib/auth/store';
import { logout } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/errors';
import { saveRecentSearch } from '@/lib/search/history';
import { useSearchSuggestions } from '@/lib/search/use-search-suggestions';
import { SearchSuggestionsPanel } from '@/components/search/search-suggestions-panel';
import type { User as AuthUser } from '@/lib/api/types';

/* ────────────────────── constants ────────────────────── */

const CATALOG_CATEGORIES = [
  'technology',
  'creative-arts',
  'sports',
  'skills',
  'media',
  'business',
] as const;

const CATALOG_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

const CATEGORY_LABELS: Record<(typeof CATALOG_CATEGORIES)[number], string> = {
  technology: 'Technology',
  'creative-arts': 'Creative Arts',
  sports: 'Sports',
  skills: 'Life Skills',
  media: 'Media',
  business: 'Business',
};

const LEVEL_LABELS: Record<(typeof CATALOG_LEVELS)[number], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const DISCOVER_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/programs', label: 'Programs' },
  { href: '/partners', label: 'Partners' },
  { href: '/events', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Teach with us' },
] as const;

type MenuVariant = 'desktop' | 'mobile';
type Lang = 'en' | 'fr';

export type ExploreNavProps = {
  /** When false, hide the category strip (marketing pages). Default true. */
  showCatalogQuickNav?: boolean;
};

/* ────────────────────── helpers ────────────────────── */

function categoryLabel(slug: string) {
  return CATEGORY_LABELS[slug as keyof typeof CATEGORY_LABELS] ?? slug;
}

function levelLabel(level: string) {
  return LEVEL_LABELS[level as keyof typeof LEVEL_LABELS] ?? level;
}

function initialsFromUser(user: AuthUser) {
  const first = user.firstName?.[0] ?? '';
  const last = user.lastName?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
}

function displayName(user: AuthUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

const triggerDesktop =
  'h-9 gap-1 rounded-md px-2.5 text-xs font-normal text-brand-ink hover:bg-brand-ink/6 data-[state=open]:bg-black/[0.08] sm:text-sm [&[data-state=open]_svg:last-child]:rotate-180';

const triggerMobile =
  'h-9 gap-1 rounded-full border border-brand-green/15 bg-background px-3 text-xs font-semibold text-brand-green data-[state=open]:bg-brand-green/10 sm:text-sm [&[data-state=open]_svg:last-child]:rotate-180';

const chevronCls = 'h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-200';

function NavChevron() {
  return <ChevronDown className={chevronCls} aria-hidden />;
}

function triggerClass(variant: MenuVariant) {
  return cn(variant === 'desktop' ? triggerDesktop : triggerMobile);
}

const iconBtn =
  'relative rounded-full p-2 text-brand-ink transition-colors hover:bg-brand-ink/6';

/* ────────────────────── search ────────────────────── */

function NavSearch({ className, pill = false }: { className?: string; pill?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const urlQ = searchParams.get('q') ?? '';

  useEffect(() => {
    if (pathname === '/search') {
      setQ(urlQ);
    } else {
      setQ('');
    }
  }, [pathname, urlQ]);

  const {
    suggestions,
    loading,
    recentSearches,
    refreshRecent,
    clearRecent,
    removeRecent,
  } = useSearchSuggestions(q, suggestOpen);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const term = q.trim();
    if (term) saveRecentSearch(term);
    refreshRecent();
    setSuggestOpen(false);
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  const showSuggestions = suggestOpen && (loading || recentSearches.length > 0 || !!suggestions);

  return (
    <div ref={wrapRef} className={cn('relative min-w-0', className)}>
      <form className="relative" onSubmit={submitSearch} role="search" aria-label="Search courses">
        <Search
          className={cn(
            'pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-brand-ink/55',
            pill ? 'left-4 h-5 w-5' : 'left-3 h-4 w-4',
          )}
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSuggestOpen(true);
          }}
          onFocus={() => setSuggestOpen(true)}
          placeholder="Search courses"
          className={cn(
            'w-full text-brand-ink',
            pill
              ? 'h-11 rounded-full border-2 border-brand-ink/12 bg-white pl-11 pr-4 text-sm shadow-sm md:h-12 md:text-[15px]'
              : 'h-10 rounded-lg border border-brand-green/12 bg-brand-page-bg/80 pl-10 pr-4 text-sm',
          )}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-label="Search courses"
        />
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>
      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-[60] mt-1">
          <SearchSuggestionsPanel
            query={q}
            suggestions={suggestions}
            recentSearches={recentSearches}
            loading={loading}
            compact
            onSelect={() => setSuggestOpen(false)}
            onClearRecent={clearRecent}
            onRemoveRecent={removeRecent}
          />
        </div>
      ) : null}
    </div>
  );
}

/* ────────────────────── dropdown menus ────────────────────── */

function BrowseByCategorySub() {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <LayoutGrid className="h-4 w-4 opacity-70" aria-hidden />
        Browse by category
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="max-h-[min(60vh,20rem)] w-52 overflow-y-auto p-1">
        <DropdownMenuItem asChild>
          <Link href="/search">All categories</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {CATALOG_CATEGORIES.map((cat) => (
          <DropdownMenuItem key={cat} asChild>
            <Link href={`/search?category=${encodeURIComponent(cat)}`}>{categoryLabel(cat)}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function BrowseByLevelSub() {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <GraduationCap className="h-4 w-4 opacity-70" aria-hidden />
        Browse by level
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-48 p-1">
        {CATALOG_LEVELS.map((lv) => (
          <DropdownMenuItem key={lv} asChild>
            <Link href={`/search?level=${encodeURIComponent(lv)}`}>{levelLabel(lv)}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function CoursesNavDropdown({ variant }: { variant: MenuVariant }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass(variant)}>
          <BookOpen className="hidden h-4 w-4 opacity-70 sm:inline" aria-hidden />
          Courses
          <NavChevron />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Courses</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/search" className="gap-2">
              <span className="font-medium">Browse all courses</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <BrowseByCategorySub />
        <BrowseByLevelSub />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProgramsNavDropdown({ variant }: { variant: MenuVariant }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass(variant)}>
          Programs
          <NavChevron />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Programs</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/programs">Programs</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/events">Events</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/contact">Contact</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BlogNavDropdown({ variant }: { variant: MenuVariant }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass(variant)}>
          <Newspaper className="hidden h-4 w-4 opacity-70 sm:inline" aria-hidden />
          Blog
          <NavChevron />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Blog</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/blog">Blog</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/events">Events</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PartnersNavDropdown({ variant }: { variant: MenuVariant }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass(variant)}>
          <Users className="hidden h-4 w-4 opacity-70 sm:inline" aria-hidden />
          Partners
          <NavChevron />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Partners</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/partners">Partners</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/events">Events</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/about">About</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MyLearningNavDropdown({
  variant,
  myLearningTo,
  user,
}: {
  variant: MenuVariant;
  myLearningTo: string;
  user: AuthUser | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass(variant)}>
          My Learning
          <NavChevron />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Learning</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={myLearningTo}>Dashboard</Link>
        </DropdownMenuItem>
        {user?.platformRole === 'STUDENT' ? (
          <DropdownMenuItem asChild>
            <Link href="/student/enrolled">Enrolled courses</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/search">Browse all courses</Link>
        </DropdownMenuItem>
        <BrowseByCategorySub />
        <BrowseByLevelSub />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreNavDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full text-brand-ink hover:bg-brand-ink/6"
          aria-label="More menu"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
          Discover
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {DISCOVER_LINKS.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
          Browse courses
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/search">Browse all courses</Link>
        </DropdownMenuItem>
        <BrowseByCategorySub />
        <BrowseByLevelSub />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ────────────────────── user menu ────────────────────── */

function UserAccountMenu({ className }: { className?: string }) {
  const router = useRouter();
  const { user, accessToken, clearAuth } = useAuthStore();

  const handleLogout = useCallback(async () => {
    if (accessToken) {
      try {
        await logout(accessToken);
      } catch (err) {
        toast.error(
          getErrorMessage(err, 'Sign-out failed on the server, but you were signed out locally.'),
        );
      }
    }
    clearAuth();
    router.push('/login');
  }, [accessToken, clearAuth, router]);

  if (!user) return null;

  const home = getRoleHome(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex shrink-0 rounded-full ring-offset-white outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2',
            className,
          )}
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 border border-brand-green/12 shadow-sm md:h-9 md:w-9">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-brand-green/10 text-xs font-bold text-brand-green">
              {initialsFromUser(user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold leading-none">{displayName(user)}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {getEffectiveRole(user).toLowerCase()}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={home} className="flex cursor-pointer items-center gap-2">
            <LayoutDashboard className="h-4 w-4 opacity-70" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex cursor-pointer items-center gap-2">
            <User className="h-4 w-4 opacity-70" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex cursor-pointer items-center gap-2">
            <Settings className="h-4 w-4 opacity-70" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="flex cursor-pointer items-center gap-2">
            <Bell className="h-4 w-4 opacity-70" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ────────────────────── language switcher ────────────────────── */

function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          className={cn(
            'gap-1 rounded-full font-medium text-brand-ink/80',
            compact ? 'shrink-0' : 'px-2',
          )}
          aria-label="Language"
        >
          <Globe2 className={compact ? 'h-5 w-5' : 'h-4 w-4'} />
          {!compact ? (
            <span className="hidden text-xs font-bold uppercase sm:inline">{lang}</span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Lang)}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ────────────────────── category quick nav ────────────────────── */

function CatalogQuickNavStrip() {
  const catHref = (cat: string) =>
    `/search?${new URLSearchParams({ category: cat }).toString()}`;
  const levelHref = (level: string) =>
    `/search?${new URLSearchParams({ level }).toString()}`;

  const publicLinkClass =
    'flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-brand-ink transition hover:bg-brand-ink/8 md:px-3';

  return (
    <div
      className="flex w-full min-w-0 flex-col border-b border-brand-ink/8 bg-brand-surface sm:flex-row sm:items-stretch"
      role="navigation"
      aria-label="Course categories"
    >
      <Link
        href="/search"
        className="flex shrink-0 items-center gap-0.5 border-b border-brand-ink/10 px-3 py-2.5 text-sm font-bold text-brand-ink transition hover:bg-brand-ink/5 sm:border-b-0 sm:border-r md:px-4"
      >
        Courses
        <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 py-2 pl-2 pr-1 sm:flex-row sm:items-center sm:gap-0 sm:py-0 sm:pl-0 sm:pr-0">
        <div
          className={cn(
            'flex min-h-[40px] min-w-0 items-center gap-2 overflow-x-auto px-1 sm:border-r sm:border-brand-ink/10 sm:px-3',
            'scroll-touch scrollbar-thin',
          )}
        >
          <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider text-brand-ink/55 sm:inline">
            Course types
          </span>
          {CATALOG_CATEGORIES.map((cat) => (
            <Link key={cat} href={catHref(cat)} className={publicLinkClass}>
              {categoryLabel(cat)}
            </Link>
          ))}
        </div>

        <div
          className={cn(
            'flex min-h-[40px] min-w-0 items-center gap-2 overflow-x-auto border-t border-black/8 px-1 pt-1 sm:border-t-0 sm:pt-0 sm:pl-3',
            'scroll-touch scrollbar-thin',
          )}
        >
          <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider text-brand-ink/55 sm:inline">
            Level
          </span>
          {CATALOG_LEVELS.map((lv) => (
            <Link key={lv} href={levelHref(lv)} className={publicLinkClass}>
              {levelLabel(lv)}
            </Link>
          ))}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-auto min-h-[44px] min-w-[44px] shrink-0 rounded-none border-t border-brand-ink/10 sm:min-h-0 sm:border-l sm:border-t-0"
            aria-label="More menu"
          >
            <MoreHorizontal className="h-5 w-5 text-brand-ink" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
            Browse courses
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/search">Browse all courses</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal uppercase tracking-wide text-muted-foreground">
              Course types
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/search">All categories</Link>
            </DropdownMenuItem>
            {CATALOG_CATEGORIES.map((cat) => (
              <DropdownMenuItem key={cat} asChild>
                <Link href={catHref(cat)}>{categoryLabel(cat)}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <LayoutGrid className="h-4 w-4 opacity-70" aria-hidden />
              Browse by level
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 p-1" sideOffset={6}>
              {CATALOG_LEVELS.map((lv) => (
                <DropdownMenuItem key={lv} asChild>
                  <Link href={levelHref(lv)}>{levelLabel(lv)}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* ────────────────────── main nav ────────────────────── */

function ExploreNavInner({ showCatalogQuickNav = true }: ExploreNavProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();
  const hideAuthCtas = pathname === '/login';
  const [open, setOpen] = useState(false);

  const myLearningTo = useMemo(() => {
    if (authenticated && user) return getRoleHome(user);
    return `/login?redirect=${encodeURIComponent('/student/dashboard')}`;
  }, [authenticated, user]);

  const rightCluster = (
    <>
      <MoreNavDropdown />
      <LanguageSwitcher />

      {!hideAuthCtas ? (
        <>
          {authenticated && user ? (
            <>
              <Link href="/notifications" className={iconBtn} title="Notifications">
                <Bell className="h-5 w-5" />
              </Link>
              <UserAccountMenu className="ml-0.5" />
            </>
          ) : (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="rounded-full font-semibold text-brand-ink"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-full border-2 border-brand-ink bg-transparent px-4 font-semibold text-brand-ink hover:bg-brand-ink/4"
              >
                <Link href="/login?mode=signup">Sign up</Link>
              </Button>
            </>
          )}
        </>
      ) : null}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-ink/10 bg-white font-poppins backdrop-blur-md">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-14 focus:z-[60] focus:rounded-md focus:bg-brand-green focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <nav className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6" aria-label="Main navigation">
          {/* Mobile & tablet: stacked layout until large screens */}
          <div className="flex flex-col lg:hidden">
            <div className="flex items-center justify-between gap-2 border-b border-brand-ink/10 py-2">
              <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
                <BrandLogo size="md" className="rounded-md" />
              </Link>
              <div className="flex items-center gap-0.5">
                {authenticated && user ? (
                  <Link href="/notifications" className={iconBtn} title="Notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                ) : null}
                <LanguageSwitcher compact />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-expanded={open}
                  aria-label="Menu"
                  onClick={() => setOpen((o) => !o)}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-b border-brand-ink/10 py-2.5">
              <NavSearch pill className="w-full min-w-0" />
              <div className="flex flex-wrap items-center gap-1.5">
                <CoursesNavDropdown variant="mobile" />
                <ProgramsNavDropdown variant="mobile" />
                <BlogNavDropdown variant="mobile" />
                <PartnersNavDropdown variant="mobile" />
                <MyLearningNavDropdown
                  variant="mobile"
                  myLearningTo={myLearningTo}
                  user={user}
                />
              </div>
            </div>

            {open ? (
              <div className="flex flex-col gap-1 border-t border-brand-ink/10 pb-3 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  Discover
                </p>
                {DISCOVER_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-brand-ink/90"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/search"
                  className="text-sm font-semibold text-brand-ink"
                  onClick={() => setOpen(false)}
                >
                  Courses
                </Link>
                {CATALOG_CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/search?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-muted-foreground"
                    onClick={() => setOpen(false)}
                  >
                    {categoryLabel(cat)}
                  </Link>
                ))}
                {hideAuthCtas ? null : authenticated && user ? (
                  <UserAccountMenu className="mt-2 self-start" />
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full border-brand-ink/20 font-semibold"
                    >
                      <Link href="/login" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 rounded-full bg-brand-green font-semibold hover:bg-brand-green-dark"
                    >
                      <Link href="/login?mode=signup" onClick={() => setOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Desktop (lg+) */}
          <div className="hidden min-h-[4.5rem] items-center gap-1 py-1 lg:flex xl:gap-2">
            <Link href="/" className="mr-1 flex shrink-0 items-center lg:mr-2" onClick={() => setOpen(false)}>
              <BrandLogo size="md" className="rounded-md" />
            </Link>
            <ul className="flex shrink-0 list-none items-center gap-0 p-0">
              <li>
                <CoursesNavDropdown variant="desktop" />
              </li>
              <li>
                <ProgramsNavDropdown variant="desktop" />
              </li>
              <li>
                <BlogNavDropdown variant="desktop" />
              </li>
            </ul>
            <div className="min-w-0 flex-1 px-2 lg:px-5 xl:px-8">
              <NavSearch
                pill
                className="mx-auto w-full max-w-2xl lg:max-w-3xl xl:max-w-[min(48rem,calc(100vw-28rem))] 2xl:max-w-[52rem]"
              />
            </div>
            <ul className="flex shrink-0 list-none items-center gap-0 p-0">
              <li>
                <PartnersNavDropdown variant="desktop" />
              </li>
              <li>
                <MyLearningNavDropdown
                  variant="desktop"
                  myLearningTo={myLearningTo}
                  user={user}
                />
              </li>
            </ul>
            <div className="ml-1 flex shrink-0 flex-nowrap items-center justify-end gap-0.5 pl-1 xl:pl-2">
              {rightCluster}
            </div>
          </div>
        </nav>
      </header>
      {showCatalogQuickNav ? <CatalogQuickNavStrip /> : null}
    </>
  );
}

function ExploreNavFallback() {
  return <header className="sticky top-0 z-50 h-16 border-b border-brand-green/10 bg-white font-poppins" />;
}

export function ExploreNav(props: ExploreNavProps) {
  return (
    <Suspense fallback={<ExploreNavFallback />}>
      <ExploreNavInner {...props} />
    </Suspense>
  );
}
