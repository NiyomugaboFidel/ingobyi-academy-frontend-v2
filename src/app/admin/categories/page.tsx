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

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => listCategories(),
  });
//  hello
  const rows: CategoryRow[] = categories.map((c) => ({
    ...c,
    subCount: c.children?.length ?? 0,
  }));

  const columns: DataColumn<CategoryRow>[] = [
    {
      id: 'name',
      header: 'Category',
      accessor: (r) => <span className="font-medium text-brand-ink">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    {
      id: 'slug',
      header: 'Slug',
      accessor: (r) => <span className="font-mono text-[11px] text-brand-muted">{r.slug}</span>,
      sortValue: (r) => r.slug,
    },
    {
      id: 'subcategories',
      header: 'Subcategories',
      accessor: (r) => r.subCount || '—',
      sortValue: (r) => r.subCount,
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      
        <PageHeader
          title="Categories"
          description="Course categories available in the public catalog."
          breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
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
            description="Categories will appear here once configured on the platform."
            primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
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
