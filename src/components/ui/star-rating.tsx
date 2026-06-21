'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  value?: number | null;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
};

const SIZE = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
} as const;

export function StarRating({
  value,
  max = 5,
  size = 'sm',
  showValue = false,
  reviewCount,
  className,
}: Props) {
  const rating = value ?? 0;
  const iconClass = SIZE[size];

  return (
    <div className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      <div className="inline-flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
        {Array.from({ length: max }, (_, i) => {
          const filled = rating >= i + 1;
          const partial = !filled && rating > i && rating < i + 1;
          return (
            <Star
              key={i}
              className={cn(
                iconClass,
                filled
                  ? 'fill-brand-yellow text-brand-yellow'
                  : partial
                    ? 'fill-brand-yellow/45 text-brand-yellow'
                    : 'fill-transparent text-muted-foreground/35',
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-foreground">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      )}
      {reviewCount != null && reviewCount > 0 && (
        <span className="text-[11px] text-muted-foreground">
          ({reviewCount} review{reviewCount === 1 ? '' : 's'})
        </span>
      )}
    </div>
  );
}

type InteractiveProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, disabled }: InteractiveProps) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`Rate ${star} stars`}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition hover:scale-110 disabled:opacity-50"
        >
          <Star
            className={cn(
              'h-6 w-6',
              value >= star
                ? 'fill-brand-yellow text-brand-yellow'
                : 'fill-transparent text-muted-foreground/35',
            )}
          />
        </button>
      ))}
    </div>
  );
}
