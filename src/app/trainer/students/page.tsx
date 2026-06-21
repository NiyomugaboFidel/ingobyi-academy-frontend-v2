'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Users } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { ListPageSkeleton } from '@/components/dashboard/table-skeleton';
import { listTrainerStudents } from '@/lib/api/courses';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

type StudentRow = {
  userId: string;
  id: string;
  name: string;
  email: string;
  course: string;
  status: string;
  enrolledAt: string;
};

export default function TrainerStudentsPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: enrollments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trainer', 'students'],
    queryFn: () => listTrainerStudents(token),
    enabled: !!token,
  });

  const rows: StudentRow[] = enrollments.map((e) => ({
    userId: e.userId,
    id: e.id,
    name: `${e.user.firstName} ${e.user.lastName}`,
    email: e.user.email,
    course: e.course.title,
    status: e.status,
    enrolledAt: new Date(e.enrolledAt).toLocaleDateString(),
  }));

  const columns: DataColumn<StudentRow>[] = [
    {
      id: 'name',
      header: 'Student',
      accessor: (r) => (
        <div>
          <p className="font-medium text-brand-ink">{r.name}</p>
          <p className="text-[11px] text-brand-muted">{r.email}</p>
        </div>
      ),
      sortValue: (r) => r.name,
    },
    { id: 'course', header: 'Course', accessor: (r) => r.course, sortValue: (r) => r.course },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className="inline-flex rounded border border-brand-green/12 bg-brand-green/5 px-2 py-0.5 text-[11px] font-semibold text-brand-green">
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    { id: 'enrolled', header: 'Enrolled', accessor: (r) => r.enrolledAt, sortValue: (r) => r.enrolledAt },
    {
      id: 'actions',
      header: '',
      accessor: (r) => (
        <Link
          href={`/users/${r.userId}?tab=achievements`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" /> Achievements
        </Link>
      ),
    },
  ];

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="My students"
        description="Students enrolled in your courses."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Students' }]}
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isLoading} />
      )}

      {isLoading ? (
        <ListPageSkeleton />
      ) : rows.length === 0 && !error ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Students will appear here once they enroll in your courses."
          primaryAction={{ label: 'My courses', href: '/trainer/courses' }}
        />
      ) : (
        <div className="dash-table-fill">
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search students…"
            searchKeys={[(r) => r.name, (r) => r.email, (r) => r.course]}
            exportFilename="trainer-students.csv"
            pageSize={15}
          />
        </div>
      )}
    </DashboardShell>
  );
}
