'use client';

import { usePathname } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { NotFoundContent } from '@/components/errors/not-found-content';
import { ExploreNav } from '@/components/layout/explore-nav';

const DASHBOARD_PREFIXES = [
  '/admin',
  '/superadmin',
  '/trainer',
  '/student',
  '/parent',
  '/settings',
  '/profile',
  '/notifications',
];

export default function NotFoundPage() {
  const pathname = usePathname();
  const inDashboard = DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p));

  if (inDashboard) {
    return (
      <DashboardShell>
        <NotFoundContent embedded />
      </DashboardShell>
    );
  }

  return (
    <div className="min-h-screen bg-brand-page-bg">
      <ExploreNav />
      <NotFoundContent />
    </div>
  );
}
