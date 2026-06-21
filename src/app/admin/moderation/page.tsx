'use client';

import { useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { FeedSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
import { adminDeletePost, adminListPosts } from '@/lib/api/community';
import { dismissReport, listAllReports, resolveReport } from '@/lib/api/reports';
import { suspendOrgMember } from '@/lib/api/organizations';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { usePaginatedQuery } from '@/lib/hooks/use-paginated-query';
import { toast } from 'sonner';

export default function AdminModerationPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const { orgId: activeOrgId } = useActiveOrg();
  const queryClient = useQueryClient();

  const {
    rows: reports,
    meta: reportsMeta,
    page: reportsPage,
    setPage: setReportsPage,
    isLoading: reportsLoading,
    isFetching: reportsFetching,
    error: reportsError,
    refetch: refetchReports,
  } = usePaginatedQuery({
    queryKey: ['reports', 'admin', activeOrgId],
    queryFn: (p, limit) => listAllReports(token, p, limit, activeOrgId),
    pageSize: 10,
    enabled: !!token,
  });

  const {
    rows: posts,
    meta: postsMeta,
    page: postsPage,
    setPage: setPostsPage,
    isLoading: postsLoading,
    isFetching: postsFetching,
    error: postsError,
    refetch: refetchPosts,
  } = usePaginatedQuery({
    queryKey: ['community', 'admin', activeOrgId],
    queryFn: (p, limit) => adminListPosts(token, p, limit, activeOrgId),
    pageSize: 10,
    enabled: !!token,
  });

  async function handleResolve(id: string) {
    await resolveReport(id, token);
    toast.success('Report resolved');
    queryClient.invalidateQueries({ queryKey: ['reports', 'admin'] });
  }

  async function handleDismiss(id: string) {
    await dismissReport(id, token);
    toast.success('Report dismissed');
    queryClient.invalidateQueries({ queryKey: ['reports', 'admin'] });
  }

  async function handleDeletePost(id: string) {
    await adminDeletePost(id, token);
    toast.success('Post removed');
    queryClient.invalidateQueries({ queryKey: ['community', 'admin'] });
  }

  async function handleSuspend(userId: string) {
    if (!activeOrgId) return;
    await suspendOrgMember(activeOrgId, userId, token);
    toast.success('User suspended from organization');
  }

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Moderation"
        description="Review reports, community posts, and take action on users."
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Moderation' }]}
      />

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Issue reports</h2>
          {reportsMeta && reportsMeta.totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {reportsPage} of {reportsMeta.totalPages}
            </p>
          )}
        </div>

        {reportsError && (
          <ApiErrorBanner message={getErrorMessage(reportsError)} onRetry={() => refetchReports()} retrying={reportsFetching} />
        )}

        {reportsLoading ? (
          <FeedSkeleton count={3} />
        ) : (
          <>
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.type} · {r.status} · {r.user?.email}</p>
                      <p className="mt-2 text-sm">{r.description}</p>
                    </div>
                    {r.status === 'OPEN' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDismiss(r.id)}>Dismiss</Button>
                        <Button size="sm" onClick={() => handleResolve(r.id)} className="bg-brand-green hover:bg-brand-green-dark">Resolve</Button>
                        {r.user && activeOrgId && (
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleSuspend(r.user!.id)}>Suspend user</Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {reportsMeta && reportsMeta.totalPages > 1 && (
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" size="sm" variant="outline" disabled={reportsPage <= 1 || reportsFetching} onClick={() => setReportsPage(reportsPage - 1)}>
                  Previous
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={reportsPage >= reportsMeta.totalPages || reportsFetching} onClick={() => setReportsPage(reportsPage + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Community posts</h2>
          {postsMeta && postsMeta.totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Page {postsPage} of {postsMeta.totalPages}
            </p>
          )}
        </div>

        {postsError && (
          <ApiErrorBanner message={getErrorMessage(postsError)} onRetry={() => refetchPosts()} retrying={postsFetching} />
        )}

        {postsLoading ? (
          <FeedSkeleton count={3} />
        ) : (
          <>
            <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium">{p.author.firstName} {p.author.lastName}</p>
                  <p className="mt-1 text-sm">{p.content}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeletePost(p.id)}>Remove post</Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleSuspend(p.author.id)}>Suspend author</Button>
                  </div>
                </div>
              ))}
            </div>

            {postsMeta && postsMeta.totalPages > 1 && (
              <div className="mt-4 flex justify-end gap-2">
                <Button type="button" size="sm" variant="outline" disabled={postsPage <= 1 || postsFetching} onClick={() => setPostsPage(postsPage - 1)}>
                  Previous
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={postsPage >= postsMeta.totalPages || postsFetching} onClick={() => setPostsPage(postsPage + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </DashboardShell>
  );
}
