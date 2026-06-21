'use client';

import { io, type Socket } from 'socket.io-client';
import { PRODUCTION_WS_URL } from '@/lib/app-urls';

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ||
  PRODUCTION_WS_URL;

let socket: Socket | null = null;
let activeToken: string | null = null;

export function getSocket(token: string): Socket {
  if (socket && activeToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    activeToken = token;
    socket = io(WS_BASE, {
      query: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  activeToken = null;
}
