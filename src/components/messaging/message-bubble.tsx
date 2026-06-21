'use client';

import { format, isToday, isYesterday } from 'date-fns';
import { MessageSquare, Pin, Megaphone, Reply } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/api/messaging';
import { MessageAttachments } from './message-attachments';

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatMessageTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`;
  return format(d, 'MMM d, HH:mm');
}

export function DateSeparator({ date }: { date: string }) {
  const d = new Date(date);
  let label = format(d, 'MMMM d, yyyy');
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReact?: (emoji: string) => void;
  onReply?: (message: Message) => void;
  onOpenThread?: (message: Message) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👀'];

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReact,
  onReply,
  onOpenThread,
}: MessageBubbleProps) {
  const grouped = (message.reactions ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});

  const hasText = message.plainText && message.plainText !== message.attachments?.map((a) => a.filename).join(', ');

  return (
    <div className={cn('group flex gap-2 py-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
      {showAvatar ? (
        <Avatar className="h-8 w-8 mt-0.5 shrink-0">
          <AvatarImage src={message.sender.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[10px] bg-brand-green/10 text-brand-green">
            {initials(message.sender.firstName, message.sender.lastName)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={cn('flex max-w-[75%] flex-col gap-0.5', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <span className="text-[11px] font-medium text-muted-foreground px-1">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        {message.replyTo && (
          <div className="text-[11px] text-muted-foreground border-l-2 border-brand-green/40 pl-2 mb-0.5 opacity-80">
            {message.replyTo.sender.firstName}: {message.replyTo.plainText.slice(0, 80)}
          </div>
        )}

        <div
          className={cn(
            'relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
            message.isAnnouncement
              ? 'bg-amber-50 border border-amber-200/80 text-amber-950 rounded-lg'
              : isOwn
              ? 'bg-brand-green text-white rounded-br-md'
              : 'bg-muted/60 text-foreground rounded-bl-md',
          )}
        >
          {message.isAnnouncement && (
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 mb-1">
              <Megaphone className="h-3 w-3" />
              Announcement
            </div>
          )}
          {message.isPinned && <Pin className="absolute -top-2 -right-2 h-3.5 w-3.5 text-brand-green" />}
          {hasText && (
            <div
              className={cn(
                'prose prose-sm max-w-none [&_a]:underline',
                isOwn && !message.isAnnouncement && 'prose-invert',
              )}
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          )}
          {message.attachments && message.attachments.length > 0 && (
            <MessageAttachments
              attachments={message.attachments}
              inverted={isOwn && !message.isAnnouncement}
            />
          )}
        </div>

        <div className={cn('flex items-center gap-1.5 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(message.createdAt)}
            {message.editedAt && ' · edited'}
          </span>
          <div className="hidden group-hover:flex items-center gap-0.5">
            {onReply && (
              <button
                type="button"
                className="p-0.5 text-muted-foreground hover:text-brand-green"
                title="Reply"
                onClick={() => onReply(message)}
              >
                <Reply className="h-3.5 w-3.5" />
              </button>
            )}
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-xs hover:scale-125 transition-transform"
                onClick={() => onReact?.(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {(message.threadCount ?? 0) > 0 && onOpenThread && (
          <button
            type="button"
            onClick={() => onOpenThread(message)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-brand-green hover:underline"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
          </button>
        )}

        {Object.keys(grouped).length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {Object.entries(grouped).map(([emoji, count]) => (
              <span
                key={emoji}
                className="inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-xs cursor-pointer"
                onClick={() => onReact?.(emoji)}
              >
                {emoji} {count > 1 && <span className="text-[10px] text-muted-foreground">{count}</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
