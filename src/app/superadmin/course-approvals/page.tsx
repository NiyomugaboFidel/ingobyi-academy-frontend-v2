'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, Check, X, Eye } from 'lucide-react';
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
  approveCourse,
  listPendingCourses,
  rejectCourse,
  type PendingCourse,
} from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';

export default function SuperadminCourseApprovalsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const {
    rows: courses,
    meta,
    page,
    setPage,
    isLoading,
    isFetching,
    error,
    refetch,
  } = usePaginatedQuery<PendingCourse>({
    queryKey: ['superadmin', 'courses-pending'],
    queryFn: (p, limit) => listPendingCourses(token, p, limit),
    pageSize: 10,
    enabled: !!token,
  });

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActingId(id);
    try {
      if (action === 'approve') {
        await approveCourse(id, token);
        toast.success('Course approved');
      } else {
        await rejectCourse(id, token);
        toast.success('Course rejected');
      }
      await queryClient.invalidateQueries({ queryKey: ['superadmin', 'courses-pending'] });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingId(null);
    }
  }

  const columns: DataColumn<PendingCourse>[] = [
    {
      id: 'title',
      header: 'Course',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.title}</p>
          <p className="text-[11px] text-brand-muted">{r.level ?? 'All levels'}</p>
        </div>
      ),
      sortValue: (r) => r.title,
    },
    {
      id: 'org',
      header: 'Organization',
      accessor: (r) => r.org?.name ?? '—',
      sortValue: (r) => r.org?.name ?? '',
    },
    {
      id: 'category',
      header: 'Category',
      accessor: (r) => r.category?.name ?? '—',
      sortValue: (r) => r.category?.name ?? '',
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
      id: 'submitted',
      header: 'Submitted',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
      sortValue: (r) => r.createdAt,
    },
    {
      id: 'actions',
      header: 'Review & approve',
      accessor: (r) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1 text-[11px]">
            <Link href={`/courses/preview/${r.slug}`}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={actingId === r.id}
            className="h-8 gap-1 bg-brand-green text-[11px] hover:bg-brand-green-dark"
            onClick={() => handleAction(r.id, 'approve')}
          >
            <Check className="h-3.5 w-3.5" /> Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actingId === r.id}
            className="h-8 gap-1 border-red-200 text-[11px] text-red-700 hover:bg-red-50"
            onClick={() => handleAction(r.id, 'reject')}
          >
            <X className="h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      <PageHeader
        title="Course approvals"
        description="Review and approve courses submitted for publication."
        breadcrumbs={[
          { label: 'Superadmin', href: '/superadmin/dashboard' },
          { label: 'Approvals' },
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
      ) : courses.length === 0 && !error ? (
        <EmptyState
          icon={BookOpen}
          title="No pending courses"
          description="Courses awaiting review will appear here when trainers submit them for approval."
          primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
          secondaryAction={{ label: 'Dashboard', href: '/superadmin/dashboard' }}
        />
      ) : (
        <DataTable
          data={courses}
          columns={columns}
          loading={isFetching}
          searchPlaceholder="Search pending courses…"
          searchKeys={[(r) => r.title, (r) => r.org?.name ?? '']}
          exportFilename="pending-courses.csv"
          pageSize={10}
          serverPagination={
            meta ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage } : undefined
          }
        />
      )}
    </DashboardShell>
  );
}
