'use client';

import Link from 'next/link';
import { Award, BookOpen, Download, Medal, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UnifiedAchievement } from '@/lib/api/achievements';
import { cn } from '@/lib/utils';

const KIND_CONFIG = {
  certificate: {
    label: 'Certificate',
    Icon: Award,
    chip: 'bg-amber-100 text-amber-900 ring-amber-200',
    iconWrap: 'bg-amber-100 text-amber-700',
  },
  course: {
    label: 'Course completed',
    Icon: BookOpen,
    chip: 'bg-sky-100 text-sky-900 ring-sky-200',
    iconWrap: 'bg-sky-100 text-sky-700',
  },
  badge: {
    label: 'Badge',
    Icon: Trophy,
    chip: 'bg-brand-green/10 text-brand-green ring-brand-green/20',
    iconWrap: 'bg-brand-green/10 text-brand-green',
  },
  custom: {
    label: 'Recognition',
    Icon: Sparkles,
    chip: 'bg-violet-100 text-violet-900 ring-violet-200',
    iconWrap: 'bg-violet-100 text-violet-700',
  },
} as const;

type Props = {
  achievements: UnifiedAchievement[];
  compact?: boolean;
  onDownloadCertificate?: (certificateId: string, title: string) => void;
  downloadingId?: string | null;
  highlightVerifyCode?: string | null;
  className?: string;
};

export function AchievementGrid({
  achievements,
  compact = false,
  onDownloadCertificate,
  downloadingId,
  highlightVerifyCode,
  className,
}: Props) {
  if (!achievements.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
        <Medal className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm font-semibold text-foreground">No achievements yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Certificates, completed courses, and badges will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {achievements.map((item) => {
        const config = KIND_CONFIG[item.kind];
        const Icon = config.Icon;
        const isHighlighted =
          !!highlightVerifyCode &&
          item.verifyCode === highlightVerifyCode;
        return (
          <article
            key={item.id}
            id={item.verifyCode ? `cert-${item.verifyCode}` : undefined}
            className={cn(
              'flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md',
              isHighlighted
                ? 'border-brand-green ring-2 ring-brand-green/30 shadow-md'
                : 'border-border/80 hover:border-brand-green/20',
            )}
          >
            {isHighlighted && (
              <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-green">
                <Award className="h-3 w-3" />
                Verified certificate
              </p>
            )}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  config.iconWrap,
                )}
              >
                {item.iconUrl ? (
                  <img src={item.iconUrl} alt="" className="h-7 w-7 object-contain" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset',
                    config.chip,
                  )}
                >
                  {config.label}
                </span>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
              <span>{new Date(item.earnedAt).toLocaleDateString()}</span>
              <span className="font-semibold text-brand-green">{item.points} pts</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {item.courseSlug && (
                <Button asChild size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]">
                  <Link href={`/catalog/${item.courseSlug}`}>View course</Link>
                </Button>
              )}
              {item.kind === 'certificate' && item.certificateId && onDownloadCertificate && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={downloadingId === item.certificateId}
                  onClick={() => onDownloadCertificate(item.certificateId!, item.title)}
                  className="h-7 rounded-full px-3 text-[11px]"
                >
                  <Download className="mr-1 h-3 w-3" />
                  {downloadingId === item.certificateId ? 'Downloading…' : 'PDF'}
                </Button>
              )}
              {item.verifyCode && (
                <Link
                  href={`/verify/certificate/${encodeURIComponent(item.verifyCode)}`}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-brand-green hover:bg-brand-green/10"
                >
                  Verify
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

type ShowcaseProps = {
  achievements: UnifiedAchievement[];
  max?: number;
  className?: string;
};

export function AchievementShowcase({ achievements, max = 6, className }: ShowcaseProps) {
  const visible = achievements.slice(0, max);
  if (!visible.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visible.map((item) => {
        const config = KIND_CONFIG[item.kind];
        const Icon = config.Icon;
        return (
          <div
            key={item.id}
            title={`${config.label}: ${item.title}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
              config.chip,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="max-w-[140px] truncate">{item.title}</span>
          </div>
        );
      })}
      {achievements.length > max && (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          +{achievements.length - max} more
        </span>
      )}
    </div>
  );
}

export { KIND_CONFIG as ACHIEVEMENT_KIND_CONFIG };
