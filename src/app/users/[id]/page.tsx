'use client';

import { Suspense, use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe2, Heart, MessageCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { LearningShell } from '@/components/layout/learning-shell';
import { ApiErrorBanner } from '@/components/errors/api-error-banner';
import { AchievementGrid } from '@/components/achievements/achievement-grid';
import { AddAchievementForm } from '@/components/achievements/add-achievement-form';
import {
  ProfileActions,
  ProfileHero,
  ProfileStat,
  UserListPanel,
} from '@/components/profile/profile-social';
import { CommunityStatsGrid } from '@/components/community/community-stats-grid';
import { getCommunityProfile, toggleFollow } from '@/lib/api/community';
import { downloadCertificatePdf } from '@/lib/api/certificates';
import { createDirectConversation } from '@/lib/api/messaging';
import { getErrorMessage } from '@/lib/api/errors';
import { getEffectiveRole, useAuthStore } from '@/lib/auth/store';
import { cn } from '@/lib/utils';

type Tab = 'posts' | 'achievements' | 'followers' | 'following';

function UserProfileContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('achievements');
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const highlightCert = searchParams.get('cert');

  useEffect(() => {
    const requested = searchParams.get('tab');
    if (requested === 'posts' || requested === 'achievements' || requested === 'followers' || requested === 'following') {
      setTab(requested);
    }
  }, [searchParams]);

  const { data: profile, error, refetch, isLoading } = useQuery({
    queryKey: ['community', 'profile', id],
    queryFn: () => getCommunityProfile(id, token),
    enabled: !!id,
  });

  useEffect(() => {
    if (!highlightCert || tab !== 'achievements' || !profile) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`cert-${highlightCert}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [highlightCert, tab, profile]);

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(id, token!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'profile', id] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const messageMutation = useMutation({
    mutationFn: () => createDirectConversation(id, token!),
    onSuccess: (conv) => router.push(`/messages?conversation=${conv.id}`),
    onError: (err) => toast.error(getErrorMessage(err, 'Could not start chat')),
  });

  const isSelf = currentUser?.id === id;
  const viewerRole = currentUser ? getEffectiveRole(currentUser) : null;
  const canAwardAchievement =
    !!token &&
    !isSelf &&
    (viewerRole === 'ADMIN' || viewerRole === 'TRAINER' || viewerRole === 'SUPERADMIN');
  const isFollowing = profile?.followers.some((f) => f.followerId === currentUser?.id) ?? false;
  const followerCount = profile?.followerCount ?? profile?.followers.length ?? 0;
  const followingCount = profile?.followingCount ?? profile?.following.length ?? 0;
  const postCount = profile?.postCount ?? profile?.posts.length ?? 0;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'posts', label: 'Posts', count: postCount },
    { id: 'achievements', label: 'Achievements', count: profile?.achievements.length },
    { id: 'followers', label: 'Followers', count: followerCount },
    { id: 'following', label: 'Following', count: followingCount },
  ];

  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      {error && <ApiErrorBanner message={getErrorMessage(error)} onRetry={() => refetch()} className="mb-4" />}

      {isLoading && <div className="h-64 animate-pulse rounded-2xl bg-muted" />}

      {profile && (
        <div className="space-y-6">
          <ProfileHero
            firstName={profile.firstName}
            lastName={profile.lastName}
            avatarUrl={profile.avatarUrl}
            bio={profile.bio}
            country={profile.country}
            displayRole={profile.displayRole}
            isVerified={profile.isVerified}
            achievements={profile.achievements}
            memberSince={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : undefined}
            actions={
              <ProfileActions
                isSelf={isSelf}
                isFollowing={isFollowing}
                isLoggedIn={!!token}
                followPending={followMutation.isPending}
                messagePending={messageMutation.isPending}
                onFollow={() => followMutation.mutate()}
                onMessage={() => messageMutation.mutate()}
              />
            }
          />

          <div className="grid gap-3 sm:grid-cols-4">
            <ProfileStat label="Followers" value={followerCount} active={tab === 'followers'} onClick={() => setTab('followers')} />
            <ProfileStat label="Following" value={followingCount} active={tab === 'following'} onClick={() => setTab('following')} />
            <ProfileStat label="Posts" value={postCount} active={tab === 'posts'} onClick={() => setTab('posts')} />
            <ProfileStat label="Achievements" value={profile.achievements.length} active={tab === 'achievements'} onClick={() => setTab('achievements')} />
          </div>

          <CommunityStatsGrid stats={profile.stats} displayRole={profile.displayRole} />

          <div className="flex flex-wrap gap-2 border-b border-border pb-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold transition',
                  tab === item.id
                    ? 'bg-brand-green text-white'
                    : 'text-muted-foreground hover:bg-brand-green/5 hover:text-brand-green',
                )}
              >
                {item.label}
                {item.count !== undefined ? ` (${item.count})` : ''}
              </button>
            ))}
          </div>

          {tab === 'posts' && (
            <section className="space-y-3">
              {profile.posts.length === 0 ? (
                <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">No community posts yet.</p>
              ) : (
                profile.posts.map((post) => (
                  <article key={post.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <p className="text-sm leading-relaxed text-foreground">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likesCount}</span>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {tab === 'achievements' && (
            <section className="space-y-4">
              {highlightCert && (
                <div className="rounded-xl border border-brand-green/25 bg-brand-mint-wash px-4 py-3 text-sm text-brand-ink">
                  <span className="font-semibold text-brand-green">Certificate verified.</span>{' '}
                  This achievement matches an authentic credential issued on Ingobyi Academy.
                </div>
              )}
              {canAwardAchievement && (
                <AddAchievementForm
                  userId={id}
                  userName={`${profile.firstName} ${profile.lastName}`}
                  token={token!}
                />
              )}
              <AchievementGrid
                achievements={profile.achievements}
                downloadingId={downloadingCertId}
                highlightVerifyCode={highlightCert}
                onDownloadCertificate={
                  isSelf && token
                    ? async (certificateId, title) => {
                        setDownloadingCertId(certificateId);
                        try {
                          await downloadCertificatePdf(certificateId, token, `${title}.pdf`);
                        } catch (err) {
                          toast.error(getErrorMessage(err));
                        } finally {
                          setDownloadingCertId(null);
                        }
                      }
                    : undefined
                }
              />
            </section>
          )}

          {tab === 'followers' && (
            <UserListPanel
              title="Followers"
              users={profile.followerUsers ?? []}
              currentUserId={currentUser?.id}
              token={token}
              emptyMessage="No followers yet."
            />
          )}

          {tab === 'following' && (
            <UserListPanel
              title="Following"
              users={profile.followingUsers ?? []}
              currentUserId={currentUser?.id}
              token={token}
              emptyMessage="Not following anyone yet."
            />
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Globe2 className="h-4 w-4 text-brand-green" /> Public profile
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Profiles are always public on Ingobyi Academy so learners, trainers, and admins can connect in the community.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <MessageCircle className="h-4 w-4 text-brand-green" /> Start a conversation
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Follow people you learn with, then message them directly from their profile or your messages inbox.
              </p>
            </div>
          </div>
        </div>
      )}
    </LearningShell>
  );
}

function UserProfileFallback() {
  return (
    <LearningShell allowedRoles={['STUDENT', 'TRAINER', 'PARENT', 'ADMIN', 'SUPERADMIN']}>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </LearningShell>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <Suspense fallback={<UserProfileFallback />}>
      <UserProfileContent id={id} />
    </Suspense>
  );
}
