'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, KeyRound, Users, BookOpen, ClipboardCheck, Tags, Inbox,
  GraduationCap, BarChart3, Shield, ArrowUpRight,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { AreaChartCard, BarChartCard, PieChartCard, buildMonthlyEnrollments } from '@/components/dashboard/charts';
import { DataTable, type DataColumn } from '@/components/dashboard/data-table';
import { RoleHero, ActionTile, SectionHeading } from '@/components/dashboard/role-hero';
import { getPlatformStatsSafe, listSuperadminUsers } from '@/lib/api/superadmin';
import { useAuthStore } from '@/lib/auth/store';
import { getErrorMessage } from '@/lib/api/errors';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { Button } from '@/components/ui/button';

type PlatformUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  platformRole: string;
  isActive?: boolean;
};

interface UserRow { id: string; name: string; email: string; role: string; status: string }

const PLATFORM_TOOLS = [
  { href: '/superadmin/organizations', Icon: Building2, label: 'Organizations', description: 'All workspaces' },
  { href: '/superadmin/users', Icon: Users, label: 'Users', description: 'Platform directory' },
  { href: '/superadmin/permissions', Icon: KeyRound, label: 'Permissions', description: 'RBAC matrix' },
  { href: '/superadmin/courses', Icon: BookOpen, label: 'Courses', description: 'Cross-org catalog' },
  { href: '/superadmin/course-approvals', Icon: ClipboardCheck, label: 'Approvals', description: 'Pending reviews' },
  { href: '/superadmin/categories', Icon: Tags, label: 'Categories', description: 'Global taxonomy' },
  { href: '/superadmin/join-requests', Icon: Inbox, label: 'Join requests', description: 'Membership queue' },
];

const ROLE_PANELS = [
  { href: '/admin/dashboard', label: 'Admin panel', Icon: Building2, desc: 'Org operations' },
  { href: '/trainer/dashboard', label: 'Trainer panel', Icon: GraduationCap, desc: 'Teaching tools' },
  { href: '/student/dashboard', label: 'Student panel', Icon: BookOpen, desc: 'Learning experience' },
  { href: '/parent/dashboard', label: 'Parent panel', Icon: Users, desc: 'Family progress' },
];

export default function SuperadminDashboardPage() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const { data: stats, error: statsError, refetch: refetchStats, isLoading: statsLoading } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: () => getPlatformStatsSafe(token!),
    enabled: !!token,
  });

  const { data: usersPage, error: usersError, refetch: refetchUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['superadmin', 'users-preview'],
    queryFn: () => listSuperadminUsers(token!, 1, 20),
    enabled: !!token,
  });

  const userRows: UserRow[] = (usersPage?.data ?? []).slice(0, 20).map((u: PlatformUser) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    role: u.platformRole,
    status: u.isActive !== false ? 'Active' : 'Inactive',
  }));

  const userCols: DataColumn<UserRow>[] = [
    { id: 'name', header: 'Name', accessor: (r) => <span className="font-medium">{r.name}</span>, sortValue: (r) => r.name },
    { id: 'email', header: 'Email', accessor: (r) => r.email, sortValue: (r) => r.email },
    {
      id: 'role',
      header: 'Role',
      accessor: (r) => (
        <span className="inline-flex rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200">
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
  ];

  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      <div className="space-y-6">
        <RoleHero
          variant="superadmin"
          userName={user?.firstName}
          stats={stats ? [
            { label: 'Users', value: stats.users },
            { label: 'Orgs', value: stats.orgs },
            { label: 'Courses', value: stats.courses },
          ] : undefined}
          actions={
            <>
              <Button asChild size="sm" className="rounded-full bg-white text-brand-green hover:bg-white/90">
                <Link href="/superadmin/users"><Users className="mr-1.5 h-4 w-4" /> Manage users</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/superadmin/organizations"><Building2 className="mr-1.5 h-4 w-4" /> Organizations</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link href="/superadmin/permissions"><Shield className="mr-1.5 h-4 w-4" /> Permissions</Link>
              </Button>
            </>
          }
        />

        {(statsError || usersError) && (
          <ApiErrorBanner
            message={getErrorMessage(statsError ?? usersError)}
            onRetry={() => { void refetchStats(); void refetchUsers(); }}
            retrying={statsLoading || usersLoading}
          />
        )}

        <section>
          <SectionHeading title="Platform tools" description="Cross-tenant administration" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_TOOLS.map((tool) => (
              <ActionTile key={tool.href} href={tool.href} Icon={tool.Icon} label={tool.label} description={tool.description} variant={tool.href.includes('permissions') ? 'primary' : 'default'} />
            ))}
          </div>
        </section>

        <StatGrid cols={4}>
          <StatCard title="Platform users" value={stats?.users ?? '—'} icon={<Users className="h-4 w-4" />} change="All roles" changeType="neutral" />
          <StatCard title="Organizations" value={stats?.orgs ?? '—'} icon={<Building2 className="h-4 w-4" />} />
          <StatCard title="Published courses" value={stats?.courses ?? '—'} icon={<BookOpen className="h-4 w-4" />} />
          <StatCard title="Total enrollments" value={stats?.enrollments ?? '—'} icon={<ClipboardCheck className="h-4 w-4" />} changeType="positive" change="Platform-wide" />
        </StatGrid>

        <div className="grid gap-3 lg:grid-cols-3">
          <AreaChartCard title="Platform growth" subtitle="Monthly enrollments" data={buildMonthlyEnrollments(stats?.enrollments ?? 50)} dataKey="enrollments" />
          <BarChartCard
            title="User distribution"
            subtitle="Estimated by role"
            data={[
              { name: 'Students', enrollments: Math.round((stats?.users ?? 0) * 0.6) },
              { name: 'Trainers', enrollments: Math.round((stats?.users ?? 0) * 0.15) },
              { name: 'Admins', enrollments: Math.round((stats?.users ?? 0) * 0.1) },
              { name: 'Parents', enrollments: Math.round((stats?.users ?? 0) * 0.15) },
            ]}
            dataKey="enrollments"
          />
          <PieChartCard
            title="Platform scale"
            subtitle="Orgs vs courses"
            data={[
              { name: 'Organizations', value: stats?.orgs ?? 0 },
              { name: 'Courses', value: stats?.courses ?? 0 },
            ].filter((d) => d.value > 0)}
          />
        </div>

        <section>
          <SectionHeading title="Role panels" description="Jump into any portal to test or support users" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_PANELS.map((panel) => (
              <Link
                key={panel.href}
                href={panel.href}
                className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    <panel.Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300">{panel.label}</p>
                    <p className="text-[11px] text-muted-foreground">{panel.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-600" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="User directory"
            description="Recent platform accounts"
            action={
              <Link href="/superadmin/users" className="text-xs font-semibold text-brand-green hover:underline">
                View all users
              </Link>
            }
          />
          <DataTable
            data={userRows}
            columns={userCols}
            searchPlaceholder="Search users…"
            searchKeys={[(r) => r.name, (r) => r.email]}
            exportFilename="platform-users.csv"
            pageSize={8}
            emptyMessage="No users found."
          />
        </section>
      </div>
    </DashboardShell>
  );
}
