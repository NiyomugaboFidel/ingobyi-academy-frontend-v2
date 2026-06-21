'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Trophy, BarChart3, MessageSquare } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { EmptyState } from '@/components/dashboard/empty-state';
import { listParentChildren } from '@/lib/api/parent';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

export default function ParentDashboardPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);

  const { data: children = [], isLoading, error, refetch } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => listParentChildren(token),
    enabled: !!token,
  });

  const totalCourses = children.reduce((s, c) => s + c.courseCount, 0);
  const avgProgress = children.length
    ? Math.round(children.reduce((s, c) => s + c.avgProgress, 0) / children.length)
    : 0;
  const totalAchievements = children.reduce((s, c) => s + c.achievements, 0);

  return (
    <DashboardShell allowedRoles={['PARENT', 'SUPERADMIN']}>
      <PageHeader
        title="Family dashboard"
        description={user?.firstName ? `Learning progress for ${user.firstName}'s linked children.` : "Monitor your children's learning."}
        breadcrumbs={[{ label: 'Parent', href: '/parent/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded border-brand-green/15 text-xs">
            <Link href="/parent/messages"><MessageSquare className="h-3.5 w-3.5" /> Message trainer</Link>
          </Button>
        }
      />

      {error && (
        <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} className="mb-4" />
      )}

      <StatGrid cols={4}>
        <StatCard title="Children" value={isLoading ? '…' : children.length} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Total courses" value={isLoading ? '…' : totalCourses} icon={<BookOpen className="h-4 w-4" />} />
        <StatCard title="Avg. progress" value={isLoading ? '…' : `${avgProgress}%`} icon={<BarChart3 className="h-4 w-4" />} changeType="positive" />
        <StatCard title="Achievements" value={isLoading ? '…' : totalAchievements} icon={<Trophy className="h-4 w-4" />} />
      </StatGrid>

      {!isLoading && children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No linked children"
          description="When an administrator links your account to a student, their progress will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/parent/children?child=${child.id}`}
              className="dash-card flex items-center gap-4 px-3.5 py-4 transition-colors hover:border-brand-green/20"
            >
              <ProgressRing value={child.avgProgress} size={64} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{child.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{child.organization?.name ?? 'Ingobyi Academy'}</p>
                <p className="mt-1 text-[11px] text-brand-green">
                  {child.courseCount} courses · {child.achievements} achievements
                  {child.lastActiveAt && ` · Active ${new Date(child.lastActiveAt).toLocaleDateString()}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
