'use client';

import { cn } from '@/lib/utils';
import { sanitizeHtml, stripHtml } from '@/lib/utils/html';

type HtmlContentProps = {
  html: string;
  className?: string;
  /** Render as plain text only (no HTML). */
  plain?: boolean;
  /** Max plain-text length when plain=true. */
  maxLength?: number;
};

export function HtmlContent({ html, className, plain, maxLength }: HtmlContentProps) {
  if (!html?.trim() || stripHtml(html) === '') {
    return null;
  }

  if (plain) {
    let text = stripHtml(html);
    if (maxLength && text.length > maxLength) {
      text = `${text.slice(0, maxLength).trim()}…`;
    }
    return <p className={cn('text-sm text-brand-ink/75', className)}>{text}</p>;
  }

  const safe = sanitizeHtml(html);

  return (
    <div
      className={cn(
        'rich-content prose prose-sm max-w-none text-brand-ink/85',
        'prose-headings:font-semibold prose-headings:text-brand-ink',
        'prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline',
        'prose-img:rounded-lg prose-img:border prose-img:border-brand-green/10',
        'prose-blockquote:border-brand-green/20 prose-blockquote:text-brand-ink/70',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
