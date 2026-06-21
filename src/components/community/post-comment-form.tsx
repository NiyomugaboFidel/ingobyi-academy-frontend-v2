'use client';

import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { draftKey } from '@/lib/drafts/storage';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { toast } from 'sonner';

export function PostCommentForm({
  postId,
  onSubmit,
  disabled,
}: {
  postId: string;
  onSubmit: (text: string) => void | Promise<void>;
  disabled?: boolean;
}) {
  const { text, setText, clearDraft, restored, lastSaved } = useTextDraft(
    draftKey('community', 'comment', postId),
    '',
    { onRestore: () => toast.info('Restored unsaved comment') },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await onSubmit(trimmed);
      setText('');
      clearDraft();
    } catch {
      /* parent shows error toast; keep draft */
    }
  }

  return (
    <form className="mt-3 space-y-1" onSubmit={handleSubmit}>
      <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />
      <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment…"
        className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-brand-green/40"
      />
      <Button type="submit" size="sm" variant="outline" disabled={disabled || !text.trim()} className="h-8 rounded-full text-xs">
        Reply
      </Button>
      </div>
    </form>
  );
}
