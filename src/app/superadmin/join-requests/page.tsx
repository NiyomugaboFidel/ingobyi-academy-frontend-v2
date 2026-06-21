'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Inbox, X } from 'lucide-react';
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
  listAllJoinRequests,
  reviewJoinRequest,
  type EnrichedJoinRequest,
} from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border border-green-200 bg-green-50 text-green-800',
  REJECTED: 'border border-red-200 bg-red-50 text-red-700',
};

export default function SuperadminJoinRequestsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['superadmin', 'join-requests'],
    queryFn: () => listAllJoinRequests(token),
    enabled: !!token,
  });

  async function handleReview(req: EnrichedJoinRequest, status: 'APPROVED' | 'REJECTED') {
    setActingId(req.id);
    try {
      await reviewJoinRequest(req.orgId, req.id, token, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'join-requests'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<EnrichedJoinRequest>[] = [
    {
      id: 'user',
      header: 'User',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.userName}</p>
          <p className="text-[11px] text-brand-muted">{r.userEmail}</p>
        </div>
      ),
      sortValue: (r) => r.userName ?? '',
    },
    {
      id: 'org',
      header: 'Organization',
      accessor: (r) => r.orgName,
      sortValue: (r) => r.orgName,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING}`}>
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
      accessor: (r) =>
        r.status === 'PENDING' ? (
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
        ) : (
          <span className="text-[11px] text-brand-muted">—</span>
        ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="Join requests"
          description="Review membership requests across all organizations on the platform."
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Join requests' },
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
        ) : requests.length === 0 && !error ? (
          <EmptyState
            icon={Inbox}
            title="No pending requests"
            description="When users request to join an organization, their requests will appear here for review."
            primaryAction={{ label: 'View organizations', href: '/superadmin/organizations' }}
            secondaryAction={{ label: 'Dashboard', href: '/superadmin/dashboard' }}
          />
        ) : (
          <DataTable
            data={requests}
            columns={columns}
            searchPlaceholder="Search by user or organization…"
            searchKeys={[(r) => r.userName ?? '', (r) => r.userEmail ?? '', (r) => r.orgName ?? '']}
            exportFilename="join-requests.csv"
            pageSize={15}
          />
        )}
      
    </DashboardShell>
  );
}
