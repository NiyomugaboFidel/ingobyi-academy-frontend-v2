'use client';

import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type ApiErrorBannerProps = {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  retrying?: boolean;
};

export function ApiErrorBanner({
  message,
  onRetry,
  onDismiss,
  className,
  retrying = false,
}: ApiErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Unable to load data</p>
        <p className="mt-0.5 text-red-800/90">{message}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={retrying}
            className="h-8 gap-1.5 text-red-800 hover:bg-red-100 hover:text-red-900"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', retrying && 'animate-spin')} />
            Retry
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-red-700 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
