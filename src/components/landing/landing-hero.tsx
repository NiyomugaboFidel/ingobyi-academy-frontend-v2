import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LandingHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  variant?: 'light' | 'brand' | 'image';
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
  align?: 'center' | 'left';
};

export function LandingHero({
  eyebrow,
  title,
  description,
  actions,
  variant = 'light',
  imageSrc,
  imageAlt = '',
  className,
  align = 'center',
}: LandingHeroProps) {
  const centered = align === 'center';

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-brand-green/10',
        variant === 'brand' && 'bg-gradient-to-br from-brand-green via-brand-green-darker to-brand-green text-white',
        variant === 'light' && 'bg-gradient-to-b from-brand-mint-wash/80 via-white to-white',
        variant === 'image' && 'bg-brand-green-darker text-white',
        className,
      )}
    >
      {variant === 'image' && imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green-darker/95 via-brand-green/85 to-brand-green/70" />
        </>
      ) : null}

      {variant === 'brand' ? (
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-mint/15 blur-3xl" />
      ) : null}

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8 lg:py-20',
          centered ? 'max-w-4xl text-center' : '',
        )}
      >
        {eyebrow ? (
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-[0.2em]',
              variant === 'light' ? 'text-brand-green' : 'text-brand-mint',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'font-extrabold tracking-tight',
            eyebrow ? 'mt-3' : '',
            centered ? 'mx-auto' : '',
            variant === 'light' ? 'text-brand-ink' : 'text-white',
            'text-3xl leading-tight md:text-4xl lg:text-5xl',
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              'mt-4 max-w-2xl text-base leading-relaxed md:text-lg',
              centered && 'mx-auto',
              variant === 'light' ? 'text-brand-ink/72' : 'text-white/82',
            )}
          >
            {description}
          </p>
        ) : null}
        {actions ? (
          <div
            className={cn(
              'mt-8 flex flex-wrap gap-3',
              centered ? 'justify-center' : '',
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
