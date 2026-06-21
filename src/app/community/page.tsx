'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Compass,
  Heart,
  Home,
  Link2,
  MessageCircle,
  Send,
  Share2,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { Button } from '@/components/ui/button';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { FeedSkeleton } from '@/components/dashboard/table-skeleton';
import { CommunityDiscoverPanel } from '@/components/community/community-discover-panel';
import { CommunityPersonRow } from '@/components/community/community-person-row';
import { CommunityStatsGrid } from '@/components/community/community-stats-grid';
import {
  commentOnPost,
  createCommunityPost,
  getCommunityFeed,
  getCommunityFollowing,
  getCommunityLeaderboard,
  getCommunityProfile,
  likeCommunityPost,
  sharePostOnLinkedIn,
} from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';
import { UserNameWithBadges } from '@/components/user/user-badges';
import { StarRating } from '@/components/ui/star-rating';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { DraftBadge } from '@/components/ui/draft-badge';
import { toast } from 'sonner';
import { PostCommentForm } from '@/components/community/post-comment-form';

type Tab = 'feed' | 'discover' | 'following';

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'following', label: 'Following', icon: UserCheck },
];

export default function CommunityPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('feed');
  const [page, setPage] = useState(1);
  const {
    text: content,
    setText: setContent,
    clearDraft: clearPostDraft,
    restored: postRestored,
    lastSaved: postLastSaved,
  } = useTextDraft(draftKey('community', 'post'), '', {
    onRestore: () => toast.info('Restored unsaved post draft'),
  });

  const { data: feed, error, refetch, isLoading, isFetching } = useQuery({
    queryKey: ['community', 'feed', page],
    queryFn: () => getCommunityFeed(token, { page, limit: 10 }),
    enabled: !!token && tab === 'feed',
  });

  const { data: followingPage, isLoading: loadingFollowing } = useQuery({
    queryKey: ['community', 'following', user?.id],
    queryFn: () => getCommunityFollowing(user!.id, token, 1, 30),
    enabled: !!token && !!user?.id && tab === 'following',
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: () => getCommunityLeaderboard(token),
    enabled: !!token,
  });

  const { data: myProfile } = useQuery({
    queryKey: ['community', 'profile', user?.id],
    queryFn: () => getCommunityProfile(user!.id, token),
    enabled: !!token && !!user?.id,
  });

  const postMutation = useMutation({
    mutationFn: (text: string) => createCommunityPost(token, { content: text }),
    onSuccess: () => {
      setContent('');
      clearPostDraft();
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
      toast.success('Post published');
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not publish post')),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => likeCommunityPost(postId, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'feed'] }),
    onError: (err) => toast.error(getErrorMessage(err, 'Could not like post')),
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      commentOnPost(postId, token, text),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'feed'] }),
    onError: (err) => toast.error(getErrorMessage(err, 'Could not post comment')),
  });

  const invalidatePeople = () => {
    void queryClient.invalidateQueries({ queryKey: ['community', 'people'] });
    void queryClient.invalidateQueries({ queryKey: ['community', 'following'] });
  };

  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Community</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Share updates, discover people, and connect like a modern chat network.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full shrink-0 rounded-full sm:w-auto">
            <Link href="/messages">
              <MessageCircle className="mr-1.5 h-4 w-4" /> Open messages
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
          {/* Left navigation rail */}
          <nav className="hidden lg:block">
            <div className="sticky top-20 space-y-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                    tab === id
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-brand-green/5 hover:text-brand-green',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </nav>

          {/* Main panel */}
          <div className="min-w-0 space-y-4">
            {/* Mobile & tablet tabs */}
            <div className="scroll-touch scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition sm:px-4',
                    tab === id
                      ? 'bg-brand-green text-white'
                      : 'border border-border bg-card text-muted-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {tab === 'feed' && (
              <div className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (content.trim()) postMutation.mutate(content.trim());
                  }}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                      {user?.firstName?.[0] ?? 'Y'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <DraftBadge restored={postRestored} lastSaved={postLastSaved} onDiscard={clearPostDraft} className="mb-2" />
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share a learning milestone or ask the community…"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green/40"
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!content.trim() || postMutation.isPending}
                          className="rounded-full bg-brand-green hover:bg-brand-green-dark"
                        >
                          <Send className="mr-1.5 h-4 w-4" /> Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                {error && (
                  <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} retrying={isFetching} />
                )}

                {isLoading ? (
                  <FeedSkeleton count={4} />
                ) : (
                  <>
                    <div className={cn('space-y-3', isFetching && 'opacity-70')}>
                      {feed?.data.map((post) => (
                        <article key={post.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                          <div className="flex items-start gap-3">
                            <Link
                              href={`/users/${post.author.id}`}
                              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-green/10 text-sm font-bold text-brand-green ring-2 ring-background"
                            >
                              {post.author.avatarUrl ? (
                                <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                post.author.firstName[0]
                              )}
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link href={`/users/${post.author.id}`} className="hover:text-brand-green">
                                <UserNameWithBadges
                                  firstName={post.author.firstName}
                                  lastName={post.author.lastName}
                                  displayRole={post.author.displayRole}
                                  isVerified={post.author.isVerified}
                                  nameClassName="text-sm"
                                  compact
                                />
                              </Link>
                              <p className="mt-2 text-sm leading-relaxed text-foreground">{post.content}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span>{new Date(post.createdAt).toLocaleString()}</span>
                                <button
                                  type="button"
                                  onClick={() => likeMutation.mutate(post.id)}
                                  className="inline-flex items-center gap-1 hover:text-brand-green"
                                >
                                  <Heart className="h-3.5 w-3.5" /> {post.likesCount}
                                </button>
                                <span className="inline-flex items-center gap-1">
                                  <MessageCircle className="h-3.5 w-3.5" /> {post.comments?.length ?? 0}
                                </span>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 hover:text-brand-green"
                                  onClick={() => {
                                    const url = `${window.location.origin}/community#post-${post.id}`;
                                    sharePostOnLinkedIn(url, post.content.slice(0, 200));
                                  }}
                                >
                                  <Share2 className="h-3.5 w-3.5" /> LinkedIn
                                </button>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 hover:text-brand-green"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(`${window.location.origin}/community#post-${post.id}`);
                                    toast.success('Link copied');
                                  }}
                                >
                                  <Link2 className="h-3.5 w-3.5" /> Copy link
                                </button>
                              </div>

                              {post.comments && post.comments.length > 0 && (
                                <ul className="mt-4 space-y-2 border-t border-border pt-3">
                                  {post.comments.map((comment) => (
                                    <li key={comment.id} className="text-sm">
                                      <UserNameWithBadges
                                        firstName={comment.author.firstName}
                                        lastName={comment.author.lastName}
                                        displayRole={comment.author.displayRole}
                                        isVerified={comment.author.isVerified}
                                        compact
                                        nameClassName="text-sm"
                                      />{' '}
                                      <span className="text-muted-foreground">{comment.content}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <PostCommentForm
                                postId={post.id}
                                disabled={commentMutation.isPending}
                                onSubmit={async (text) => {
                                  await commentMutation.mutateAsync({ postId: post.id, text });
                                }}
                              />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {feed?.meta && feed.meta.totalPages > 1 && (
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          Page {page} of {feed.meta.totalPages} · {feed.meta.total} posts
                        </p>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>
                            Previous
                          </Button>
                          <Button type="button" size="sm" variant="outline" disabled={page >= feed.meta.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === 'discover' && (
              <CommunityDiscoverPanel token={token} currentUserId={user?.id} />
            )}

            {tab === 'following' && (
              <section className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-bold text-foreground">People you follow</h2>
                  <p className="text-xs text-muted-foreground">Message or visit profiles of your connections.</p>
                </div>
                {loadingFollowing ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                    ))}
                  </div>
                ) : followingPage?.data.length ? (
                  <ul className="space-y-2 p-3">
                    {followingPage.data.map((person) => (
                      <li key={person.id}>
                        <CommunityPersonRow
                          person={{ ...person, isFollowing: true }}
                          token={token}
                          currentUserId={user?.id}
                          showReason={false}
                          onFollowChange={invalidatePeople}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Not following anyone yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Discover trainers and classmates to build your network.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      className="mt-4 rounded-full bg-brand-green hover:bg-brand-green-dark"
                      onClick={() => setTab('discover')}
                    >
                      Discover people
                    </Button>
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right sidebar — below feed on tablet, column on desktop */}
          <aside className="grid gap-4 sm:grid-cols-2 lg:block lg:space-y-4">
            {user && myProfile && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:opacity-90">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                    {myProfile.avatarUrl ? (
                      <img src={myProfile.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      `${myProfile.firstName[0]}${myProfile.lastName[0]}`
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {myProfile.firstName} {myProfile.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {myProfile.followerCount ?? 0} followers · {myProfile.followingCount ?? 0} following
                    </p>
                  </div>
                </Link>
                {myProfile.stats && (
                  <div className="mt-4 border-t border-border pt-4">
                    <CommunityStatsGrid
                      stats={myProfile.stats}
                      displayRole={myProfile.displayRole}
                      compact
                    />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-green" />
                <h2 className="font-bold text-foreground">Leaderboard</h2>
              </div>
              <ol className="mt-4 space-y-3">
                {leaderboard.slice(0, 6).map((entry, i) => (
                  <li key={entry.user?.id ?? i} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        i < 3 ? 'bg-brand-green text-white' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {i + 1}
                    </span>
                    {entry.user ? (
                      <Link href={`/users/${entry.user.id}`} className="min-w-0 flex-1 hover:text-brand-green">
                        <UserNameWithBadges
                          firstName={entry.user.firstName}
                          lastName={entry.user.lastName}
                          displayRole={entry.user.displayRole}
                          isVerified={entry.user.isVerified}
                          compact
                          nameClassName="truncate text-sm font-medium"
                        />
                      </Link>
                    ) : (
                      <span className="flex-1">Learner</span>
                    )}
                    <span className="text-xs text-muted-foreground">{entry.points} pts</span>
                  </li>
                ))}
              </ol>
            </div>

            {myProfile?.displayRole === 'TRAINER' && myProfile.stats?.trainerRating != null && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Your trainer rating</p>
                <div className="mt-2">
                  <StarRating
                    value={myProfile.stats.trainerRating}
                    showValue
                    reviewCount={myProfile.stats.trainerReviewCount}
                  />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </LearningShell>
  );
}
