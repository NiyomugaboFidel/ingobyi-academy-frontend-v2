'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Link2, List, Loader2, Paperclip, Send, Smile, Underline as UnderlineIcon, X } from 'lucide-react';
import { QUICK_EMOJIS } from '@/lib/utils/emoji';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import type { Message } from '@/lib/api/messaging';
import { uploadMessagingFile, type UploadedFile } from '@/lib/api/uploads';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey, loadDraft, removeDraft, saveDraft } from '@/lib/drafts/storage';
import { DraftBadge } from '@/components/ui/draft-badge';

interface ChatInputProps {
  conversationId?: string;
  draftSuffix?: string;
  onSend: (content: string, plainText: string, attachments?: UploadedFile[]) => void | Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  showAnnouncementToggle?: boolean;
  isAnnouncement?: boolean;
  onAnnouncementChange?: (v: boolean) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

function stripHtml(html: string) {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ').trim();
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').trim();
}

export function ChatInput({
  conversationId,
  draftSuffix,
  onSend,
  onTyping,
  placeholder = 'Type a message…',
  disabled,
  showAnnouncementToggle,
  isAnnouncement,
  onAnnouncementChange,
  replyTo,
  onCancelReply,
}: ChatInputProps) {
  const { accessToken } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const draftStorageKey = conversationId
    ? draftKey('chat', conversationId, draftSuffix ?? 'main')
    : null;
  const draftHydrated = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-[160px] overflow-y-auto px-3 py-2 text-sm',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !accessToken) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              void handleFiles([file]);
              return true;
            }
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  const handleFiles = async (files: FileList | File[]) => {
    if (!accessToken) return;
    setUploading(true);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadMessagingFile(file, accessToken);
        uploaded.push(result);
      }
      setPending((prev) => [...prev, ...uploaded]);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not upload file'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSend = useCallback(async () => {
    if (!editor || disabled || uploading || sending) return;
    const html = editor.getHTML();
    const text = stripHtml(html);
    if (!text && pending.length === 0) return;
    setSending(true);
    try {
      await onSend(text ? html : '<p></p>', text || pending.map((a) => a.filename).join(', '), pending);
      editor.commands.clearContent();
      setPending([]);
      if (draftStorageKey) {
        removeDraft(draftStorageKey);
        setDraftSavedAt(null);
        setDraftRestored(false);
      }
      onTyping?.(false);
      onCancelReply?.();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  }, [editor, disabled, uploading, sending, onSend, onTyping, onCancelReply, pending, draftStorageKey]);

  useEffect(() => {
    if (!editor || !draftStorageKey || draftHydrated.current) return;
    const saved = loadDraft<string>(draftStorageKey);
    if (saved && stripHtml(saved)) {
      editor.commands.setContent(saved);
      setDraftRestored(true);
      toast.info('Restored unsaved message draft');
    }
    draftHydrated.current = true;
  }, [editor, draftStorageKey]);

  useEffect(() => {
    draftHydrated.current = false;
    setDraftRestored(false);
    setDraftSavedAt(null);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!editor || !draftStorageKey) return;
    let timer: ReturnType<typeof setTimeout>;
    const persistDraft = () => {
      if (!draftHydrated.current) return;
      const html = editor.getHTML();
      const text = stripHtml(html);
      if (!text && pending.length === 0) {
        removeDraft(draftStorageKey);
        setDraftSavedAt(null);
        return;
      }
      saveDraft(draftStorageKey, html);
      setDraftSavedAt(new Date());
      setDraftRestored(false);
    };
    const onUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(persistDraft, 500);
    };
    editor.on('update', onUpdate);
    return () => {
      clearTimeout(timer);
      editor.off('update', onUpdate);
    };
  }, [editor, draftStorageKey, pending.length]);

  useEffect(() => {
    if (!editor || !onTyping) return;
    const handler = () => {
      const text = stripHtml(editor.getHTML());
      onTyping(text.length > 0 || pending.length > 0);
    };
    editor.on('update', handler);
    return () => { editor.off('update', handler); };
  }, [editor, onTyping, pending.length]);

  if (!editor) return null;

  return (
    <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm">
      {replyTo && (
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border/40 bg-muted/30">
          <div className="min-w-0 text-xs">
            <span className="font-medium text-brand-green">Replying to {replyTo.sender.firstName}</span>
            <p className="text-muted-foreground truncate">{replyTo.plainText}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCancelReply}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-border/40">
          {pending.map((a, i) => (
            <div key={`${a.url}-${i}`} className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2 py-1 text-xs">
              <Paperclip className="h-3 w-3 opacity-60" />
              <span className="max-w-[120px] truncate">{a.filename}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setPending((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAnnouncementToggle && (
        <label className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground border-b border-border/40 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnnouncement}
            onChange={(e) => onAnnouncementChange?.(e.target.checked)}
            className="rounded border-border"
          />
          Send as course announcement (visible to all enrolled students)
        </label>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {(draftRestored || draftSavedAt) && (
        <div className="px-4 pb-1">
          <DraftBadge
            restored={draftRestored}
            lastSaved={draftSavedAt}
            onDiscard={() => {
              if (draftStorageKey) removeDraft(draftStorageKey);
              editor?.commands.clearContent();
              setDraftRestored(false);
              setDraftSavedAt(null);
            }}
          />
        </div>
      )}

      <div className="flex items-end gap-1 px-2 py-2">
        <div className="flex items-center gap-0.5 shrink-0 pb-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => {
              const url = window.prompt('Enter URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            <Link2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
          </Button>
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <Smile className="h-3.5 w-3.5" />
            </Button>
            {emojiOpen && (
              <div className="absolute bottom-10 left-0 z-20 grid w-56 grid-cols-6 gap-1 rounded-xl border border-border bg-card p-2 shadow-lg">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="rounded p-1 text-lg hover:bg-muted"
                    onClick={() => {
                      editor.chain().focus().insertContent(emoji).run();
                      setEmojiOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div
          className={cn(
            'flex-1 rounded-xl border border-border/60 bg-muted/30 transition-colors',
            'focus-within:border-brand-green/40 focus-within:ring-1 focus-within:ring-brand-green/20',
          )}
        >
          <EditorContent editor={editor} />
        </div>
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full bg-brand-green text-white hover:bg-brand-green/90"
          onClick={handleSend}
          disabled={disabled || uploading || sending}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
