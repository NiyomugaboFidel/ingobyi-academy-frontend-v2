'use client';

import { Suspense } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { MessagingDashboard } from '@/components/messaging/messaging-dashboard';

export default function TrainerMessagesPage() {
  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Messages"
        description="Communicate with students, parents, and admins."
      />
      <div className="dash-page-fill">
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
          <MessagingDashboard />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
