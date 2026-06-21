'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Plus, Settings, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/dashboard/empty-state';
import { CardGridSkeleton } from '@/components/dashboard/table-skeleton';
import { switchOrg } from '@/lib/api/auth';
import { applyAuthSession } from '@/lib/api/session';
import { listMyMemberships } from '@/lib/api/organizations';
import { useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import { getEffectiveRole, getRoleHome } from '@/lib/auth/store';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function WorkspacesPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const queryClient = useQueryClient();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const resolvedOrgId = activeOrgId ?? user?.activeOrgId;

  const { data: memberships = [], isLoading } = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => listMyMemberships(token),
    enabled: !!token,
  });

  async function handleSwitch(orgId: string) {
    if (orgId === resolvedOrgId || switchingId) return;
    setSwitchingId(orgId);
    try {
      const data = await switchOrg(token, orgId);
      applyAuthSession(data);
      await queryClient.invalidateQueries();
      toast.success('Workspace switched');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to switch workspace'));
    } finally {
      setSwitchingId(null);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Workspaces"
        description="Switch between organizations you belong to, or join a new one."
        breadcrumbs={[{ label: 'Workspaces' }]}
        actions={
          <Button asChild size="sm" className="gap-1.5 bg-brand-green hover:bg-brand-green-dark">
            <Link href="/onboarding">
              <Plus className="h-3.5 w-3.5" />
              Join or create
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={3} columns="sm:grid-cols-2 lg:grid-cols-3" />
      ) : memberships.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No workspaces yet"
          description="Join an existing organization or create your own to start learning or teaching."
          primaryAction={{ label: 'Get started', href: '/onboarding' }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map((m) => {
            const isActive = m.org.id === resolvedOrgId;
            const role = m.role.charAt(0) + m.role.slice(1).toLowerCase();
            const canManage = m.role === 'ADMIN' && isActive;

            return (
              <div
                key={m.org.id}
                className={cn(
                  'dash-card flex flex-col p-5 transition-shadow',
                  isActive && 'ring-2 ring-brand-green/25',
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-sm font-bold text-brand-green">
                    {m.org.name.slice(0, 2).toUpperCase()}
                  </div>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-mint/25 px-2 py-0.5 text-[10px] font-bold text-brand-green">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-brand-ink">{m.org.name}</h3>
                <p className="mt-0.5 text-xs text-brand-muted">
                  {role} · <span className="font-mono">{m.org.slug}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      disabled={!!switchingId}
                      onClick={() => handleSwitch(m.org.id)}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      {switchingId === m.org.id ? 'Switching…' : 'Switch here'}
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Link href={getRoleHome(getEffectiveRole(user!, m.org.id))}>
                        Open dashboard
                      </Link>
                    </Button>
                  )}

                  {canManage && (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Link href="/admin/organizations">
                        <Settings className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
