'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { submitReport } from '@/lib/api/reports';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';

type ReportDraft = { title: string; description: string };

type ReportDialogProps = {
  targetType: 'CONTENT' | 'USER' | 'BUG' | 'OTHER';
  targetLabel?: string;
  metadata?: Record<string, unknown>;
  className?: string;
};

export function ReportDialog({ targetType, targetLabel, metadata, className }: ReportDialogProps) {
  const token = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    value: form,
    setValue: setForm,
    clearDraft,
    restored,
    lastSaved,
  } = useObjectDraft<ReportDraft>(
    draftKey('report', targetType),
    { title: '', description: '' },
    { enabled: open, onRestore: () => toast.info('Restored unsaved report draft') },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await submitReport(token, {
        type: targetType,
        title: form.title.trim(),
        description: form.description.trim(),
        metadata,
      });
      clearDraft();
      toast.success('Report submitted. Our team will review it.');
      setOpen(false);
      setForm({ title: '', description: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not submit report.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? 'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600'}
      >
        <Flag className="h-3.5 w-3.5" /> Report
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
        <h3 className="text-lg font-bold text-foreground">Report {targetLabel ?? 'issue'}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Describe the problem. Admins will review your report.</p>
        <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} className="mt-3" />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Short title"
          required
          className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green/40"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Details…"
          required
          rows={4}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-green/40"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" size="sm" disabled={submitting} className="bg-brand-green hover:bg-brand-green-dark">
            Submit report
          </Button>
        </div>
      </form>
    </div>
  );
}
