'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { PresenceProvider } from '@/components/presence/presence-provider';
import { ErrorBoundary } from '@/components/errors/error-boundary';
import { shouldRetryRequest } from '@/lib/api/errors';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: (failureCount, error) =>
              failureCount < 2 && shouldRetryRequest(error),
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <AuthProvider>
        <PresenceProvider>
          <ErrorBoundary fallbackTitle="Application error">
            {children}
          </ErrorBoundary>
        </PresenceProvider>
        <Toaster richColors position="top-right" />
      </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
