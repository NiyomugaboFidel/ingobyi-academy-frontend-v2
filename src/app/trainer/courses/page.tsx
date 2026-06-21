'use client';

import Link from 'next/link';
import { BookOpen, Eye, Plus, Pencil } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { listCourses } from '@/lib/api/courses';
import { useAuthStore } from '@/lib/auth/store';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
import type { Course } from '@/lib/api/types';

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-gray-100 text-gray-600',
};

export default function TrainerCoursesPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { rows, meta, page, setPage, isLoading, isFetching } = usePaginatedQuery<Course>({
    queryKey: ['trainer', 'courses'],
    queryFn: (p, limit) => listCourses(token, p, limit),
    pageSize: 12,
    enabled: !!token,
  });

  const columns: DataColumn<Course>[] = [
    { id: 'title', header: 'Course', accessor: (r) => <span className="font-medium">{r.title}</span>, sortValue: (r) => r.title },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status ?? 'DRAFT'] ?? STATUS_STYLES.DRAFT}`}>
          {(r.status ?? 'DRAFT').replace('_', ' ')}
        </span>
      ),
      sortValue: (r) => r.status ?? 'DRAFT',
      filterValue: (r) => r.status ?? 'DRAFT',
    },
    {
      id: 'actions',
      header: '',
      accessor: (r) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href={`/courses/preview/${r.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
          <Link href={`/trainer/courses/${r.id}/edit`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
            <Pencil className="h-3.5 w-3.5" /> {r.status === 'DRAFT' ? 'Improve' : 'Edit'}
          </Link>
        </div>
      ),
      filterable: false,
    },
  ];

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="My courses"
        description="Create, improve, and submit courses for approval."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Courses' }]}
        actions={
          <Button asChild size="sm" className="h-8 gap-1.5 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
            <Link href="/trainer/courses/new"><Plus className="h-3.5 w-3.5" /> New course</Link>
          </Button>
        }
      />

      {!isLoading && rows.some((r) => r.status === 'DRAFT') && (
        <p className="mb-4 rounded-lg border border-brand-green/15 bg-brand-mint-wash px-4 py-3 text-sm text-brand-ink">
          Draft courses are not public yet. Click <strong>Improve</strong> to add content, then submit for review from the editor.
        </p>
      )}

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to start teaching students."
          primaryAction={{ label: 'Create course', href: '/trainer/courses/new' }}
        />
      ) : (
        <DataTable
          data={rows}
          columns={columns}
          loading={isLoading || isFetching}
          searchPlaceholder="Search courses…"
          searchKeys={[(r) => r.title, (r) => r.shortDescription ?? '']}
          pageSize={12}
          compact
          serverPagination={
            meta
              ? { page, totalPages: meta.totalPages, total: meta.total, onPageChange: setPage }
              : undefined
          }
        />
      )}
    </DashboardShell>
  );
}
