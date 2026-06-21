'use client';

import { create } from 'zustand';
import type { PresenceInfo } from '@/lib/api/messaging';

export interface PresenceStats {
  online: number;
  away: number;
  total: number;
}

interface PresenceState {
  stats: PresenceStats;
  users: Record<string, PresenceInfo>;
  connected: boolean;
  setStats: (stats: PresenceStats) => void;
  setUserPresence: (userId: string, status: PresenceInfo['status']) => void;
  setConnected: (connected: boolean) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  stats: { online: 0, away: 0, total: 0 },
  users: {},
  connected: false,
  setStats: (stats) => set({ stats }),
  setUserPresence: (userId, status) =>
    set((s) => ({
      users: { ...s.users, [userId]: { userId, status, lastSeenAt: new Date().toISOString() } },
    })),
  setConnected: (connected) => set({ connected }),
}));
