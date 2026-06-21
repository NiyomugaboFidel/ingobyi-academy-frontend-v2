'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ExternalLink } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getErrorMessage } from '@/lib/api/errors';
import { listSuperadminOrgs, type SuperadminOrg } from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';

export default function SuperadminOrgsPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { rows, meta, page, setPage, isLoading, isFetching, error, refetch } = usePaginatedQuery<SuperadminOrg>({
    queryKey: ['superadmin', 'orgs'],
    queryFn: (p, limit) => listSuperadminOrgs(token, p, limit),
    pageSize: 15,
    enabled: !!token,
  });

  const columns: DataColumn<SuperadminOrg>[] = [
    {
      id: 'name',
      header: 'Organization',
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-brand-green/10 bg-brand-green/5">
            <Building2 className="h-3.5 w-3.5 text-brand-green" />
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
      id: 'type',
      header: 'Type',
      accessor: (r) => (
        <span className="inline-flex rounded border border-brand-green/12 bg-brand-green/5 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-green">
          {r.type.toLowerCase()}
        </span>
      ),
      sortValue: (r) => r.type,
    },
    {
      id: 'created',
      header: 'Created',
      accessor: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
      sortValue: (r) => r.createdAt ?? '',
    },
    {
      id: 'link',
      header: '',
      accessor: (r) => (
        <Link
          href={`/catalog?org=${encodeURIComponent(r.slug)}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-green hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="Organizations"
          description={`All ${meta?.total ?? rows.length} workspaces on the platform.`}
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Organizations' },
          ]}
        />

        {error && (
          <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
        )}

        {!isLoading && rows.length === 0 && !error ? (
          <EmptyState
            icon={Building2}
            title="No organizations yet"
            description="Organizations are created when schools or training centers onboard to the platform."
            primaryAction={{ label: 'Back to dashboard', href: '/superadmin/dashboard' }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            loading={isLoading || isFetching}
            searchPlaceholder="Search organizations…"
            searchKeys={[(r) => r.name, (r) => r.slug]}
            exportFilename="organizations.csv"
            pageSize={15}
            serverPagination={
              meta ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage } : undefined
            }
          />
        )}
      
    </DashboardShell>
  );
}
