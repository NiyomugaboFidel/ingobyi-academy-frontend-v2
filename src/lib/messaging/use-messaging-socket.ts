'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import type { Message } from '@/lib/api/messaging';

type MessagingSocketHandlers = {
  onMessage?: (message: Message) => void;
  onTyping?: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  onRead?: (data: { conversationId: string; userId: string; count: number }) => void;
  onPresence?: (data: { userId: string; status: string }) => void;
  onNotification?: (payload: unknown) => void;
  onAnnouncement?: (payload: unknown) => void;
};

export function useMessagingSocket(token: string | null, handlers: MessagingSocketHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!token) return;
    const socket = getSocket(token);

    const onMessage = (msg: Message) => handlersRef.current.onMessage?.(msg);
    const onTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) =>
      handlersRef.current.onTyping?.(data);
    const onRead = (data: { conversationId: string; userId: string; count: number }) =>
      handlersRef.current.onRead?.(data);
    const onPresence = (data: { userId: string; status: string }) =>
      handlersRef.current.onPresence?.(data);
    const onNotification = (payload: unknown) => handlersRef.current.onNotification?.(payload);
    const onAnnouncement = (payload: unknown) => handlersRef.current.onAnnouncement?.(payload);

    socket.on('messaging:message', onMessage);
    socket.on('messaging:typing', onTyping);
    socket.on('messaging:read', onRead);
    socket.on('presence:update', onPresence);
    socket.on('notification:new', onNotification);
    socket.on('announcement:new', onAnnouncement);

    const ping = setInterval(() => socket.emit('presence:ping'), 60_000);

    return () => {
      clearInterval(ping);
      socket.off('messaging:message', onMessage);
      socket.off('messaging:typing', onTyping);
      socket.off('messaging:read', onRead);
      socket.off('presence:update', onPresence);
      socket.off('notification:new', onNotification);
      socket.off('announcement:new', onAnnouncement);
    };
  }, [token]);
}

export function joinConversation(conversationId: string, token: string) {
  getSocket(token).emit('messaging:join', { conversationId });
}

export function leaveConversation(conversationId: string, token: string) {
  getSocket(token).emit('messaging:leave', { conversationId });
}

export function emitTyping(conversationId: string, token: string, isTyping: boolean) {
  getSocket(token).emit('messaging:typing', { conversationId, isTyping });
}

export function emitRead(conversationId: string, token: string, messageId?: string) {
  getSocket(token).emit('messaging:read', { conversationId, messageId });
}
