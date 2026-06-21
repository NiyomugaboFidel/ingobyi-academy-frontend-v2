'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RoleBadge, UserNameWithBadges } from '@/components/user/user-badges';
import { createDirectConversation } from '@/lib/api/messaging';
import { toggleFollow, type CommunityAuthor } from '@/lib/api/community';
import { getErrorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/utils';

type Props = {
  person: CommunityAuthor;
  token?: string | null;
  currentUserId?: string;
  compact?: boolean;
  showReason?: boolean;
  onFollowChange?: () => void;
  className?: string;
};

export function CommunityPersonRow({
  person,
  token,
  currentUserId,
  compact = false,
  showReason = true,
  onFollowChange,
  className,
}: Props) {
  const router = useRouter();
  const isSelf = person.id === currentUserId;

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(person.id, token!),
    onSuccess: (data) => {
      onFollowChange?.();
      toast.success(data.following ? 'Following' : 'Unfollowed');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const messageMutation = useMutation({
    mutationFn: () => createDirectConversation(person.id, token!),
    onSuccess: (conv) => router.push(`/messages?conversation=${conv.id}`),
    onError: (err) => toast.error(getErrorMessage(err, 'Could not start chat')),
  });

  const subtitle =
    showReason && person.suggestionReason
      ? person.suggestionReason
      : person.bio
        ? person.bio.replace(/<[^>]+>/g, '').slice(0, 72)
        : person.followerCount != null
          ? `${person.followerCount} follower${person.followerCount === 1 ? '' : 's'}`
          : null;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 p-3 transition hover:border-brand-green/25 hover:bg-brand-green/[0.03]',
        className,
      )}
    >
      <Link href={`/users/${person.id}`} className="shrink-0">
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-green/10 ring-2 ring-background">
          {person.avatarUrl ? (
            <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-brand-green">
              {person.firstName[0]}
              {person.lastName[0]}
            </span>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/users/${person.id}`} className="block hover:text-brand-green">
          <UserNameWithBadges
            firstName={person.firstName}
            lastName={person.lastName}
            displayRole={person.displayRole}
            isVerified={person.isVerified}
            compact={compact}
            nameClassName="text-sm"
          />
        </Link>
        {!compact && person.displayRole && (
          <div className="mt-1">
            <RoleBadge role={person.displayRole} compact />
          </div>
        )}
        {subtitle && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {!isSelf && token && (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={person.isFollowing ? 'secondary' : 'default'}
            disabled={followMutation.isPending}
            onClick={() => followMutation.mutate()}
            className={cn(
              'h-8 rounded-full px-3 text-[11px] font-semibold',
              !person.isFollowing && 'bg-brand-green hover:bg-brand-green-dark',
            )}
          >
            {person.isFollowing ? (
              <>
                <UserCheck className="mr-1 h-3.5 w-3.5" /> Following
              </>
            ) : (
              <>
                <UserPlus className="mr-1 h-3.5 w-3.5" /> Follow
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={messageMutation.isPending}
            onClick={() => messageMutation.mutate()}
            className="h-8 w-8 rounded-full p-0"
            aria-label={`Message ${person.firstName}`}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
