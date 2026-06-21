'use client';

import { useEffect } from 'react';
import { PageError } from '@/components/errors/page-error';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-page-bg font-poppins">
      <PageError
        title="Page error"
        message={error.message || 'This page encountered an unexpected error.'}
        onRetry={reset}
      />
    </div>
  );
}
