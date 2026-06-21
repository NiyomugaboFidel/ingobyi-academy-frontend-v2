'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Megaphone, Check } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth/store';
import {
  listAnnouncements,
  markAnnouncementRead,
  getAnnouncementUnreadCount,
  type Announcement,
} from '@/lib/api/announcements';

export default function AnnouncementsPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => listAnnouncements(accessToken!),
    enabled: !!accessToken,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['announcements-unread'],
    queryFn: () => getAnnouncementUnreadCount(accessToken!),
    enabled: !!accessToken,
  });

  const handleMarkRead = async (a: Announcement) => {
    if (!accessToken || a.isRead) return;
    await markAnnouncementRead(a.id, accessToken);
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
    queryClient.invalidateQueries({ queryKey: ['announcements-unread'] });
  };

  const scopeLabel = (scope: string) => {
    switch (scope) {
      case 'PLATFORM': return 'Platform';
      case 'ORG': return 'Organization';
      case 'COURSE': return 'Course';
      case 'COHORT': return 'Cohort';
      default: return scope;
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title={unreadCount > 0 ? `Announcements (${unreadCount} unread)` : 'Announcements'}
        description="Platform, organization, and course announcements."
      />
      <div className="dash-page-fill max-w-3xl">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading announcements…</p>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <article
                key={a.id}
                className={cn(
                  'rounded-2xl border p-5 transition-colors',
                  a.isRead
                    ? 'border-border/50 bg-background'
                    : 'border-brand-green/20 bg-brand-green/5',
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">
                        {scopeLabel(a.scope)}
                      </span>
                      {!a.isRead && (
                        <span className="h-2 w-2 rounded-full bg-brand-green" />
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    {a.author && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.author.firstName} {a.author.lastName}
                        {a.publishedAt && ` · ${format(new Date(a.publishedAt), 'MMM d, yyyy')}`}
                      </p>
                    )}
                  </div>
                  {!a.isRead && accessToken && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => handleMarkRead(a)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Mark read
                    </Button>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: a.content }}
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
