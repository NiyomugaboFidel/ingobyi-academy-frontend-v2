import { cn } from '@/lib/utils';

type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: LandingSectionHeaderProps) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          'text-2xl font-extrabold text-brand-ink md:text-3xl',
          eyebrow ? 'mt-2' : '',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-brand-ink/68">{description}</p>
      ) : null}
    </div>
  );
}
