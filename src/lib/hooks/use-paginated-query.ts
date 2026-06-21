'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Paginated } from '@/lib/api/types';

type PaginatedQueryFn<T> = (page: number, limit: number) => Promise<Paginated<T>>;

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  initialPage = 1,
}: {
  queryKey: unknown[];
  queryFn: PaginatedQueryFn<T>;
  pageSize?: number;
  enabled?: boolean;
  initialPage?: number;
}) {
  const [page, setPage] = useState(initialPage);

  const query = useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: () => queryFn(page, pageSize),
    enabled,
  });

  return {
    rows: query.data?.data ?? [],
    meta: query.data?.meta,
    page,
    setPage,
    pageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
