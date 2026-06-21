'use client';

import { Users, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePresenceStore } from '@/lib/presence/store';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';

export function OnlineBadge({ className, compact }: { className?: string; compact?: boolean }) {
  const { stats, connected } = usePresenceStore();
  const networkOnline = useNetworkStatus();
  const isLive = networkOnline && connected;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        isLive
          ? 'border-brand-green/20 bg-brand-green/5 text-brand-green'
          : 'border-border bg-muted/50 text-muted-foreground',
        className,
      )}
      title={
        !networkOnline
          ? 'No internet connection'
          : connected
            ? `${stats.online} online, ${stats.away} away`
            : 'Reconnecting to server…'
      }
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            isLive ? 'animate-ping bg-brand-green' : 'bg-muted-foreground',
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            isLive ? 'bg-brand-green' : 'bg-muted-foreground',
          )}
        />
      </span>
      {networkOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      <Users className="h-3.5 w-3.5" />
      {!compact && (
        <span>
          {!networkOnline ? 'Offline' : connected ? `${stats.online} online` : 'Connecting…'}
          {networkOnline && stats.away > 0 && <span className="opacity-70"> · {stats.away} away</span>}
        </span>
      )}
      {compact && <span>{!networkOnline ? '—' : stats.online}</span>}
    </div>
  );
}

export function PresenceDot({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const status = usePresenceStore((s) => s.users[userId]?.status ?? 'OFFLINE');

  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full ring-2 ring-background',
        status === 'ONLINE' && 'bg-green-500',
        status === 'AWAY' && 'bg-amber-400',
        status === 'OFFLINE' && 'bg-muted-foreground/40',
        className,
      )}
      title={status.toLowerCase()}
    />
  );
}
