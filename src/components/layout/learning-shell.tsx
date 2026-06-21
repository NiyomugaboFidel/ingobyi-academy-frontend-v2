'use client';

import { type ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, BookOpen, Compass, Home, LogOut, Mail, Moon, Search, Sun, UserCircle, Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { useTheme } from '@/components/theme-provider';
import { getEffectiveRole, useAuthStore } from '@/lib/auth/store';
import { canAccessDashboard } from '@/lib/auth/access';
import { logout } from '@/lib/api/auth';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/api/types';
import { OnlineBadge } from '@/components/presence/online-badge';

const NAV = [
  { href: '/student/dashboard', label: 'Home', Icon: Home },
  { href: '/student/enrolled', label: 'My learning', Icon: BookOpen },
  { href: '/community', label: 'Community', Icon: Users },
  { href: '/search', label: 'Explore', Icon: Compass },
  { href: '/student/messages', label: 'Messages', Icon: Mail },
];

export function LearningShell({
  children,
  allowedRoles = ['STUDENT'],
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, clearAuth } = useAuthStore();
  const { resolved, toggleTheme } = useTheme();

  useEffect(() => {
    if (!user) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
      return;
    }
    if (!canAccessDashboard(getEffectiveRole(user), allowedRoles)) {
      router.replace('/');
    }
  }, [user, allowedRoles, router, pathname]);

  async function handleLogout() {
    if (accessToken) {
      try { await logout(accessToken); } catch { /* local sign-out */ }
    }
    clearAuth();
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-mint-wash/40 via-background to-background dark:from-brand-ink/20 dark:via-background dark:to-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/student/dashboard" className="shrink-0">
            <BrandLogo size="sm" />
          </Link>

          <Link
            href="/search"
            className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand-green/30 hover:bg-background sm:flex"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search courses, trainers, learners…</span>
          </Link>

          <nav className="ml-auto hidden min-w-0 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-green text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <item.Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <OnlineBadge compact className="hidden sm:inline-flex" />
            <Link href="/search" className="rounded-full p-2 text-muted-foreground hover:bg-muted sm:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/notifications" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Link>
            <button type="button" onClick={toggleTheme} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Toggle theme">
              {resolved === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <Link href="/profile" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Profile">
              <UserCircle className="h-5 w-5" />
            </Link>
            <button type="button" onClick={handleLogout} className="hidden rounded-full p-2 text-muted-foreground hover:bg-muted sm:block" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between gap-0.5 px-1 py-1 sm:px-2">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-2 text-[9px] font-medium sm:text-[10px]',
                  active ? 'text-brand-green' : 'text-muted-foreground',
                )}
              >
                <item.Icon className="h-5 w-5 shrink-0" />
                <span className="max-w-full truncate text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
