'use client';

import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import { DraftBadge } from '@/components/ui/draft-badge';
import { createCourse } from '@/lib/api/courses';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';

type CourseDraft = {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
};

const INITIAL: CourseDraft = {
  title: '',
  description: '',
  shortDescription: '',
  price: '',
};

export default function NewCoursePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken)!;

  const { value: form, setValue: setForm, clearDraft, restored, lastSaved } = useObjectDraft<CourseDraft>(
    draftKey('course', 'new'),
    INITIAL,
    {
      onRestore: () => toast.info('Restored unsaved course draft'),
    },
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const course = await createCourse(token, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        price: form.price ? Number(form.price) : undefined,
      });
      clearDraft();
      toast.success('Course created');
      router.push(`/trainer/courses/${course.id}/edit`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create course'));
    }
  }

  return (
    <DashboardShell allowedRoles={['TRAINER', 'ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Create course"
        description="Start with the basics. You can add modules and lessons next."
        breadcrumbs={[
          { label: 'Trainer', href: '/trainer/dashboard' },
          { label: 'Courses', href: '/trainer/courses' },
          { label: 'New' },
        ]}
      />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />

        <div>
          <label className="mb-1 block text-sm font-semibold">Course title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Short description</label>
          <input
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Full description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Price (RWF, leave empty for free)</label>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" className="bg-brand-green hover:bg-brand-green-dark">
          Create & continue
        </Button>
      </form>
    </DashboardShell>
  );
}
