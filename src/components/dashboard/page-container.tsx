import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function DashboardPage({
  children,
  className,
  fill,
}: {
  children: ReactNode;
  className?: string;
  /** Stretch content to fill the dashboard main area (messages, tables). */
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col gap-5',
        fill && 'min-h-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
