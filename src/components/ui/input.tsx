import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-brand-ink/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-green/30',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
