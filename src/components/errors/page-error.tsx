'use client';

import Link from 'next/link';
import { AlertCircle, Home, LayoutDashboard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRoleHome, useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';

type PageErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
  showHomeLink?: boolean;
  showDashboardLink?: boolean;
};

export function PageError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retrying = false,
  showHomeLink = true,
  showDashboardLink = true,
}: PageErrorProps) {
  const user = useAuthStore((s) => s.user);
  const dashboardHref = user ? getRoleHome(user) : null;

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-600" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-brand-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-brand-ink/65">{message}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="gap-2 bg-brand-green text-white hover:bg-brand-green-dark"
          >
            <RefreshCw className={cn('h-4 w-4', retrying && 'animate-spin')} />
            Try again
          </Button>
        )}
        {showDashboardLink && dashboardHref && (
          <Button asChild variant="outline" className="gap-2 border-brand-green/20">
            <Link href={dashboardHref}>
              <LayoutDashboard className="h-4 w-4" />
              Back to dashboard
            </Link>
          </Button>
        )}
        {showHomeLink && (
          <Button asChild variant="outline" className="gap-2 border-brand-green/20">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
