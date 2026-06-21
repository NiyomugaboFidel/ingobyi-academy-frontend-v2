import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type LandingCtaBandProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function LandingCtaBand({
  title,
  description,
  actions,
  className,
}: LandingCtaBandProps) {
  return (
    <section
      className={cn(
        'border-y border-brand-green/10 bg-gradient-to-br from-brand-green to-brand-green-darker py-14 text-white sm:py-16',
        className,
      )}
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/78">
            {description}
          </p>
        ) : null}
        {actions ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
