import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  /** sm = sidebar/compact, md = navbar (old-frontend h-20), lg/xl = login & hero */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'onDark';
};

export const BRAND_LOGO_SRC = '/landing/ingoby-innovation-hub-green.png';
const LOGO_SRC = BRAND_LOGO_SRC;

const heights: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-10 w-auto max-h-10',
  md: 'h-14 w-auto max-h-14 sm:h-16 sm:max-h-16 md:h-20 md:max-h-20',
  lg: 'h-12 w-auto max-h-12 sm:h-14 sm:max-h-14 md:h-16 md:max-h-16',
  xl: 'h-14 w-auto max-h-14 sm:h-16 sm:max-h-16 md:h-20 md:max-h-20',
};

export function BrandLogo({ className, size = 'md', variant = 'default' }: BrandLogoProps) {
  return (
    <div className={cn('flex shrink-0 items-center', className)}>
      <img
        src={LOGO_SRC}
        alt="Ingobyi Innovation Hub"
        width={62}
        height={80}
        decoding="async"
        loading="eager"
        className={cn(
          'object-contain object-left',
          heights[size] ?? heights.md,
          variant === 'onDark' && 'drop-shadow-sm',
        )}
      />
    </div>
  );
}
