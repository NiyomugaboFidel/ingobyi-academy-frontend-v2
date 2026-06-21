'use client';

import type { CommunityUserStats } from '@/lib/api/community';
import { Award, BookOpen, MessageSquare, Star, Trophy } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { cn } from '@/lib/utils';

export function CommunityStatsGrid({
  stats,
  displayRole,
  className,
  compact = false,
}: {
  stats?: CommunityUserStats | null;
  displayRole?: string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!stats) return null;

  const items = [
    {
      label: 'Courses done',
      value: stats.coursesCompleted,
      icon: BookOpen,
    },
    {
      label: 'Certificates',
      value: stats.certificatesEarned,
      icon: Award,
    },
    {
      label: 'Community pts',
      value: stats.achievementPoints,
      icon: Trophy,
    },
    {
      label: 'Reviews',
      value: stats.reviewsWritten,
      icon: MessageSquare,
    },
  ];

  const showTrainerRating =
    (displayRole === 'TRAINER' || stats.trainerReviewCount > 0) &&
    stats.trainerRating != null;

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'grid gap-2',
          compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4',
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-border/80 bg-background/70 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-brand-green" />
                {item.label}
              </div>
              <p className="mt-1 text-lg font-extrabold text-foreground">{item.value}</p>
            </div>
          );
        })}
      </div>

      {showTrainerRating && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
            <Star className="h-4 w-4 text-amber-600" />
            Trainer rating
          </div>
          <StarRating
            value={stats.trainerRating}
            showValue
            reviewCount={stats.trainerReviewCount}
          />
        </div>
      )}
    </div>
  );
}
