'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  BookOpen,
  Megaphone,
  MessageSquare,
  Pin,
  Search,
  Star,
  Users,
  VolumeX,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth/store';
import {
  type Conversation,
  type Message,
  type MessagingUser,
  type PresenceInfo,
  listConversations,
  getConversation,
  getCourseConversation,
  listMessages,
  sendMessage,
  markConversationRead,
  getContacts,
  getPresence,
  createDirectConversation,
  reactToMessage,
  getUnreadCount,
  archiveConversation,
  starConversation,
  muteConversation,
} from '@/lib/api/messaging';
import {
  useMessagingSocket,
  joinConversation,
  leaveConversation,
  emitTyping,
  emitRead,
} from '@/lib/messaging/use-messaging-socket';
import type { UploadedFile } from '@/lib/api/uploads';
import { ChatInput } from './chat-input';
import { MessageBubble, DateSeparator } from './message-bubble';
import { ThreadPanel } from './thread-panel';
import { OnlineBadge, PresenceDot } from '@/components/presence/online-badge';
import { usePresenceStore } from '@/lib/presence/store';
import { ConversationListSkeleton, ChatMessagesSkeleton } from '@/components/dashboard/table-skeleton';

type SidebarFilter = 'all' | 'direct' | 'courses' | 'archived' | 'starred';

function initials(user: { firstName: string; lastName: string }) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

interface MessagingDashboardProps {
  courseId?: string;
  courseTitle?: string;
  compact?: boolean;
  initialFilter?: SidebarFilter;
}

