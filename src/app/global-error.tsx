'use client';

import { useEffect } from 'react';
import { brand } from '@/lib/brand';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: brand.pageBg }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: brand.ink }}>Application error</h1>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'color-mix(in srgb, var(--brand-ink) 65%, transparent)' }}>
              {error.message || 'A critical error occurred. Please reload the page.'}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: '1.5rem',
                padding: '0.625rem 1.25rem',
                background: brand.green,
                color: brand.white,
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
