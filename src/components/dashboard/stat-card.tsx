import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  hint?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  hint,
  className,
}: StatCardProps) {
  return (
    <div className={cn('dash-card px-3.5 py-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">{title}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-brand-ink">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-[11px] font-medium',
                changeType === 'positive' && 'text-green-800',
                changeType === 'negative' && 'text-red-700',
                changeType === 'neutral' && 'text-brand-muted',
              )}
            >
              {change}
            </p>
          )}
          {hint && !change && (
            <p className="mt-1 text-[11px] text-brand-muted-light">{hint}</p>
          )}
        </div>
        {icon && (
          <div className="shrink-0 rounded border border-brand-green/8 bg-brand-canvas p-1.5 text-brand-green/80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatGrid({
  children,
  cols = 4,
}: {
  children: ReactNode;
  cols?: 2 | 3 | 4 | 5 | 6;
}) {
  const colClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
    6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
  }[cols];

  return <div className={cn('grid gap-3', colClass)}>{children}</div>;
}
