'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, GraduationCap, MessageSquare, Star, TrendingUp, Users,
  ClipboardCheck, Calendar, Pencil, ArrowUpRight,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { BarChartCard } from '@/components/dashboard/charts';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { RoleHero, ActionTile, SectionHeading, TrainerHeroActions } from '@/components/dashboard/role-hero';
import { getTrainerDashboard } from '@/lib/api/analytics';
import { useAuthStore } from '@/lib/auth/store';

interface CourseRow {
  id: string;
  title: string;
  status: string;
  enrolled: number;
  completed: number;
  lessonsCompleted: number;
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: 'border border-green-200 bg-green-50 text-green-800',
  PENDING_REVIEW: 'border border-amber-200 bg-amber-50 text-amber-800',
  DRAFT: 'border border-gray-200 bg-gray-50 text-gray-600',
};

export default function TrainerDashboardPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['trainer', 'analytics'],
    queryFn: () => getTrainerDashboard(token),
    enabled: !!token,
  });

  const tableData: CourseRow[] = (stats?.courseBreakdown ?? []).map((c) => ({
    id: c.courseId,
    title: c.title,
    status: c.status,
    enrolled: c.enrolled,
    completed: c.completed,
    lessonsCompleted: c.lessonsCompleted,
  }));

  const columns: DataColumn<CourseRow>[] = [
    {
      id: 'title',
      header: 'Course',
      accessor: (r) => (
        <Link href={`/trainer/courses/${r.id}/edit`} className="font-medium text-foreground hover:text-brand-green">
          {r.title}
        </Link>
      ),
      sortValue: (r) => r.title,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES.DRAFT}`}>
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
    { id: 'enrolled', header: 'Students', accessor: (r) => r.enrolled, sortValue: (r) => r.enrolled },
    { id: 'completed', header: 'Completed', accessor: (r) => r.completed, sortValue: (r) => r.completed },
    {
      id: 'edit',
      header: '',
      accessor: (r) => (
        <Link href={`/trainer/courses/${r.id}/edit`} className="text-xs font-semibold text-brand-green hover:underline">
          Edit
        </Link>
      ),
      filterable: false,
    },
  ];

  const enrollmentChart = (stats?.courseBreakdown ?? []).map((c) => ({
    name: c.title.length > 16 ? c.title.slice(0, 14) + '…' : c.title,
    enrollments: c.enrolled,
  }));

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <div className="space-y-6">
        <RoleHero
          variant="trainer"
          userName={user?.firstName}
          actions={<TrainerHeroActions />}
          stats={isLoading ? undefined : [
            { label: 'Courses', value: stats?.totalCourses ?? 0 },
            { label: 'Students', value: stats?.totalStudents ?? 0 },
            { label: 'Completions', value: stats?.completedEnrollments ?? 0 },
          ]}
        />

        <section>
          <SectionHeading title="Teaching tasks" description="Daily actions for your classroom" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionTile href="/trainer/courses/new" Icon={Pencil} label="Create course" description="Build a new curriculum" variant="primary" />
            <ActionTile href="/trainer/grading" Icon={ClipboardCheck} label="Grade assignments" description="Review student submissions" />
            <ActionTile href="/trainer/attendance" Icon={Calendar} label="Mark attendance" description="Physical & live sessions" />
            <ActionTile href="/trainer/students" Icon={Users} label="View students" description="Enrolled learners" />
            <ActionTile href="/trainer/courses" Icon={BookOpen} label="My courses" description="Edit & publish" />
            <ActionTile href="/trainer/feedback" Icon={Star} label="Student feedback" description="Ratings & reviews" />
            <ActionTile href="/trainer/messages" Icon={MessageSquare} label="Messages" description="Chat with students" />
            <ActionTile href="/community" Icon={GraduationCap} label="Community" description="Engage with learners" />
          </div>
        </section>

        <StatGrid cols={4}>
          <StatCard title="Published courses" value={isLoading ? '…' : stats?.publishedCourses ?? 0} icon={<BookOpen className="h-4 w-4" />} hint={`${stats?.totalCourses ?? 0} total`} />
          <StatCard title="Active students" value={isLoading ? '…' : stats?.activeStudents ?? 0} icon={<Users className="h-4 w-4" />} change={`${stats?.totalStudents ?? 0} enrolled`} changeType="positive" />
          <StatCard title="Lessons completed" value={isLoading ? '…' : stats?.lessonsCompleted ?? 0} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard title="Avg. rating" value={stats?.avgRating != null ? stats.avgRating.toFixed(1) : '—'} icon={<Star className="h-4 w-4" />} hint={stats?.reviewCount ? `${stats.reviewCount} reviews` : 'No reviews yet'} />
        </StatGrid>

        <div className="grid gap-6 lg:grid-cols-5">
          {enrollmentChart.length > 0 && (
            <div className="lg:col-span-3">
              <BarChartCard title="Students per course" subtitle="Who is learning with you" data={enrollmentChart} dataKey="enrollments" />
            </div>
          )}

          {stats?.recentEnrollments && stats.recentEnrollments.length > 0 && (
            <div className="lg:col-span-2">
              <SectionHeading title="New enrollments" description="Latest students joining your courses" />
              <ul className="dash-card divide-y divide-border">
                {stats.recentEnrollments.slice(0, 6).map((row) => (
                  <li key={row.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{row.studentName}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.courseTitle}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(row.enrolledAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/trainer/students" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-green hover:underline">
                All students <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        <section>
          <SectionHeading
            title="Course performance"
            description="Track enrollment and completion across your courses"
            action={
              <Link href="/trainer/courses" className="text-xs font-semibold text-brand-green hover:underline">
                Manage all courses
              </Link>
            }
          />
          <DataTable
            data={tableData}
            columns={columns}
            searchPlaceholder="Search your courses…"
            searchKeys={[(r) => r.title]}
            exportFilename="trainer-courses.csv"
            pageSize={6}
            emptyMessage="No courses yet. Create your first course to start teaching."
          />
        </section>
      </div>
    </DashboardShell>
  );
}
