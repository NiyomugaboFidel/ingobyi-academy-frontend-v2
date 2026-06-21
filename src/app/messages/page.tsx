'use client';

import { Suspense } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { MessagingDashboard } from '@/components/messaging/messaging-dashboard';

function MessagesContent() {
  return <MessagingDashboard />;
}

export default function MessagesPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Messages"
        description="Real-time conversations with your courses, trainers, and team."
      />
      <div className="dash-page-fill">
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading messages…</div>}>
          <MessagesContent />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
