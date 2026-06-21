'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Home, LayoutDashboard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRoleHome, useAuthStore } from '@/lib/auth/store';

const DASHBOARD_PREFIXES = [
  '/admin',
  '/superadmin',
  '/trainer',
  '/student',
  '/parent',
  '/settings',
  '/profile',
  '/notifications',
];

export function NotFoundContent({ embedded }: { embedded?: boolean }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const inDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));
  const dashHref = user ? getRoleHome(user) : '/login';

  const inner = (
    <div className={embedded ? 'flex flex-1 flex-col items-center justify-center py-16' : 'flex min-h-[70vh] flex-col items-center justify-center px-4 py-20'}>
      <div className="relative w-full max-w-lg text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, var(--brand-mint) 0%, transparent 45%), radial-gradient(circle at 80% 70%, var(--brand-green) 0%, transparent 40%)',
          }}
        />
        <p className="font-display text-[5.5rem] leading-none tracking-tight text-brand-green/20">404</p>
        <h1 className="font-display -mt-2 text-2xl text-brand-ink md:text-3xl">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-brand-muted">
          {inDashboard
            ? 'This dashboard section does not exist or may have been moved.'
            : 'The page you are looking for is unavailable or the link may be incorrect.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {inDashboard && user ? (
            <Button asChild size="sm" className="h-9 gap-1.5 rounded bg-brand-green px-4 text-xs hover:bg-brand-green-dark">
              <Link href={dashHref}>
                <LayoutDashboard className="h-3.5 w-3.5" />
                Back to dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="h-9 gap-1.5 rounded bg-brand-green px-4 text-xs hover:bg-brand-green-dark">
              <Link href="/">
                <Home className="h-3.5 w-3.5" />
                Go home
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 rounded border-brand-green/15 px-4 text-xs">
            <Link href="/catalog">
              <Search className="h-3.5 w-3.5" />
              Browse catalog
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 gap-1.5 px-4 text-xs text-brand-muted"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go back
          </Button>
        </div>
        {pathname && pathname !== '/' && (
          <p className="mt-6 font-mono text-[10px] text-brand-muted-light">
            {pathname}
          </p>
        )}
      </div>
    </div>
  );

  return inner;
}
