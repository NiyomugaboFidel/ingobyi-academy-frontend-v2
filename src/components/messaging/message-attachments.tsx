'use client';

import { FileText, Download, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageAttachment } from '@/lib/api/messaging';

function isImage(mime: string) {
  return mime.startsWith('image/');
}

function isAudio(mime: string) {
  return mime.startsWith('audio/');
}

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  inverted?: boolean;
}

export function MessageAttachments({ attachments, inverted }: MessageAttachmentsProps) {
  if (!attachments.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((a) => {
        if (isImage(a.mimeType)) {
          return (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt={a.filename}
                className="max-h-64 max-w-full rounded-lg object-cover"
              />
            </a>
          );
        }

        if (isAudio(a.mimeType)) {
          return (
            <div
              key={a.id}
              className={cn(
                'flex items-center gap-2 rounded-lg p-2',
                inverted ? 'bg-white/10' : 'bg-background/60',
              )}
            >
              <Music className="h-4 w-4 shrink-0 opacity-70" />
              <audio controls src={a.url} className="h-8 max-w-full flex-1" preload="metadata" />
            </div>
          );
        }

        return (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors hover:opacity-90',
              inverted ? 'border-white/20 bg-white/10' : 'border-border/60 bg-background/80',
            )}
          >
            <FileText className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate">{a.filename}</span>
            <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </a>
        );
      })}
    </div>
  );
}
