'use client';

import { useEffect, type ReactNode } from 'react';
import { getSocket } from '@/lib/socket';
import { getPresenceStats } from '@/lib/api/messaging';
import { useAuthStore } from '@/lib/auth/store';
import { useOrgStore } from '@/lib/org/store';
import { usePresenceStore } from '@/lib/presence/store';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';
import type { PresenceStats } from '@/lib/presence/store';

export function PresenceProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const activeOrgId = useOrgStore((s) => s.activeOrgId);
  const networkOnline = useNetworkStatus();
  const setStats = usePresenceStore((s) => s.setStats);
  const setUserPresence = usePresenceStore((s) => s.setUserPresence);
  const setConnected = usePresenceStore((s) => s.setConnected);

  useEffect(() => {
    if (!token || !networkOnline) {
      setConnected(false);
      return;
    }

    const socket = getSocket(token);
    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onStats = (stats: PresenceStats) => setStats(stats);
    const onPresence = (data: { userId: string; status: string }) => {
      setUserPresence(data.userId, data.status as 'ONLINE' | 'OFFLINE' | 'AWAY');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('presence:stats', onStats);
    socket.on('presence:update', onPresence);

    getPresenceStats(token, activeOrgId ?? undefined)
      .then(setStats)
      .catch(() => undefined);

    const ping = window.setInterval(() => socket.emit('presence:ping'), 60_000);

    return () => {
      window.clearInterval(ping);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence:stats', onStats);
      socket.off('presence:update', onPresence);
    };
  }, [token, activeOrgId, networkOnline, setStats, setUserPresence, setConnected]);

  return children;
}
