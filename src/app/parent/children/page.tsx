'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { Button } from '@/components/ui/button';
import { listParentChildren, type ParentChildCourse } from '@/lib/api/parent';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

type Row = ParentChildCourse & { id: string; childName: string; childId: string };

export default function ParentChildrenPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: children = [], isLoading, error, refetch } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => listParentChildren(token),
    enabled: !!token,
  });

  const rows: Row[] = children.flatMap((child) =>
    child.courses.map((course) => ({
      ...course,
      id: course.enrollmentId,
      childName: child.fullName,
      childId: child.id,
    })),
  );

  const columns: DataColumn<Row>[] = [
    { id: 'child', header: 'Child', accessor: (r) => <span className="font-semibold">{r.childName}</span>, sortValue: (r) => r.childName },
    { id: 'course', header: 'Course', accessor: (r) => r.title, sortValue: (r) => r.title },
    { id: 'trainer', header: 'Trainer', accessor: (r) => r.trainer?.name ?? '—', sortValue: (r) => r.trainer?.name ?? '' },
    { id: 'progress', header: 'Progress', accessor: (r) => (
      <div className="flex items-center gap-2">
        <ProgressRing value={r.progressPercent} size={36} stroke={4} />
        <span className="text-xs">{r.progressPercent}%</span>
      </div>
    ), sortValue: (r) => r.progressPercent },
    { id: 'lastLesson', header: 'Last activity', accessor: (r) => new Date(r.lastActivityAt).toLocaleDateString(), sortValue: (r) => r.lastActivityAt },
    { id: 'actions', header: '', accessor: (r) => (
      r.trainer ? (
        <Link href={`/parent/messages?user=${r.trainer.id}`} className="text-xs font-medium text-brand-green hover:underline">Message trainer</Link>
      ) : null
    ), filterable: false },
  ];

  return (
    <DashboardShell allowedRoles={['PARENT', 'SUPERADMIN']}>
      <PageHeader
        title="My children"
        description="Track each child's courses, progress, and contact their trainers."
        breadcrumbs={[{ label: 'Parent', href: '/parent/dashboard' }, { label: 'Children' }]}
        actions={
          <Button asChild size="sm" className="h-8 rounded bg-brand-green text-xs hover:bg-brand-green-dark">
            <Link href="/parent/messages"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Messages</Link>
          </Button>
        }
      />

      {error && <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} className="mb-4" />}

      <div className="dash-table-fill">
        <DataTable
          data={rows}
          columns={columns}
          searchPlaceholder="Search by child or course…"
          searchKeys={[(r) => r.childName, (r) => r.title, (r) => r.trainer?.name ?? '']}
          exportFilename="children-courses.csv"
          pageSize={10}
          emptyMessage={isLoading ? 'Loading…' : 'No course enrollments found for linked children.'}
        />
      </div>
    </DashboardShell>
  );
}
