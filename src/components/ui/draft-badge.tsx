'use client';

import { Cloud, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DraftBadge({
  restored,
  lastSaved,
  onDiscard,
  className,
}: {
  restored?: boolean;
  lastSaved?: Date | null;
  onDiscard?: () => void;
  className?: string;
}) {
  if (!restored && !lastSaved) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
        restored
          ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
          : 'border-brand-green/20 bg-brand-green/5 text-brand-green',
        className,
      )}
    >
      {restored ? (
        <>
          <RotateCcw className="h-3 w-3" />
          Draft restored
        </>
      ) : (
        <>
          <Cloud className="h-3 w-3" />
          Saved locally
          {lastSaved && (
            <span className="opacity-70">
              · {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </>
      )}
      {onDiscard && (
        <button
          type="button"
          onClick={onDiscard}
          className="ml-1 underline opacity-80 hover:opacity-100"
        >
          Discard
        </button>
      )}
    </div>
  );
}
