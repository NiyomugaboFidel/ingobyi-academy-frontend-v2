'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import { getEffectiveRole } from '@/lib/auth/store';
import { switchOrg } from '@/lib/api/auth';
import { applyAuthSession } from '@/lib/api/session';
import { listMyMemberships } from '@/lib/api/organizations';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type WorkspaceSwitcherProps = {
  collapsed?: boolean;
  variant?: 'sidebar' | 'topbar';
};

export function WorkspaceSwitcher({ collapsed, variant = 'sidebar' }: WorkspaceSwitcherProps) {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { activeOrgId } = useOrgStore();
  const queryClient = useQueryClient();
  const [switching, setSwitching] = useState(false);

  const { data: apiMemberships = [] } = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => listMyMemberships(accessToken!),
    enabled: !!accessToken,
    staleTime: 60_000,
  });

  const memberships = useMemo(() => {
    const fromUser = user?.memberships ?? [];
    if (apiMemberships.length === 0) return fromUser;
    return apiMemberships.map((m) => ({
      orgId: m.organizationId,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
      org: m.org,
    }));
  }, [user?.memberships, apiMemberships]);

  const resolvedOrgId = activeOrgId ?? user?.activeOrgId ?? memberships[0]?.org.id;
  const activeMembership =
    memberships.find((m) => m.org.id === resolvedOrgId) ?? memberships[0];
  const org = activeMembership?.org;
  const effectiveRole = user ? getEffectiveRole(user, resolvedOrgId) : 'STUDENT';
  const isTopbar = variant === 'topbar';

  async function handleSwitchOrg(orgId: string) {
    if (!accessToken || orgId === resolvedOrgId || switching) return;
    setSwitching(true);
    try {
      const data = await switchOrg(accessToken, orgId);
      applyAuthSession(data);
      await queryClient.invalidateQueries();
      toast.success('Workspace switched');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to switch workspace'));
    } finally {
      setSwitching(false);
    }
  }

  const orgInitials = org?.name?.slice(0, 2).toUpperCase() ?? 'IA';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 rounded border border-brand-green/12 bg-white text-left transition-colors hover:bg-brand-green/[0.04]',
            isTopbar
              ? 'px-2 py-1'
              : cn('w-full px-2 py-1.5', collapsed && 'justify-center px-1'),
          )}
          title={collapsed && !isTopbar ? org?.name ?? 'Workspace' : undefined}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-green/10 text-[10px] font-bold text-brand-green">
            {orgInitials}
          </div>
          {(!collapsed || isTopbar) && (
            <>
              <div className={cn('min-w-0 flex-1', isTopbar && 'hidden sm:block')}>
                <p className="truncate text-xs font-semibold text-brand-ink">
                  {org?.name ?? 'Select workspace'}
                </p>
                <p className="truncate text-[10px] capitalize text-brand-muted">
                  {switching ? 'Switching…' : effectiveRole.toLowerCase()}
                </p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={isTopbar ? 'end' : 'start'} className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-xs font-semibold text-brand-ink">Your workspaces</p>
          <p className="text-[10px] text-muted-foreground">Switch organization or manage settings</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {memberships.length === 0 ? (
          <DropdownMenuItem asChild>
            <Link href="/onboarding" className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              Join or create organization
            </Link>
          </DropdownMenuItem>
        ) : (
          memberships.map((m) => (
            <DropdownMenuItem
              key={m.org.id}
              onClick={() => handleSwitchOrg(m.org.id)}
              className={cn(m.org.id === resolvedOrgId && 'bg-brand-green/5 font-semibold')}
            >
              <span className="mr-2 text-brand-green">{m.org.id === resolvedOrgId ? '✓' : ''}</span>
              <span className="flex-1 truncate">{m.org.name}</span>
              <span className="ml-2 text-[10px] capitalize text-muted-foreground">
                {m.role.toLowerCase()}
              </span>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/workspaces" className="gap-2">
            <Building2 className="h-3.5 w-3.5" />
            All workspaces
          </Link>
        </DropdownMenuItem>

        {effectiveRole === 'ADMIN' && resolvedOrgId && (
          <DropdownMenuItem asChild>
            <Link href="/admin/organizations" className="gap-2">
              <Settings className="h-3.5 w-3.5" />
              Manage organization
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Join or create organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
