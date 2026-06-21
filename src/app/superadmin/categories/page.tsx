'use client';

import { useQuery } from '@tanstack/react-query';
import { Tags } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { getErrorMessage } from '@/lib/api/errors';
import { listCategories, type CourseCategory } from '@/lib/api/superadmin';

type CategoryRow = CourseCategory & { subCount: number };

export default function SuperadminCategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => listCategories(),
  });

  const rows: CategoryRow[] = categories.map((c) => ({
    ...c,
    subCount: c.children?.length ?? 0,
  }));

  const columns: DataColumn<CategoryRow>[] = [
    {
      id: 'name',
      header: 'Category',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-brand-green/10 bg-brand-green/5">
            <Tags className="h-3.5 w-3.5 text-brand-green" />
          </div>
          <span className="font-medium text-brand-ink">{r.name}</span>
        </div>
      ),
      sortValue: (r) => r.name,
    },
    {
      id: 'slug',
      header: 'Slug',
      accessor: (r) => (
        <span className="font-mono text-[11px] text-brand-muted">{r.slug}</span>
      ),
      sortValue: (r) => r.slug,
    },
    {
      id: 'subcategories',
      header: 'Subcategories',
      accessor: (r) => (
        <span className="text-[11px] text-brand-muted">
          {r.subCount > 0 ? r.subCount : '—'}
        </span>
      ),
      sortValue: (r) => r.subCount,
    },
    {
      id: 'children',
      header: 'Children',
      accessor: (r) =>
        r.children?.length ? (
          <div className="flex flex-wrap gap-1">
            {r.children.map((child) => (
              <span
                key={child.id}
                className="inline-flex rounded border border-brand-green/12 bg-brand-green/5 px-2 py-0.5 text-[10px] font-medium text-brand-green"
              >
                {child.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-brand-muted">None</span>
        ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="Course categories"
          description="Platform taxonomy used to organize courses in the public catalog."
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Categories' },
          ]}
        />

        {error && (
          <ApiErrorBanner
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
            retrying={isLoading}
          />
        )}

        {isLoading ? (
          <ListPageSkeleton />
        ) : rows.length === 0 && !error ? (
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Categories will appear here once they are seeded or created in the platform."
            primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
            secondaryAction={{ label: 'Dashboard', href: '/superadmin/dashboard' }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search categories…"
            searchKeys={[(r) => r.name, (r) => r.slug]}
            exportFilename="categories.csv"
            pageSize={15}
          />
        )}
      
    </DashboardShell>
  );
}
