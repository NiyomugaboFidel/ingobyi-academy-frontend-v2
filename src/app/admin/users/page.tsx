'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import { AddUserPanel } from '@/components/admin/add-user-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
import {
  listOrgMembers,
  revokeOrgMemberSessions,
  updateOrgMember,
} from '@/lib/api/organizations';
import { listSuperadminUsers } from '@/lib/api/superadmin';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
import type { UserRole } from '@/lib/api/types';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
};

const ROLE_STYLES: Record<string, string> = {
  SUPERADMIN: 'border border-red-200 bg-red-50 text-red-800',
  ADMIN: 'border border-orange-200 bg-orange-50 text-orange-800',
  TRAINER: 'border border-blue-200 bg-blue-50 text-blue-800',
  STUDENT: 'border border-green-200 bg-green-50 text-green-800',
  PARENT: 'border border-purple-200 bg-purple-50 text-purple-800',
};

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { orgId, effectiveRole } = useActiveOrg();
  const isSuperadmin = user?.platformRole === 'SUPERADMIN';
  const [actingId, setActingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');

  const queryKey = ['admin', 'users', effectiveRole, orgId, isSuperadmin];

  const {
    rows: rawRows,
    meta,
    page,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaginatedQuery({
    queryKey,
    queryFn: async (p, limit) => {
      if (isSuperadmin) {
        return listSuperadminUsers(token, p, limit);
      }
      if (!orgId) {
        return { data: [], meta: { page: 1, limit, total: 0, totalPages: 0 } };
      }
      const members = await listOrgMembers(orgId, token, p, limit);
      return {
        data: members.data.map((m) => ({
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          email: m.user.email,
          platformRole: m.role,
          isActive: m.status === 'ACTIVE',
          createdAt: '',
        })),
        meta: members.meta,
      };
    },
    pageSize: 15,
    enabled: !!token && (isSuperadmin || !!orgId),
  });

  const rows: UserRow[] = rawRows.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.platformRole,
    status: u.isActive !== false ? 'Active' : 'Inactive',
    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—',
  }));

  async function handleRevokeSessions(row: UserRow) {
    if (!orgId) return;
    setActingId(row.id);
    try {
      await revokeOrgMemberSessions(orgId, row.id, token);
      toast.success(`${row.name} signed out everywhere`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function saveRole(row: UserRow) {
    if (!orgId) return;
    setActingId(row.id);
    try {
      await updateOrgMember(orgId, row.id, token, editRole);
      toast.success('Role updated');
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey });
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
      accessor: (r) =>
        editingId === r.id && orgId ? (
          <div className="flex items-center gap-1">
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              className="h-7 rounded border px-2 text-[11px]"
            >
              <option value="STUDENT">Student</option>
              <option value="TRAINER">Trainer</option>
              <option value="PARENT">Parent</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button type="button" size="sm" className="h-7 text-[10px]" onClick={() => saveRole(r)} disabled={actingId === r.id}>
              Save
            </Button>
          </div>
        ) : (
          <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[r.role] ?? 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
            {r.role}
          </span>
        ),
      sortValue: (r) => r.role,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${r.status === 'Active' ? 'border border-green-200 bg-green-50 text-green-800' : 'border border-gray-200 bg-gray-50 text-gray-500'}`}>
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    { id: 'joined', header: 'Joined', accessor: (r) => r.joined, sortValue: (r) => r.joined },
    ...(orgId && !isSuperadmin
      ? [
          {
            id: 'actions',
            header: 'Actions',
            accessor: (r: UserRow) => (
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-[11px]"
                  onClick={() => {
                    setEditingId(r.id);
                    setEditRole(r.role as UserRole);
                  }}
                >
                  <Pencil className="h-3 w-3" /> Role
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={actingId === r.id}
                  className="h-7 gap-1 text-[11px] text-amber-800"
                  onClick={() => handleRevokeSessions(r)}
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </Button>
              </div>
            ),
          } satisfies DataColumn<UserRow>,
        ]
      : []),
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Users"
        description={
          isSuperadmin
            ? `All ${meta?.total ?? ''} platform users.`
            : 'Members in Ingobyi Innovation Hub — add, edit roles, or sign users out.'
        }
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Users' }]}
      />

      {orgId && !isSuperadmin && (
        <AddUserPanel
          token={token}
          mode="org"
          orgId={orgId}
          onSuccess={() => queryClient.invalidateQueries({ queryKey })}
        />
      )}

      {!orgId && !isSuperadmin && (
        <ApiErrorBanner message="No organization linked to your account." />
      )}

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
      )}

      {isLoading ? (
        <ListPageSkeleton />
      ) : rows.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Add users above — they can sign in without email verification."
          primaryAction={{ label: 'Admin dashboard', href: '/admin/dashboard' }}
        />
      ) : (
        <div className="dash-table-fill">
          <DataTable
            data={rows}
            columns={columns}
            loading={isFetching}
            searchPlaceholder="Search by name or email…"
            searchKeys={[(r) => r.name, (r) => r.email]}
            exportFilename="users.csv"
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
