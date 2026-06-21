import Link from 'next/link';
import { type ElementType, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  icon: ElementType;
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('dash-card flex flex-col items-center px-6 py-14 text-center', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded border border-brand-green/10 bg-brand-canvas">
        <Icon className="h-5 w-5 text-brand-green/70" strokeWidth={1.75} />
      </div>
      <h3 className="font-display mt-4 text-lg text-brand-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-brand-muted">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            <Button asChild size="sm" className="h-8 rounded bg-brand-green px-4 text-xs font-semibold hover:bg-brand-green-dark">
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </Button>
          )}
          {secondaryAction && (
            <Button asChild size="sm" variant="outline" className="h-8 rounded border-brand-green/15 px-4 text-xs font-semibold">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
