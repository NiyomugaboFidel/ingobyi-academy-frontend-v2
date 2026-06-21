import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function TableSkeleton({
  rows = 6,
  columns = 4,
  compact = false,
}: {
  rows?: number;
  columns?: number;
  compact?: boolean;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-brand-green/6">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex} className={cn('px-3', compact ? 'py-2' : 'py-2.5')}>
              <Skeleton className={cn('h-4', colIndex === 0 ? 'w-4/5' : 'w-2/3')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardGridSkeleton({
  count = 6,
  columns = 'sm:grid-cols-2 xl:grid-cols-3',
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={cn('grid gap-3', columns)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="dash-card space-y-3 p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ConversationListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1 p-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-3 w-8 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ChatMessagesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4 py-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn('flex gap-2', index % 2 === 1 ? 'flex-row-reverse' : '')}
        >
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className={cn('h-14 rounded-2xl', index % 2 === 1 ? 'w-2/5' : 'w-3/5')} />
        </div>
      ))}
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="dash-card space-y-4 p-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="dash-card overflow-hidden">
      <div className="border-b border-brand-green/8 bg-brand-canvas px-3 py-3">
        <Skeleton className="h-8 w-full max-w-md" />
      </div>
      <div className="overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-green/10 bg-brand-canvas">
              {Array.from({ length: 4 }).map((_, index) => (
                <th key={index} className="px-3 py-2.5">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableSkeleton rows={8} columns={4} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
