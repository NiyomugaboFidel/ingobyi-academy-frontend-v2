'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/errors';

type UseAsyncDataOptions = {
  enabled?: boolean;
  initialData?: null;
};

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
  options: UseAsyncDataOptions = {},
) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setData(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, retry: load, setError };
}
