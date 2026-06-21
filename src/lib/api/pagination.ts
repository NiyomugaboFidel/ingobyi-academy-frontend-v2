import type { Paginated } from './types';

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

export function clampPage(value: string | number | undefined, fallback = 1): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

export function clampLimit(value: string | number | undefined, fallback = DEFAULT_PAGE_SIZE): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(MAX_PAGE_SIZE, Math.floor(n));
}

export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<Paginated<T>>,
  pageSize = MAX_PAGE_SIZE,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const res = await fetchPage(page, pageSize);
    items.push(...res.data);
    totalPages = res.meta.totalPages;
    page += 1;
  }
  return items;
}
