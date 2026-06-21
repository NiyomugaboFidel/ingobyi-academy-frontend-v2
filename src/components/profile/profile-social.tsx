'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, UserMinus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { HtmlContent } from '@/components/editor/html-content';
import { createDirectConversation } from '@/lib/api/messaging';
import { toggleFollow, type CommunityAuthor } from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import { RoleBadge, UserNameWithBadges, VerifiedMarker } from '@/components/user/user-badges';
import { AchievementShowcase } from '@/components/achievements/achievement-grid';
import type { UserRole } from '@/lib/api/types';

type UserListPanelProps = {
  title: string;
  users: CommunityAuthor[];
  currentUserId?: string;
  token?: string | null;
  emptyMessage?: string;
  compact?: boolean;
};

export function UserListPanel({
  title,
  users,
  currentUserId,
  token,
  emptyMessage = 'No one here yet.',
  compact = false,
}: UserListPanelProps) {
  const router = useRouter();

  const followMutation = useMutation({
    mutationFn: (userId: string) => toggleFollow(userId, token!),
  });

  const messageMutation = useMutation({
    mutationFn: async (userId: string) => {
      const conv = await createDirectConversation(userId, token!);
      router.push(`/messages?conversation=${conv.id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not start chat')),
  });

  return (
    <section className={cn('rounded-2xl border border-border bg-card shadow-sm', compact ? 'p-4' : 'p-5')}>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      {users.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {users.map((person) => {
            const isSelf = person.id === currentUserId;
            return (
              <li
                key={person.id}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-3"
              >
                <Link href={`/users/${person.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                    {person.avatarUrl ? (
                      <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      person.firstName[0]
                    )}
                  </div>
                  <div className="min-w-0">
                    <UserNameWithBadges
                      firstName={person.firstName}
                      lastName={person.lastName}
                      displayRole={person.displayRole}
                      isVerified={person.isVerified}
                      nameClassName="truncate text-sm"
                      compact
                    />
                    {'bio' in person && person.bio ? (
                      <p className="truncate text-xs text-muted-foreground">{String(person.bio).replace(/<[^>]+>/g, '')}</p>
                    ) : null}
                    {person.stats && person.displayRole === 'TRAINER' && person.stats.trainerRating != null && (
                      <p className="mt-0.5 text-[10px] font-semibold text-amber-700">
                        ★ {person.stats.trainerRating.toFixed(1)} trainer rating
                      </p>
                    )}
                  </div>
                </Link>
                {!isSelf && token && (
                  <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-full px-2.5 text-[11px]"
                      disabled={followMutation.isPending}
                      onClick={() => followMutation.mutate(person.id)}
                    >
                      <UserPlus className="mr-1 h-3 w-3" /> Follow
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-full bg-brand-green px-2.5 text-[11px] hover:bg-brand-green-dark"
                      disabled={messageMutation.isPending}
                      onClick={() => messageMutation.mutate(person.id)}
                    >
                      <MessageCircle className="mr-1 h-3 w-3" /> Chat
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

type ProfileStatProps = {
  label: string;
  value: number | string;
  active?: boolean;
  onClick?: () => void;
};

export function ProfileStat({ label, value, active, onClick }: ProfileStatProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl border px-4 py-3 text-left transition',
        active
          ? 'border-brand-green/30 bg-brand-green/5'
          : 'border-border bg-background/70 hover:border-brand-green/20',
        onClick && 'cursor-pointer',
      )}
    >
      <p className="text-lg font-extrabold text-foreground">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    </Comp>
  );
}

type ProfileActionsProps = {
  isSelf: boolean;
  isFollowing: boolean;
  isLoggedIn: boolean;
  followPending: boolean;
  messagePending: boolean;
  onFollow: () => void;
  onMessage: () => void;
};

export function ProfileActions({
  isSelf,
  isFollowing,
  isLoggedIn,
  followPending,
  messagePending,
  onFollow,
  onMessage,
}: ProfileActionsProps) {
  if (isSelf) {
    return (
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <Link href="/profile">Edit profile</Link>
      </Button>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button asChild size="sm" className="rounded-full bg-brand-green hover:bg-brand-green-dark">
        <Link href="/login">Sign in to follow</Link>
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={isFollowing ? 'outline' : 'default'}
        className="rounded-full"
        disabled={followPending}
        onClick={onFollow}
      >
        {isFollowing ? (
          <><UserMinus className="mr-1.5 h-4 w-4" /> Unfollow</>
        ) : (
          <><UserPlus className="mr-1.5 h-4 w-4" /> Follow</>
        )}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={messagePending}
        onClick={onMessage}
      >
        <MessageCircle className="mr-1.5 h-4 w-4" /> Message
      </Button>
    </div>
  );
}

export function ProfileHero({
  firstName,
  lastName,
  avatarUrl,
  bio,
  country,
  memberSince,
  displayRole,
  isVerified,
  achievements,
  actions,
}: {
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  memberSince?: string;
  displayRole?: UserRole | string | null;
  isVerified?: boolean;
  achievements?: import('@/lib/api/achievements').UnifiedAchievement[];
  actions?: React.ReactNode;
}) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-28 bg-gradient-to-r from-brand-green via-brand-green to-brand-green-dark" />
      <div className="relative px-6 pb-6">
        <div className="absolute -top-12 left-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-brand-green text-2xl font-extrabold text-white shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-14 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-foreground">
                {firstName} {lastName}
              </h1>
              <VerifiedMarker role={displayRole} isVerified={isVerified} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {displayRole && <RoleBadge role={displayRole} />}
              {country && <span className="text-xs text-muted-foreground">{country}</span>}
              {memberSince && <span className="text-xs text-muted-foreground">Member since {memberSince}</span>}
            </div>
            {bio && (
              <HtmlContent html={bio} className="prose prose-sm mt-3 max-w-2xl text-muted-foreground" />
            )}
            {achievements && achievements.length > 0 && (
              <AchievementShowcase achievements={achievements} className="mt-4" />
            )}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
