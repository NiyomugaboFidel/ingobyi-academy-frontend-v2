'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/errors';
import {
  activateUser,
  deactivateUser,
  listSuperadminUsers,
  type SuperadminUser,
} from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';

type UserRow = SuperadminUser & { name: string };

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN: 'border border-red-200 bg-red-50 text-red-800',
  ADMIN: 'border border-orange-200 bg-orange-50 text-orange-800',
  TRAINER: 'border border-blue-200 bg-blue-50 text-blue-800',
  STUDENT: 'border border-green-200 bg-green-50 text-green-800',
  PARENT: 'border border-purple-200 bg-purple-50 text-purple-800',
};

export default function SuperadminUsersPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const { rows, meta, page, setPage, isLoading, isFetching, error, refetch } = usePaginatedQuery<SuperadminUser>({
    queryKey: ['superadmin', 'users'],
    queryFn: (p, limit) => listSuperadminUsers(token, p, limit),
    pageSize: 15,
    enabled: !!token,
  });

  const tableRows: UserRow[] = rows.map((u) => ({
    ...u,
    name: `${u.firstName} ${u.lastName}`.trim(),
  }));

  async function toggleActive(user: UserRow) {
    setActingId(user.id);
    try {
      if (user.isActive) {
        await deactivateUser(user.id, token);
        toast.success(`${user.name} deactivated`);
      } else {
        await activateUser(user.id, token);
        toast.success(`${user.name} activated`);
      }
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'users'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<UserRow>[] = [
    {
      id: 'name',
      header: 'Name',
      accessor: (r) => <span className="font-medium text-brand-ink">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    { id: 'email', header: 'Email', accessor: (r) => r.email, sortValue: (r) => r.email },
    {
      id: 'role',
      header: 'Role',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[r.platformRole] ?? 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
          {r.platformRole}
        </span>
      ),
      sortValue: (r) => r.platformRole,
    },
    {
      id: 'verified',
      header: 'Verified',
      accessor: (r) => (
        <span className={`text-[11px] font-medium ${r.isVerified ? 'text-green-700' : 'text-brand-muted'}`}>
          {r.isVerified ? 'Yes' : 'No'}
        </span>
      ),
      sortValue: (r) => (r.isVerified ? 1 : 0),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${r.isActive ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-gray-200 bg-gray-50 text-gray-500'}`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortValue: (r) => (r.isActive ? 1 : 0),
    },
    {
      id: 'joined',
      header: 'Joined',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
      sortValue: (r) => r.createdAt,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={actingId === r.id}
          className="h-7 gap-1 rounded border-brand-green/15 text-[11px]"
          onClick={() => toggleActive(r)}
        >
          {r.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
          {r.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="Platform users"
          description={`Manage all ${meta?.total ?? tableRows.length} registered accounts across the platform.`}
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Users' },
          ]}
        />

        {error && (
          <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
        )}

        {!isLoading && tableRows.length === 0 && !error ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Users will appear here once they register on the platform."
            primaryAction={{ label: 'Back to dashboard', href: '/superadmin/dashboard' }}
          />
        ) : (
          <div className="dash-table-fill">
          <DataTable
            data={tableRows}
            columns={columns}
            loading={isLoading || isFetching}
            searchPlaceholder="Search by name or email…"
            searchKeys={[(r) => r.name, (r) => r.email]}
            exportFilename="platform-users.csv"
            pageSize={15}
            serverPagination={
              meta ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage } : undefined
            }
          />
          </div>
        )}
      
    </DashboardShell>
  );
}
