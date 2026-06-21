'use client';

import { Suspense } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { MessagingDashboard } from '@/components/messaging/messaging-dashboard';

export default function AdminMessagesPage() {
  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Messages"
        description="Communicate with your organization members."
      />
      <div className="dash-page-fill">
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
          <MessagingDashboard />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
