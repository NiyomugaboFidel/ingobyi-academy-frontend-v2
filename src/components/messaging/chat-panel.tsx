'use client';

import { Suspense } from 'react';
import { MessagingDashboard } from './messaging-dashboard';

interface ChatPanelProps {
  mode?: 'direct' | 'course' | 'all';
  courseId?: string;
  courseTitle?: string;
}

/** @deprecated Use MessagingDashboard directly */
export function ChatPanel({ courseId, courseTitle }: ChatPanelProps) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <MessagingDashboard courseId={courseId} courseTitle={courseTitle} />
    </Suspense>
  );
}