export function MessagingDashboard({
  courseId,
  courseTitle,
  compact,
  initialFilter = 'all',
}: MessagingDashboardProps) {
  const { user, accessToken } = useAuthStore();
  const setGlobalPresence = usePresenceStore((s) => s.setUserPresence);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SidebarFilter>(initialFilter);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [presence, setPresence] = useState<Record<string, PresenceInfo>>({});
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConversationRef = useRef<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', filter === 'archived' ? 'archived' : filter === 'starred' ? 'starred' : 'all'],
    queryFn: () =>
      listConversations(
        accessToken!,
        filter === 'archived' ? 'archived' : filter === 'starred' ? 'starred' : undefined,
      ),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['messaging-contacts'],
    queryFn: () => getContacts(accessToken!),
    enabled: !!accessToken,
  });

  const { data: unreadTotal = 0 } = useQuery({
    queryKey: ['messaging-unread'],
    queryFn: () => getUnreadCount(accessToken!),
    enabled: !!accessToken,
    refetchInterval: 15_000,
  });

  const { data: directConversation } = useQuery({
    queryKey: ['conversation', selectedId],
    queryFn: () => getConversation(selectedId!, accessToken!),
    enabled: !!accessToken && !!selectedId && (compact || conversations.length === 0),
  });

  const activeConversation = useMemo(() => {
    const fromList = conversations.find((c) => c.id === selectedId);
    if (fromList) return fromList;
    if (directConversation && directConversation.id === selectedId) return directConversation;
    return null;
  }, [conversations, selectedId, directConversation]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === 'direct') list = list.filter((c) => c.type === 'DIRECT');
    if (filter === 'courses') list = list.filter((c) => c.type === 'COURSE_ROOM');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.lastMessage?.plainText.toLowerCase().includes(q),
      );
    }
    return list;
  }, [conversations, filter, search]);

  const courseRooms = conversations.filter((c) => c.type === 'COURSE_ROOM');
  const directChats = conversations.filter((c) => c.type === 'DIRECT');
  const directOtherIds = useMemo(
    () => new Set(directChats.map((c) => c.otherUser?.id).filter(Boolean) as string[]),
    [directChats],
  );
  const newMessageContacts = contacts.filter((c) => !directOtherIds.has(c.id));

  useEffect(() => {
    const paramId = searchParams.get('conversation');
    if (paramId) setSelectedId(paramId);
    else if (courseId && accessToken) {
      if (compact) {
        getCourseConversation(courseId, accessToken).then((conv) => setSelectedId(conv.id));
      } else {
        const match = conversations.find((c) => c.courseId === courseId);
        if (match) setSelectedId(match.id);
      }
    } else if (!selectedId && !compact && conversations[0]) {
      setSelectedId(conversations[0].id);
    }
  }, [searchParams, courseId, conversations, selectedId, compact, accessToken]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!accessToken) return;
    setLoadingMessages(true);
    try {
      const msgs = await listMessages(conversationId, accessToken);
      setMessages(msgs);
      await markConversationRead(conversationId, accessToken);
      emitRead(conversationId, accessToken);
      queryClient.invalidateQueries({ queryKey: ['messaging-unread'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } finally {
      setLoadingMessages(false);
    }
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (!selectedId || !accessToken) return;

    if (prevConversationRef.current && prevConversationRef.current !== selectedId) {
      leaveConversation(prevConversationRef.current, accessToken);
    }
    joinConversation(selectedId, accessToken);
    prevConversationRef.current = selectedId;
    loadMessages(selectedId);

    return () => {
      if (selectedId && accessToken) leaveConversation(selectedId, accessToken);
    };
  }, [selectedId, accessToken, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  useEffect(() => {
    if (!accessToken || !activeConversation) return;
    const ids = activeConversation.participants.map((p) => p.id);
    getPresence(accessToken, ids).then((records) => {
      const map: Record<string, PresenceInfo> = {};
      records.forEach((r) => {
        map[r.userId] = r;
        setGlobalPresence(r.userId, r.status);
      });
      setPresence(map);
    });
  }, [accessToken, activeConversation, setGlobalPresence]);

  useMessagingSocket(accessToken, {
    onMessage: (msg) => {
      if (msg.conversationId === selectedId) {
        if (msg.threadRootId) {
          queryClient.invalidateQueries({ queryKey: ['thread', msg.threadRootId] });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.threadRootId ? { ...m, threadCount: (m.threadCount ?? 0) + 1 } : m,
            ),
          );
        } else {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { ...msg, threadCount: 0 }];
          });
        }
        if (accessToken) {
          markConversationRead(msg.conversationId, accessToken, msg.id);
          emitRead(msg.conversationId, accessToken, msg.id);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messaging-unread'] });
    },
    onTyping: (data) => {
      if (data.conversationId !== selectedId || data.userId === user?.id) return;
      setTypingUsers((prev) =>
        data.isTyping
          ? [...new Set([...prev, data.userId])]
          : prev.filter((id) => id !== data.userId),
      );
    },
    onPresence: (data) => {
      setGlobalPresence(data.userId, data.status as PresenceInfo['status']);
      setPresence((prev) => ({
        ...prev,
        [data.userId]: {
          userId: data.userId,
          status: data.status as PresenceInfo['status'],
          lastSeenAt: prev[data.userId]?.lastSeenAt,
        },
      }));
    },
  });

  const handleSend = async (content: string, plainText: string, attachments?: UploadedFile[]) => {
    if (!accessToken || !selectedId) return;
    try {
      const msg = await sendMessage(selectedId, accessToken, {
        content,
        plainText,
        replyToId: replyTo?.id,
        isAnnouncement: activeConversation?.type === 'COURSE_ROOM' ? isAnnouncement : false,
        attachments,
      });
      setMessages((prev) => [...prev, { ...msg, threadCount: 0 }]);
      setReplyTo(null);
      setIsAnnouncement(false);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (attachments?.length) {
        queryClient.invalidateQueries({ queryKey: ['course-shared-files'] });
      }
    } catch (err) {
      throw err;
    }
  };

  const handleThreadUpdate = useCallback((rootId: string, count: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === rootId ? { ...m, threadCount: count } : m)),
    );
  }, []);

  const handleTyping = (typing: boolean) => {
    if (!accessToken || !selectedId) return;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    emitTyping(selectedId, accessToken, typing);
    if (typing) {
      typingTimeout.current = setTimeout(() => emitTyping(selectedId!, accessToken, false), 3000);
    }
  };

  const startDirectChat = async (contact: MessagingUser) => {
    if (!accessToken) return;
    const conv = await createDirectConversation(contact.id, accessToken);
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    setSelectedId(conv.id);
    setFilter('direct');
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!accessToken) return;
    await reactToMessage(messageId, accessToken, emoji);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = [...(m.reactions ?? [])];
        const idx = reactions.findIndex((r) => r.userId === user?.id && r.emoji === emoji);
        if (idx >= 0) reactions.splice(idx, 1);
        else reactions.push({
          id: '',
          emoji,
          userId: user!.id,
          user: {
            id: user!.id,
            firstName: user!.firstName,
            lastName: user!.lastName,
            avatarUrl: user!.avatarUrl,
          },
        });
        return { ...m, reactions };
      }),
    );
  };

  const typingLabel = useMemo(() => {
    if (!typingUsers.length || !activeConversation) return null;
    const names = typingUsers
      .map((id) => {
        const p = activeConversation.participants.find((u) => u.id === id);
        return p?.firstName;
      })
      .filter(Boolean);
    if (!names.length) return 'Someone is typing…';
    if (names.length === 1) return `${names[0]} is typing…`;
    return `${names.join(', ')} are typing…`;
  }, [typingUsers, activeConversation]);

  const canAnnounce =
    activeConversation?.type === 'COURSE_ROOM' &&
    (user?.platformRole === 'TRAINER' || user?.platformRole === 'ADMIN' || user?.platformRole === 'SUPERADMIN');

  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm',
        compact ? 'h-full min-h-[480px]' : 'h-[calc(100vh-8rem)] min-h-[520px]',
      )}
    >
      {/* Left sidebar */}
      {!compact && (
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/60 bg-muted/20 lg:flex">
        <div className="space-y-2 border-b border-border/40 p-4">
          <h2 className="text-sm font-semibold text-foreground">Messages</h2>
          <OnlineBadge compact className="w-full justify-center" />
          {unreadTotal > 0 && (
            <p className="text-xs text-muted-foreground">{unreadTotal} unread</p>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {([
            { id: 'all', label: 'All chats', icon: MessageSquare },
            { id: 'direct', label: 'Direct', icon: Users, count: directChats.length },
            { id: 'courses', label: 'Course rooms', icon: BookOpen, count: courseRooms.length },
            { id: 'starred', label: 'Starred', icon: Star },
            { id: 'archived', label: 'Archived', icon: Archive },
          ] as const).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                filter === item.id
                  ? 'bg-brand-green/10 text-brand-green font-medium'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {'count' in item && item.count !== undefined && (
                <span className="text-[10px] tabular-nums opacity-60">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-border/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            New message
          </p>
          <ScrollArea className="max-h-36">
            <div className="space-y-0.5">
              {newMessageContacts.slice(0, 12).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => startDirectChat(c)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60 transition-colors text-left"
                >
                  <span className="relative shrink-0">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={c.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[9px]">{initials(c)}</AvatarFallback>
                    </Avatar>
                    <PresenceDot userId={c.id} className="absolute -bottom-0.5 -right-0.5 h-2 w-2" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.firstName} {c.lastName}</span>
                    {c.contactLabel && (
                      <span className="block truncate text-[10px] text-muted-foreground">{c.contactLabel}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>
      )}

      {/* Conversation list */}
      {!compact && (
      <section className="flex w-full sm:w-72 lg:w-80 shrink-0 flex-col border-r border-border/60">
        <div className="p-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-muted/30 py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-green/30"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <ConversationListSkeleton />
          ) : filteredConversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            <div className="p-1.5">
              {filteredConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === selectedId}
                  presence={presence}
                  currentUserId={user?.id}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </section>
      )}

      {/* Chat area */}
      <section className="flex flex-1 flex-col min-w-0">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <ConversationAvatar conversation={activeConversation} currentUserId={user?.id} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {activeConversation.type === 'DIRECT' && activeConversation.otherUser
                      ? `${activeConversation.otherUser.firstName} ${activeConversation.otherUser.lastName}`
                      : activeConversation.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeConversation.type === 'COURSE_ROOM'
                      ? `${activeConversation.participants.length} members`
                      : presence[activeConversation.otherUser?.id ?? '']?.status === 'ONLINE'
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => accessToken && starConversation(activeConversation.id, accessToken, !activeConversation.isStarred).then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))}
                >
                  <Star className={cn('h-4 w-4', activeConversation.isStarred && 'fill-amber-400 text-amber-400')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => accessToken && muteConversation(activeConversation.id, accessToken, !activeConversation.isMuted).then(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }))}
                >
                  <VolumeX className={cn('h-4 w-4', activeConversation.isMuted && 'text-brand-green')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => accessToken && archiveConversation(activeConversation.id, accessToken, !activeConversation.isArchived).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                    if (!activeConversation.isArchived) setSelectedId(null);
                  })}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1 px-4">
              {loadingMessages ? (
                <ChatMessagesSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="py-4">
                  {messages.map((msg, i) => {
                    const prev = messages[i - 1];
                    const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
                    const showAvatar = !prev || prev.senderId !== msg.senderId || showDate;
                    return (
                      <div key={msg.id}>
                        {showDate && <DateSeparator date={msg.createdAt} />}
                        <MessageBubble
                          message={msg}
                          isOwn={msg.senderId === user?.id}
                          showAvatar={showAvatar}
                          onReact={(emoji) => handleReact(msg.id, emoji)}
                          onReply={setReplyTo}
                          onOpenThread={setThreadRoot}
                        />
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </ScrollArea>

            {typingLabel && (
              <p className="px-4 py-1 text-xs text-muted-foreground italic animate-pulse">{typingLabel}</p>
            )}

            <ChatInput
              conversationId={activeConversation.id}
              onSend={handleSend}
              onTyping={handleTyping}
              showAnnouncementToggle={canAnnounce}
              isAnnouncement={isAnnouncement}
              onAnnouncementChange={setIsAnnouncement}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              placeholder={
                activeConversation.type === 'COURSE_ROOM'
                  ? `Message ${activeConversation.title}…`
                  : 'Type a message…'
              }
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <div className="rounded-2xl bg-brand-green/5 p-6 mb-4">
              <Megaphone className="h-12 w-12 text-brand-green/40" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Ingobyi Messages</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a conversation or start a new chat with your trainers, students, or course rooms.
            </p>
          </div>
        )}
      </section>

      {threadRoot && selectedId && (
        <ThreadPanel
          rootMessage={threadRoot}
          conversationId={selectedId}
          onClose={() => setThreadRoot(null)}
          onThreadUpdate={handleThreadUpdate}
        />
      )}
    </div>
  );
}

function ConversationAvatar({
  conversation,
  currentUserId,
}: {
  conversation: Conversation;
  currentUserId?: string;
}) {
  if (conversation.type === 'COURSE_ROOM' && conversation.course?.thumbnailUrl) {
    return (
      <Avatar className="h-10 w-10 rounded-xl">
        <AvatarImage src={conversation.course.thumbnailUrl} />
        <AvatarFallback className="rounded-xl bg-brand-green/10">
          <BookOpen className="h-4 w-4 text-brand-green" />
        </AvatarFallback>
      </Avatar>
    );
  }
  const other = conversation.otherUser ?? conversation.participants.find((p) => p.id !== currentUserId);
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={other?.avatarUrl ?? undefined} />
      <AvatarFallback className="bg-brand-green/10 text-brand-green text-xs">
        {other ? initials(other) : '?'}
      </AvatarFallback>
    </Avatar>
  );
}

function ConversationRow({
  conversation,
  isActive,
  presence,
  currentUserId,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  presence: Record<string, PresenceInfo>;
  currentUserId?: string;
  onClick: () => void;
}) {
  const other = conversation.otherUser ?? conversation.participants.find((p) => p.id !== currentUserId);
  const isOnline = other ? presence[other.id]?.status === 'ONLINE' : false;
  const isTyping = conversation.typingUsers.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        isActive ? 'bg-brand-green/10' : 'hover:bg-muted/50',
      )}
    >
      <div className="relative shrink-0">
        <ConversationAvatar conversation={conversation} currentUserId={currentUserId} />
        {conversation.type === 'DIRECT' && (
          <span
            className={cn(
              'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
              isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30',
            )}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={cn('text-sm font-medium truncate', conversation.unreadCount > 0 && 'text-foreground')}>
            {conversation.type === 'DIRECT' && other
              ? `${other.firstName} ${other.lastName}`
              : conversation.title}
          </span>
          {conversation.lastMessage && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className={cn('text-xs truncate', isTyping ? 'text-brand-green italic' : 'text-muted-foreground')}>
            {isTyping
              ? 'typing…'
              : conversation.lastMessage?.isAnnouncement
              ? `📢 ${conversation.lastMessage.plainText}`
              : conversation.lastMessage?.plainText ?? 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="shrink-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-green px-1 text-[10px] font-bold text-white">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
