'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Inbox, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/api/errors';
import {
  listOrgJoinRequests,
  reviewJoinRequest,
  type JoinRequest,
} from '@/lib/api/organizations';
import { addOrgMember } from '@/lib/api/organizations';
import { useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import type { UserRole } from '@/lib/api/types';
import { Input } from '@/components/ui/input';

type JoinRow = JoinRequest & { orgName: string; userName: string; userEmail: string };

export default function AdminJoinRequestsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('STUDENT');
  const [adding, setAdding] = useState(false);

  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const activeMembership = user?.memberships?.find(
    (m) => m.org.id === (activeOrgId ?? user?.activeOrgId),
  ) ?? user?.memberships?.[0];
  const orgId = activeMembership?.org.id;
  const orgName = activeMembership?.org.name ?? 'Organization';

  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'join-requests', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const reqs = await listOrgJoinRequests(orgId, token);
      return reqs.map((r) => ({
        ...r,
        orgName,
        userName: r.userName ?? `${r.user?.firstName ?? ''} ${r.user?.lastName ?? ''}`.trim(),
        userEmail: r.userEmail ?? r.user?.email ?? '',
      }));
    },
    enabled: !!token && !!orgId,
  });

  const noOrg = !orgId;

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !addEmail.trim()) return;
    setAdding(true);
    try {
      await addOrgMember(orgId, token, addEmail.trim(), addRole);
      toast.success('Member added');
      setAddEmail('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests', orgId] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleReview(req: JoinRow, status: 'APPROVED' | 'REJECTED') {
    if (!orgId) return;
    setActingId(req.id);
    try {
      await reviewJoinRequest(orgId, req.id, token, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'join-requests', orgId] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<JoinRow>[] = useMemo(() => [
    {
      id: 'user',
      header: 'User',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.userName}</p>
          <p className="text-[11px] text-brand-muted">{r.userEmail}</p>
        </div>
      ),
      sortValue: (r) => r.userName,
    },
    {
      id: 'role',
      header: 'Requested role',
      accessor: (r) => (
        <span className="inline-flex rounded border border-brand-green/15 bg-brand-green/5 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-green">
          {r.requestedRole.toLowerCase()}
        </span>
      ),
      sortValue: (r) => r.requestedRole,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    {
      id: 'date',
      header: 'Requested',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
      sortValue: (r) => r.createdAt,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="sm"
            disabled={actingId === r.id}
            className="h-7 gap-1 rounded bg-brand-green text-[11px] hover:bg-brand-green-dark"
            onClick={() => handleReview(r, 'APPROVED')}
          >
            <Check className="h-3 w-3" /> Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actingId === r.id}
            className="h-7 gap-1 rounded border-red-200 text-[11px] text-red-700 hover:bg-red-50"
            onClick={() => handleReview(r, 'REJECTED')}
          >
            <X className="h-3 w-3" /> Reject
          </Button>
        </div>
      ),
    },
  ], [actingId, orgId, token]);

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      
        <PageHeader
          title="Join requests"
          description={`Review membership requests for ${orgName}.`}
          breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Join requests' },
          ]}
        />

        {!noOrg && (
          <form
            onSubmit={handleAddMember}
            className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-brand-green/10 bg-white p-4"
          >
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-brand-muted">
                Add existing user by email
              </label>
              <Input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="h-10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-muted">Role</label>
              <select
                value={addRole}
                onChange={(e) => setAddRole(e.target.value as UserRole)}
                className="h-10 rounded-md border border-brand-green/18 bg-white px-3 text-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="TRAINER">Trainer</option>
                <option value="PARENT">Parent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={adding}
              className="h-10 gap-1.5 bg-brand-green hover:bg-brand-green-dark"
            >
              <UserPlus className="h-4 w-4" />
              Add member
            </Button>
          </form>
        )}

        {noOrg && (
          <ApiErrorBanner
            message="No organization linked to your account. Join or create an organization first."
          />
        )}

        {error && (
          <ApiErrorBanner
            message={getErrorMessage(error)}
            onRetry={() => refetch()}
            retrying={isLoading}
          />
        )}

        {isLoading ? (
          <ListPageSkeleton />
        ) : requests.length === 0 && !error && !noOrg ? (
          <EmptyState
            icon={Inbox}
            title="No pending requests"
            description="Membership requests for your organization will appear here."
            primaryAction={{ label: 'Admin dashboard', href: '/admin/dashboard' }}
          />
        ) : !noOrg ? (
          <DataTable
            data={requests}
            columns={columns}
            searchPlaceholder="Search by user…"
            searchKeys={[(r) => r.userName, (r) => r.userEmail]}
            exportFilename="join-requests.csv"
            pageSize={15}
          />
        ) : null}
      
    </DashboardShell>
  );
}
