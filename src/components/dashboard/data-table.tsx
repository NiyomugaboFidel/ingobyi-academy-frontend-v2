'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Search, Download, Upload, ChevronUp, ChevronDown,
  ChevronsUpDown, Columns3, Filter, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/dashboard/table-skeleton';
import { cn } from '@/lib/utils';

export interface DataColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number | React.ReactNode;
  sortValue?: (row: T) => string | number;
  filterValue?: (row: T) => string;
  filterOptions?: { value: string; label: string }[];
  filterable?: boolean;
  defaultVisible?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataColumn<T>[];
  searchPlaceholder?: string;
  searchKeys?: ((row: T) => string)[];
  onImport?: (rows: Record<string, string>[]) => void;
  exportFilename?: string;
  pageSize?: number;
  emptyMessage?: string;
  toolbar?: React.ReactNode;
  compact?: boolean;
  loading?: boolean;
  serverPagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

type SortDir = 'asc' | 'desc' | null;

function exportCsv<T>(rows: T[], columns: DataColumn<T>[], filename: string) {
  const visible = columns;
  const header = visible.map((c) => c.header).join(',');
  const body = rows.map((row) =>
    visible.map((c) => {
      const v = c.accessor(row);
      const s = typeof v === 'string' || typeof v === 'number' ? String(v) : '';
      return `"${s.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  searchPlaceholder = 'Search…',
  searchKeys,
  onImport,
  exportFilename = 'export.csv',
  pageSize = 10,
  emptyMessage = 'No data found.',
  toolbar,
  compact = false,
  loading = false,
  serverPagination,
}: DataTableProps<T>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);
  const [showCols, setShowCols] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.defaultVisible !== false]))
  );
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const activeCols = columns.filter((c) => visibleCols[c.id] !== false);

  const filterOptionsByCol = useMemo(() => {
    const map: Record<string, { value: string; label: string }[]> = {};
    for (const col of activeCols) {
      if (col.filterable === false) continue;
      if (col.filterOptions?.length) {
        map[col.id] = col.filterOptions;
        continue;
      }
      const unique = new Set<string>();
      for (const row of data) {
        const raw = col.filterValue
          ? col.filterValue(row)
          : col.sortValue
            ? col.sortValue(row)
            : col.accessor(row);
        const value =
          typeof raw === 'string' || typeof raw === 'number'
            ? String(raw).trim()
            : '';
        if (value) unique.add(value);
      }
      const values = [...unique].sort((a, b) => a.localeCompare(b));
      if (values.length > 0) {
        map[col.id] = values.map((value) => ({ value, label: value }));
      }
    }
    return map;
  }, [data, activeCols, columns]);

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) => {
        if (searchKeys) return searchKeys.some((fn) => fn(row).toLowerCase().includes(q));
        return activeCols.some((c) => {
          const v = c.accessor(row);
          return String(v ?? '').toLowerCase().includes(q);
        });
      });
    }
    for (const [colId, val] of Object.entries(colFilters)) {
      if (!val) continue;
      const col = columns.find((c) => c.id === colId);
      if (!col) continue;
      rows = rows.filter((row) => {
        const raw = col.filterValue
          ? col.filterValue(row)
          : col.sortValue
            ? col.sortValue(row)
            : col.accessor(row);
        const cell =
          typeof raw === 'string' || typeof raw === 'number'
            ? String(raw)
            : String(col.accessor(row) ?? '');
        return cell === val;
      });
    }
    if (sortCol && sortDir) {
      const col = columns.find((c) => c.id === sortCol);
      if (col) {
        rows.sort((a, b) => {
          const av = col.sortValue ? col.sortValue(a) : col.accessor(a);
          const bv = col.sortValue ? col.sortValue(b) : col.accessor(b);
          const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, search, sortCol, sortDir, colFilters, activeCols, columns, searchKeys]);

  const isServerMode = !!serverPagination;
  const totalPages = isServerMode
    ? Math.max(1, serverPagination.totalPages)
    : Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageIndex = isServerMode ? serverPagination.page - 1 : page;
  const paged = isServerMode
    ? filtered
    : filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalRows = isServerMode ? serverPagination.total : filtered.length;

  function toggleSort(colId: string) {
    if (sortCol !== colId) { setSortCol(colId); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortCol(null); setSortDir(null); }
    setPage(0);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter(Boolean);
      if (lines.length < 2) return;
      const headers = lines[0]!.split(',').map((h) => h.replace(/"/g, '').trim());
      const rows = lines.slice(1).map((line) => {
        const vals = line.match(/(".*?"|[^,]+)/g)?.map((v) => v.replace(/^"|"$/g, '').trim()) ?? [];
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
      });
      onImport(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const SortIcon = ({ colId }: { colId: string }) => {
    if (sortCol !== colId) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-brand-green" />
      : <ChevronDown className="h-3 w-3 text-brand-green" />;
  };

  return (
    <div className={cn('dash-card overflow-hidden', compact && 'text-xs')}>
      {/* Toolbar */}
      <div className={cn('flex flex-wrap items-center gap-2 border-b border-brand-green/8 bg-brand-canvas px-3', compact ? 'py-2' : 'py-2.5')}>
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded border border-brand-green/10 bg-white px-2.5 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-brand-green">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded border-brand-green/12 text-[11px]"
          onClick={() => setShowFilters((v) => !v)}>
          <Filter className="h-3.5 w-3.5" /> Filters
        </Button>

        <div className="relative">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded border-brand-green/12 text-[11px]"
            onClick={() => setShowCols((v) => !v)}>
            <Columns3 className="h-3.5 w-3.5" /> Columns
          </Button>
          {showCols && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded border border-brand-green/10 bg-white py-2 shadow-lg">
              {columns.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-brand-green/5">
                  <input type="checkbox" checked={visibleCols[c.id] !== false}
                    onChange={() => setVisibleCols((p) => ({ ...p, [c.id]: !p[c.id] }))}
                    className="accent-brand-green" />
                  {c.header}
                </label>
              ))}
            </div>
          )}
        </div>

        <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded border-brand-green/12 text-[11px]"
          onClick={() => exportCsv(filtered, activeCols, exportFilename)}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>

        {onImport && (
          <>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button variant="outline" size="sm" className="h-7 gap-1.5 rounded border-brand-green/12 text-[11px]"
              onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
          </>
        )}

        {toolbar}
        <span className="ml-auto text-[11px] text-brand-muted">
          {loading ? 'Loading…' : `${totalRows} rows`}
        </span>
      </div>

      {/* Column filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 border-b border-brand-green/8 bg-brand-canvas px-3 py-2">
          {activeCols.filter((c) => c.filterable !== false && filterOptionsByCol[c.id]?.length).map((c) => (
            <select
              key={c.id}
              value={colFilters[c.id] ?? ''}
              onChange={(e) => {
                setColFilters((p) => ({ ...p, [c.id]: e.target.value }));
                setPage(0);
              }}
              className="min-w-[140px] rounded border border-brand-green/10 bg-white px-2.5 py-1.5 text-[11px] outline-none focus:border-brand-green"
            >
              <option value="">All {c.header}</option>
              {filterOptionsByCol[c.id]!.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={cn('w-full text-sm', compact && 'dash-table-compact')}>
          <thead className="border-b border-brand-green/10 bg-brand-canvas">
            <tr>
              {activeCols.map((c) => (
                <th key={c.id} className={cn('px-3 py-2.5 text-left', c.className)}>
                  <button type="button" onClick={() => toggleSort(c.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-brand-muted hover:text-brand-green">
                    {c.header} <SortIcon colId={c.id} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-green/6">
            {loading ? (
              <TableSkeleton rows={pageSize} columns={activeCols.length} compact={compact} />
            ) : paged.length === 0 ? (
              <tr><td colSpan={activeCols.length} className="px-3 py-12 text-center text-sm text-brand-muted">{emptyMessage}</td></tr>
            ) : paged.map((row, i) => (
              <tr key={(row as { id?: string }).id ?? i} className="transition-colors hover:bg-brand-green/[0.02]">
                {activeCols.map((c) => (
                  <td key={c.id} className={cn('px-3 py-2.5 text-sm text-brand-ink', c.className)}>
                    {c.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(totalPages > 1 || isServerMode) && (
        <div className="flex items-center justify-between border-t border-brand-green/8 px-3 py-2.5">
          <p className="text-[11px] text-brand-muted">
            Page {currentPageIndex + 1} of {totalPages} · {totalRows} total
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={loading || currentPageIndex === 0}
              onClick={() => {
                if (isServerMode) serverPagination.onPageChange(serverPagination.page - 1);
                else setPage((p) => p - 1);
              }}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={loading || currentPageIndex >= totalPages - 1}
              onClick={() => {
                if (isServerMode) serverPagination.onPageChange(serverPagination.page + 1);
                else setPage((p) => p + 1);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
