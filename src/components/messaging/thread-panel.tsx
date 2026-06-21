'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/lib/auth/store';
import {
  type Message,
  getThreadReplies,
  sendMessage,
} from '@/lib/api/messaging';
import { emitTyping } from '@/lib/messaging/use-messaging-socket';
import { ChatInput } from './chat-input';
import { MessageBubble } from './message-bubble';
import type { UploadedFile } from '@/lib/api/uploads';

interface ThreadPanelProps {
  rootMessage: Message;
  conversationId: string;
  onClose: () => void;
  onThreadUpdate?: (rootId: string, count: number) => void;
}

export function ThreadPanel({
  rootMessage,
  conversationId,
  onClose,
  onThreadUpdate,
}: ThreadPanelProps) {
  const { user, accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [replies, setReplies] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['thread', rootMessage.id],
    queryFn: () => getThreadReplies(rootMessage.id, accessToken!),
    enabled: !!accessToken,
  });

  useEffect(() => {
    if (data?.replies) {
      setReplies(data.replies);
      onThreadUpdate?.(rootMessage.id, data.replies.length);
    }
  }, [data, rootMessage.id, onThreadUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleSend = useCallback(
    async (content: string, plainText: string, attachments?: UploadedFile[]) => {
      if (!accessToken) return;
      try {
        const msg = await sendMessage(conversationId, accessToken, {
          content,
          plainText,
          threadRootId: rootMessage.id,
          replyToId: rootMessage.id,
          attachments,
        });
        setReplies((prev) => [...prev, msg]);
        onThreadUpdate?.(rootMessage.id, replies.length + 1);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch (err) {
        throw err;
      }
    },
    [accessToken, conversationId, rootMessage.id, replies.length, onThreadUpdate, queryClient],
  );

  const handleTyping = (typing: boolean) => {
    if (!accessToken) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTyping(conversationId, accessToken, typing);
    if (typing) {
      typingTimeout.current = setTimeout(() => emitTyping(conversationId, accessToken, false), 3000);
    }
  };

  return (
    <aside className="flex w-full sm:w-96 shrink-0 flex-col border-l border-border/60 bg-background">
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-3">
        <div>
          <h4 className="text-sm font-semibold">Thread</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">{rootMessage.plainText}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1 px-3">
        <div className="py-3">
          <MessageBubble message={rootMessage} isOwn={rootMessage.senderId === user?.id} />
          {replies.length > 0 && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2 px-1">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </p>
          )}
          {isLoading ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading replies…</p>
          ) : (
            replies.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.id}
                showAvatar
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <ChatInput
        conversationId={conversationId}
        draftSuffix={`thread_${rootMessage.id}`}
        onSend={handleSend}
        onTyping={handleTyping}
        placeholder="Reply in thread…"
      />
    </aside>
  );
}
