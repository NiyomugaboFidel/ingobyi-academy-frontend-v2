'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth/store';
import { canAccessDashboard } from '@/lib/auth/access';
import { getEffectiveRole, needsOnboarding } from '@/lib/auth/store';
import { logout } from '@/lib/api/auth';
import { WorkspaceSwitcher } from '@/components/workspace/workspace-switcher';
import type { UserRole } from '@/lib/api/types';
import { BrandLogo } from '@/components/brand-logo';
import { ErrorBoundary } from '@/components/errors/error-boundary';
import { getErrorMessage } from '@/lib/api/errors';
import { DashboardPage } from '@/components/dashboard/page-container';
import { getBreadcrumbs, getNavGroups } from '@/lib/dashboard/nav-config';
import { useOrgStore } from '@/lib/org/store';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { OnlineBadge } from '@/components/presence/online-badge';

const SIDEBAR_KEY = 'dashboard:sidebar-collapsed';

const ROLE_BADGE: Partial<Record<UserRole, { label: string; className: string }>> = {
  TRAINER: { label: 'Trainer', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' },
  ADMIN: { label: 'Admin', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' },
  SUPERADMIN: { label: 'Superadmin', className: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200' },
  PARENT: { label: 'Parent', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' },
};

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === '1') setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      return next;
    });
  }

  return { collapsed, toggle, setCollapsed };
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const groups = useMemo(
    () => (user ? getNavGroups(getEffectiveRole(user, activeOrgId ?? user.activeOrgId)) : []),
    [user, activeOrgId],
  );

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const g of groups) {
      const hasActive = g.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
      );
      initial[g.id] = hasActive || g.id === 'workspace';
    }
    setOpenGroups((prev) => ({ ...initial, ...prev }));
  }, [pathname, groups]);

  const q = search.trim().toLowerCase();
  const filteredGroups = q
    ? groups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => item.label.toLowerCase().includes(q)),
        }))
        .filter((g) => g.items.length > 0)
    : groups;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!collapsed && (
        <div className="mb-3 px-2">
          <div className="flex items-center gap-2 rounded border border-brand-green/10 bg-brand-canvas px-2 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search navigation…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-brand-muted-light"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="text-brand-muted hover:text-brand-green">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-2.5 pb-3" aria-label="Dashboard navigation">
        {filteredGroups.map((group) => (
          <div key={group.id}>
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setOpenGroups((p) => ({ ...p, [group.id]: !p[group.id] }))}
                className="mb-1 flex w-full items-center justify-between px-1.5 py-0.5 text-left"
              >
                <span className="dash-section-label">{group.label}</span>
                <ChevronRight
                  className={cn('h-3 w-3 text-brand-muted-light transition-transform', openGroups[group.id] && 'rotate-90')}
                />
              </button>
            ) : (
              <div className="mx-auto mb-1 h-px w-6 bg-brand-green/10" />
            )}

            {(collapsed || openGroups[group.id]) && (
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin/dashboard' &&
                      item.href !== '/superadmin/dashboard' &&
                      item.href !== '/trainer/dashboard' &&
                      item.href !== '/student/dashboard' &&
                      item.href !== '/parent/dashboard' &&
                      !['/catalog', '/notifications', '/settings', '/profile'].includes(item.href) &&
                      pathname.startsWith(item.href + '/'));
                  const exactDashboard =
                    item.label === 'Dashboard' && pathname === item.href;
                  const isActive = item.label === 'Dashboard' ? exactDashboard : active;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        data-active={isActive}
                        className={cn('dash-nav-item', collapsed && 'justify-center px-2')}
                      >
                        <item.Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.25 : 2} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <span className="ml-auto rounded bg-brand-green/8 px-1.5 py-0.5 text-[10px] font-semibold text-brand-green">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

function SidebarPanel({
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const router = useRouter();
  const { user, accessToken, clearAuth } = useAuthStore();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const { resolved, toggleTheme } = useTheme();
  const effectiveRole = getEffectiveRole(user!, activeOrgId ?? user?.activeOrgId);

  async function handleLogout() {
    if (accessToken) {
      try {
        await logout(accessToken);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Sign-out failed on the server, but you were signed out locally.'));
      }
    }
    clearAuth();
    router.push('/login');
  }

  if (!user) return null;

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-brand-green/10 bg-white transition-[width] duration-200',
        mobile ? 'w-full' : collapsed ? 'w-[56px]' : 'w-[248px]',
      )}
    >
      <div className={cn('flex items-center border-b border-brand-green/8 px-3 py-3', collapsed && !mobile ? 'justify-center' : 'gap-2')}>
        {!collapsed || mobile ? (
          <Link href="/" className="flex min-w-0 flex-1 items-center" onClick={onNavigate}>
            <BrandLogo size="sm" />
          </Link>
        ) : (
          <Link href="/" title="Ingobyi Academy" onClick={onNavigate}>
            <BrandLogo size="sm" />
          </Link>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1 text-brand-muted hover:bg-brand-green/5 hover:text-brand-green"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className={cn('border-b border-brand-green/8 px-2 py-2', collapsed && 'px-1')}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />

      <div className="mt-auto border-t border-brand-green/8 p-2">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded border border-brand-green/8 px-2 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green/8">
              <UserCircle className="h-4 w-4 text-brand-green" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-xs font-semibold text-brand-ink">
                  {user.firstName} {user.lastName}
                </p>
                {ROLE_BADGE[effectiveRole] && (
                  <span
                    className={cn(
                      'shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                      ROLE_BADGE[effectiveRole]!.className,
                    )}
                  >
                    {ROLE_BADGE[effectiveRole]!.label}
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] text-brand-muted">{user.email}</p>
            </div>
          </div>
        )}

        <div className={cn('flex gap-1', collapsed ? 'flex-col items-center' : '')}>
          <button
            type="button"
            onClick={toggleTheme}
            title={resolved === 'light' ? 'Dark mode' : 'Light mode'}
            className="dash-nav-item flex-1 justify-center px-2"
          >
            {resolved === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {!collapsed && <span>Theme</span>}
          </button>
          <Link
            href="/settings"
            onClick={onNavigate}
            title="Settings"
            className={cn('dash-nav-item flex-1 justify-center px-2', collapsed && 'px-2')}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="dash-nav-item flex-1 justify-center px-2 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const crumbs = getBreadcrumbs(pathname);
  const [globalSearch, setGlobalSearch] = useState('');
  const router = useRouter();

  function handleGlobalSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = globalSearch.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-brand-green/10 bg-white px-3 md:gap-3 md:px-4">
      <button
        type="button"
        onClick={onOpenMobile}
        className="shrink-0 rounded p-1.5 text-brand-muted hover:bg-brand-green/5 hover:text-brand-green lg:hidden"
        aria-label="Open navigation"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 flex-1 items-center gap-1 overflow-hidden text-xs text-brand-muted md:flex lg:max-w-[40%] xl:max-w-none"
      >
        {crumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex min-w-0 shrink items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-brand-muted-light" />}
            {crumb.href && i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="truncate hover:text-brand-green">
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'truncate',
                  i === crumbs.length - 1 ? 'font-medium text-brand-ink' : '',
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <Link
        href="/search"
        className="ml-auto shrink-0 rounded p-1.5 text-brand-muted hover:bg-brand-green/5 hover:text-brand-green md:hidden"
        title="Search"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </Link>

      <form
        onSubmit={handleGlobalSearch}
        className="ml-auto hidden min-w-0 flex-1 items-center md:flex lg:max-w-xs xl:max-w-md"
      >
        <div className="flex w-full items-center gap-2 rounded border border-brand-green/10 bg-brand-canvas px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-brand-muted-light" />
          <input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search courses, users, content…"
            className="w-full bg-transparent text-xs outline-none placeholder:text-brand-muted-light"
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-2">
        <WorkspaceSwitcher variant="topbar" />
        <OnlineBadge className="hidden sm:inline-flex" />
        <Link
          href="/"
          className="hidden rounded p-1.5 text-brand-muted hover:bg-brand-green/5 hover:text-brand-green sm:block"
          title="Marketing site"
        >
          <Home className="h-4 w-4" />
        </Link>
        <Link
          href="/notifications"
          className="relative rounded p-1.5 text-brand-muted hover:bg-brand-green/5 hover:text-brand-green"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-brand-green/10 px-1.5 py-1 hover:bg-brand-green/[0.03]"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green/8">
                <UserCircle className="h-3.5 w-3.5 text-brand-green" />
              </div>
              <span className="hidden text-xs font-medium text-brand-ink sm:inline">
                {user?.firstName}
              </span>
              <ChevronDown className="hidden h-3 w-3 text-brand-muted-light sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/workspaces">Workspaces</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/">Back to site</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardShell({
  children,
  allowedRoles,
  mainClassName,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
  mainClassName?: string;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const { collapsed, toggle } = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && needsOnboarding(user)) {
      router.replace('/onboarding');
    }
  }, [user, router]);

  if (user && needsOnboarding(user)) {
    return null;
  }

  if (
    !user ||
    !canAccessDashboard(getEffectiveRole(user, activeOrgId ?? user.activeOrgId), allowedRoles)
  ) {
    return (
      <div className="dashboard-root flex min-h-screen items-center justify-center">
        <div className="dash-card max-w-sm p-8 text-center">
          <p className="text-sm text-brand-muted">Access denied</p>
          <Link
            href="/login"
            className="mt-3 inline-block text-sm font-medium text-brand-green underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root flex h-dvh max-h-dvh min-h-0 overflow-hidden">
      <div className="hidden h-full lg:flex">
        <SidebarPanel collapsed={collapsed} onToggle={toggle} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SidebarPanel
            collapsed={false}
            mobile
            onToggle={() => setMobileOpen(false)}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenMobile={() => setMobileOpen(true)} />
        <main
          id="main"
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden',
            mainClassName,
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-5 md:px-6 md:py-5">
            <ErrorBoundary fallbackTitle="Dashboard error">
              <DashboardPage fill>{children}</DashboardPage>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
