'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen, Building2, Users, GraduationCap, ClipboardCheck,
  Download, Tags, Inbox, Plus, Shield, Banknote, UserPlus, BarChart3,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { AreaChartCard, PieChartCard, buildMonthlyEnrollments } from '@/components/dashboard/charts';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { RoleHero, ActionTile, SectionHeading } from '@/components/dashboard/role-hero';
import { getOrgStats, exportOrgData } from '@/lib/api/analytics';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { listAuditLogs } from '@/lib/api/audit';
import { getErrorMessage } from '@/lib/api/errors';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { useAuthStore } from '@/lib/auth/store';
import { Button } from '@/components/ui/button';

interface ActivityRow { id: string; action: string; user: string; date: string; status: string }

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'border border-green-200 bg-green-50 text-green-800',
  CREATE: 'border border-brand-green/15 bg-brand-green/5 text-brand-green',
  UPDATE: 'border border-blue-200 bg-blue-50 text-blue-800',
  DELETE: 'border border-red-200 bg-red-50 text-red-700',
};

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { orgId, orgName } = useActiveOrg();

  const { data: stats, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['analytics', 'org', orgId],
    queryFn: () => getOrgStats(orgId!, token!),
    enabled: !!token && !!orgId,
  });

  const { data: auditPage, error: auditError, refetch: refetchAudit } = useQuery({
    queryKey: ['audit', orgId],
    queryFn: () => listAuditLogs(token!, { orgId: orgId ?? undefined, page: 1, limit: 20 }),
    enabled: !!token && !!orgId,
  });

  const activityRows: ActivityRow[] = (auditPage?.data ?? []).map((entry) => ({
    id: entry.id,
    action: `${entry.action} ${entry.entity}`,
    user: entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : 'System',
    date: new Date(entry.createdAt).toLocaleDateString(),
    status: entry.action,
  }));

  const completionRate = stats
    ? Math.round((stats.completions / Math.max(stats.enrollments, 1)) * 100)
    : 0;

  const activityCols: DataColumn<ActivityRow>[] = [
    { id: 'action', header: 'Action', accessor: (r) => r.action, sortValue: (r) => r.action },
    { id: 'user', header: 'User', accessor: (r) => r.user, sortValue: (r) => r.user },
    { id: 'date', header: 'Date', accessor: (r) => r.date, sortValue: (r) => r.date },
    {
      id: 'status',
      header: 'Type',
      accessor: (r) => (
        <span className={`inline-flex rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? 'border border-gray-200 bg-gray-50 text-gray-700'}`}>
          {r.status}
        </span>
      ),
      sortValue: (r) => r.status,
    },
  ];

  return (
    <DashboardShell allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <RoleHero
          variant="admin"
          userName={user?.firstName}
          orgName={orgName ?? undefined}
          stats={stats ? [
            { label: 'Members', value: stats.members },
            { label: 'Courses', value: stats.courses },
            { label: 'Completion', value: `${completionRate}%` },
          ] : undefined}
          actions={
            <>
              <Button asChild size="sm" className="rounded-full bg-white text-brand-green hover:bg-white/90">
                <Link href="/trainer/courses/new"><Plus className="mr-1.5 h-4 w-4" /> New course</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/admin/join-requests"><UserPlus className="mr-1.5 h-4 w-4" /> Join requests</Link>
              </Button>
              {orgId && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  onClick={() => exportOrgData(orgId, 'csv', token!)}
                >
                  <Download className="mr-1.5 h-4 w-4" /> Export data
                </Button>
              )}
            </>
          }
        />

        {(statsError || auditError) && (
          <ApiErrorBanner
            message={getErrorMessage(statsError ?? auditError)}
            onRetry={() => { void refetchStats(); void refetchAudit(); }}
          />
        )}

        <section>
          <SectionHeading title="Operations" description="Manage people, content, and organization health" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionTile href="/admin/users" Icon={Users} label="Manage users" description="Members & roles" variant="primary" />
            <ActionTile href="/admin/join-requests" Icon={Inbox} label="Join requests" description="Pending approvals" variant="warning" />
            <ActionTile href="/admin/moderation" Icon={Shield} label="Moderation" description="Reports & community" />
            <ActionTile href="/admin/course-approvals" Icon={ClipboardCheck} label="Course approvals" description="Review submissions" />
            <ActionTile href="/admin/courses" Icon={BookOpen} label="Courses" description="Org catalog" />
            <ActionTile href="/admin/categories" Icon={Tags} label="Categories" description="Taxonomy" />
            <ActionTile href="/admin/organizations" Icon={Building2} label="Organization" description="Settings & branding" />
            <ActionTile href="/admin/messages" Icon={BarChart3} label="Messages" description="Org communication" />
          </div>
        </section>

        <StatGrid cols={5}>
          <StatCard title="Enrollments" value={stats?.enrollments ?? '—'} icon={<GraduationCap className="h-4 w-4" />} change={`${completionRate}% completed`} changeType="positive" />
          <StatCard title="Active courses" value={stats?.courses ?? '—'} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard title="Completions" value={stats?.completions ?? '—'} icon={<ClipboardCheck className="h-4 w-4" />} />
          <StatCard title="Org members" value={stats?.members ?? '—'} icon={<Users className="h-4 w-4" />} />
          <StatCard
            title="Est. revenue"
            value={stats?.revenue ? `${stats.revenue.currency} ${stats.revenue.totalRevenue.toLocaleString()}` : '—'}
            icon={<Banknote className="h-4 w-4" />}
            hint={stats?.revenue ? `${stats.revenue.paidEnrollments} paid enrollments` : undefined}
          />
        </StatGrid>

        <div className="grid gap-3 lg:grid-cols-2">
          <AreaChartCard
            title="Enrollment trends"
            subtitle="Monthly growth in your organization"
            data={buildMonthlyEnrollments(stats?.enrollments ?? 10)}
            dataKey="enrollments"
          />
          <PieChartCard
            title="Learning outcomes"
            subtitle="Completed vs in progress"
            data={[
              { name: 'Completed', value: stats?.completions ?? 0 },
              { name: 'In progress', value: Math.max(0, (stats?.enrollments ?? 0) - (stats?.completions ?? 0)) },
            ].filter((d) => d.value > 0)}
          />
        </div>

        <section>
          <SectionHeading
            title="Audit log"
            description="Recent actions across your organization"
            action={
              <Link href="/admin/join-requests" className="text-xs font-semibold text-brand-green hover:underline">
                View join requests
              </Link>
            }
          />
          <DataTable
            data={activityRows}
            columns={activityCols}
            searchPlaceholder="Search activity…"
            exportFilename="admin-activity.csv"
            pageSize={6}
            emptyMessage="No recent activity recorded."
          />
        </section>
      </div>
    </DashboardShell>
  );
}
