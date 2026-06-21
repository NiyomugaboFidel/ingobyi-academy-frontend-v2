'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Award, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
import {
  approveCertificateRequest,
  listCertificateRequests,
  rejectCertificateRequest,
  type CertificateRequest,
} from '@/lib/api/certificates';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
import { learningKeys } from '@/lib/query/learning';

type RequestRow = CertificateRequest & {
  studentName: string;
};

export default function AdminCertificateApprovalsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const { orgId } = useActiveOrg();
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const {
    rows,
    meta,
    page,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaginatedQuery<CertificateRequest>({
    queryKey: ['admin', 'certificate-requests', orgId],
    queryFn: (p, limit) =>
      listCertificateRequests(token, p, limit, { orgId, status: 'PENDING' }),
    pageSize: 10,
    enabled: !!token,
  });

  const tableRows: RequestRow[] = rows.map((r) => ({
    ...r,
    studentName: r.user
      ? `${r.user.firstName} ${r.user.lastName}`.trim()
      : 'Unknown',
  }));

  async function handleApprove(id: string) {
    setActingId(id);
    try {
      await approveCertificateRequest(id, token);
      toast.success('Certificate approved and issued');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'certificate-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['certificate-request'] }),
        queryClient.invalidateQueries({ queryKey: learningKeys.myCertificates() }),
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id: string) {
    setActingId(id);
    try {
      await rejectCertificateRequest(id, token, 'Please complete all requirements and resubmit.');
      toast.success('Certificate request rejected');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'certificate-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['certificate-request'] }),
        queryClient.invalidateQueries({ queryKey: learningKeys.myCertificates() }),
      ]);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<RequestRow>[] = [
    {
      id: 'student',
      header: 'Student',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.studentName}</p>
          <p className="text-[11px] text-brand-muted">{r.user?.email}</p>
        </div>
      ),
      sortValue: (r) => r.studentName,
    },
    {
      id: 'course',
      header: 'Course',
      accessor: (r) => r.course?.title ?? '—',
      sortValue: (r) => r.course?.title ?? '',
    },
    {
      id: 'org',
      header: 'Organization',
      accessor: (r) => r.course?.org?.name ?? '—',
      sortValue: (r) => r.course?.org?.name ?? '',
    },
    {
      id: 'requested',
      header: 'Requested',
      accessor: (r) => new Date(r.requestedAt).toLocaleString(),
      sortValue: (r) => r.requestedAt,
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
            onClick={() => handleApprove(r.id)}
          >
            <Check className="h-3 w-3" /> Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actingId === r.id}
            className="h-7 gap-1 rounded border-red-200 text-[11px] text-red-700 hover:bg-red-50"
            onClick={() => handleReject(r.id)}
          >
            <X className="h-3 w-3" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Certificate approvals"
        description="Review student certificate requests after they complete a course."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Certificates' },
        ]}
      />

      {error && (
        <ApiErrorBanner
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      )}

      {isLoading ? (
        <ListPageSkeleton />
      ) : tableRows.length === 0 && !error ? (
        <EmptyState
          icon={Award}
          title="No pending certificate requests"
          description="When students finish a course and request a certificate, they will appear here for your approval."
          primaryAction={{ label: 'Admin dashboard', href: '/admin/dashboard' }}
        />
      ) : (
        <DataTable
          data={tableRows}
          columns={columns}
          loading={isFetching}
          searchPlaceholder="Search by student or course…"
          searchKeys={[(r) => r.studentName, (r) => r.user?.email ?? '', (r) => r.course?.title ?? '']}
          exportFilename="certificate-requests.csv"
          pageSize={10}
          serverPagination={
            meta ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage } : undefined
          }
        />
      )}
    </DashboardShell>
  );
}
