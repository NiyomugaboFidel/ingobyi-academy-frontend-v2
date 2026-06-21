'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DetailPageSkeleton } from '@/components/dashboard/table-skeleton';
import { CourseChatView } from '@/components/messaging/course-chat-view';

function CourseChatContent() {
  const params = useParams();
  const slug = params.slug as string;
  return <CourseChatView slug={slug} />;
}

export default function CourseChatPage() {
  return (
    <DashboardShell>
      <PageHeader
        title="Course discussion"
        description="Chat with trainers and classmates in real time."
      />
      <div className="dash-page-fill">
        <Suspense fallback={<DetailPageSkeleton />}>
          <CourseChatContent />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
