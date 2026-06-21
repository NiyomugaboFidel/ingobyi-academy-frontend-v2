'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Plus, Trash2, Upload } from 'lucide-react';
import { DetailPageSkeleton } from '@/components/dashboard/table-skeleton';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button';
import {
  createModule,
  deleteModule,
  getCourseById,
  publishCourse,
  updateCourse,
} from '@/lib/api/courses';
import { createLesson, deleteLesson, updateLesson } from '@/lib/api/lessons';
import { createAssignment } from '@/lib/api/assignments';
import { uploadImage } from '@/lib/api/uploads';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { useTextDraft } from '@/lib/drafts/use-text-draft';
import { DraftBadge } from '@/components/ui/draft-badge';
import { LessonDraftField } from '@/components/forms/lesson-draft-field';
import { LessonRichField } from '@/components/forms/lesson-rich-field';
import { AssignmentInstructionsField } from '@/components/forms/assignment-instructions-field';
import { LessonTitleField } from '@/components/forms/lesson-title-field';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const LESSON_TYPES = ['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'] as const;

type DetailsDraft = {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  level: string;
  language: string;
  thumbnailUrl: string;
};

const EMPTY_DETAILS: DetailsDraft = {
  title: '',
  description: '',
  shortDescription: '',
  price: '',
  level: 'BEGINNER',
  language: 'en',
  thumbnailUrl: '',
};

const DEFAULT_QUIZ = JSON.stringify({
  passingScore: 70,
  questions: [
    { id: 'q1', text: 'Sample question?', options: ['Option A', 'Option B', 'Option C'], correctIndex: 0 },
  ],
}, null, 2);

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useAuthStore((s) => s.accessToken)!;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'details' | 'curriculum'>('details');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id, token),
    enabled: !!token && !!id,
  });

  const {
    value: form,
    setValue: setForm,
    clearDraft,
    reset,
    restored,
    lastSaved,
  } = useObjectDraft<DetailsDraft>(draftKey('course', id, 'details'), EMPTY_DETAILS, {
    enabled: !!id,
    onRestore: () => toast.info('Restored unsaved course details'),
  });

  const {
    text: moduleTitle,
    setText: setModuleTitle,
    clearDraft: clearModuleDraft,
    restored: moduleRestored,
    lastSaved: moduleLastSaved,
  } = useTextDraft(draftKey('course', id, 'module_title'), '', {
    enabled: !!id,
    onRestore: () => toast.info('Restored unsaved section title'),
  });

  useEffect(() => {
    if (!course || restored) return;
    reset({
      title: course.title,
      description: course.description ?? '',
      shortDescription: course.shortDescription ?? '',
      price: course.price != null ? String(course.price) : '',
      level: course.level ?? 'BEGINNER',
      language: course.language ?? 'en',
      thumbnailUrl: course.thumbnailUrl ?? '',
    });
  }, [course, reset, restored]);

  async function saveDetails() {
    try {
      await updateCourse(id, token, {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription,
        price: form.price ? Number(form.price) : undefined,
        level: form.level,
        language: form.language || undefined,
        thumbnailUrl: form.thumbnailUrl || undefined,
      });
      clearDraft();
      toast.success('Course saved');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Save failed'));
    }
  }

  async function handleThumbnail(file: File) {
    try {
      const uploaded = await uploadImage(file, token);
      await updateCourse(id, token, { thumbnailUrl: uploaded.url });
      setForm({ ...form, thumbnailUrl: uploaded.url });
      toast.success('Thumbnail uploaded');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Upload failed'));
    }
  }

  async function addModule() {
    if (!moduleTitle.trim() || !course) return;
    try {
      const order = (course.modules?.length ?? 0) + 1;
      await createModule(id, token, { title: moduleTitle.trim(), order });
      setModuleTitle('');
      clearModuleDraft();
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      toast.success('Section added');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add section'));
    }
  }

  async function addLesson(moduleId: string, type: typeof LESSON_TYPES[number]) {
    const mod = course?.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    try {
      const order = mod.lessons.length + 1;
      const lesson = await createLesson(id, moduleId, token, {
        title: `New ${type.toLowerCase()} lesson`,
        type,
        order,
        isFree: false,
        isPublished: true,
        content: type === 'QUIZ' ? DEFAULT_QUIZ : type === 'TEXT' ? '<p>Lesson content here</p>' : undefined,
      });
      if (type === 'ASSIGNMENT') {
        await createAssignment(token, {
          lessonId: lesson.id,
          title: 'Assignment',
          instructions: '<p>Complete this assignment and submit your work.</p>',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      setExpandedModule(moduleId);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add lesson'));
    }
  }

  async function requestPublish() {
    try {
      await publishCourse(id, token);
      toast.success('Submitted for review');
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Publish request failed'));
    }
  }

  if (isLoading || !course) {
    return (
      <DashboardShell allowedRoles={['TRAINER', 'ADMIN', 'SUPERADMIN']}>
        <DetailPageSkeleton />
      </DashboardShell>
    );
  }

  const status = course.status ?? 'DRAFT';
  const isPublished = status === 'PUBLISHED';
  const isPending = status === 'PENDING_REVIEW';

  return (
    <DashboardShell allowedRoles={['TRAINER', 'ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title={course.title}
        description={`Status: ${status.replace('_', ' ')}`}
        breadcrumbs={[
          { label: 'Trainer', href: '/trainer/dashboard' },
          { label: 'Courses', href: '/trainer/courses' },
          { label: 'Edit' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/courses/preview/${course.slug}`}>Preview</Link>
            </Button>
            {isPublished && (
              <Button asChild size="sm" variant="outline">
                <Link href={`/catalog/${course.slug}`}>View live catalog</Link>
              </Button>
            )}
            {!isPublished && !isPending && (
              <Button size="sm" onClick={requestPublish} className="bg-brand-green hover:bg-brand-green-dark">
                Submit for review
              </Button>
            )}
            {isPending && (
              <Button size="sm" disabled variant="secondary">
                Awaiting approval
              </Button>
            )}
          </div>
        }
      />

      <div
        className={cn(
          'mb-6 rounded-lg border px-4 py-3 text-sm',
          isPublished && 'border-green-200 bg-green-50 text-green-900',
          isPending && 'border-amber-200 bg-amber-50 text-amber-900',
          !isPublished && !isPending && 'border-brand-green/15 bg-brand-mint-wash text-brand-ink',
        )}
      >
        {isPublished && (
          <p>
            <strong>Published.</strong> Your course is live at{' '}
            <Link href={`/catalog/${course.slug}`} className="font-semibold text-brand-green underline">
              /catalog/{course.slug}
            </Link>
            . Edit details or curriculum anytime — changes appear after save.
          </p>
        )}
        {isPending && (
          <p>
            <strong>Pending review.</strong> An organization admin or superadmin must approve before it appears in
            the catalog. You can still improve content below while you wait.
          </p>
        )}
        {!isPublished && !isPending && (
          <p>
            <strong>Improve your course:</strong> fill in title, description, thumbnail, then add modules and
            lessons under <strong>Curriculum</strong>. When ready, click <strong>Submit for review</strong>.
          </p>
        )}
      </div>

      <div className="mb-4 flex gap-2 border-b border-border">
        {(['details', 'curriculum'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn('border-b-2 px-4 py-2 text-sm font-semibold capitalize', tab === t ? 'border-brand-green text-brand-green' : 'border-transparent text-muted-foreground')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="max-w-3xl space-y-5 rounded-xl border border-brand-green/10 bg-white p-6 shadow-sm">
          <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearDraft} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-ink">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-brand-green/12 px-3 py-2 text-sm outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-ink">Short description</label>
            <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-line summary for catalog cards" className="w-full rounded-lg border border-brand-green/12 px-3 py-2 text-sm outline-none focus:border-brand-green" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-ink">Full description</label>
            <RichTextEditor
              value={form.description || '<p></p>'}
              onChange={(html) => setForm({ ...form, description: html })}
              placeholder="Describe what students will learn, prerequisites, and outcomes…"
              size="lg"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-semibold">Price (RWF)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Level</label>
              <select value={form.level ?? 'BEGINNER'} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Language</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
                <option value="en">English</option>
                <option value="rw">Kinyarwanda</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Thumbnail</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> Upload image
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
            </label>
            {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
          </div>
          <Button onClick={saveDetails} className="bg-brand-green hover:bg-brand-green-dark">Save details</Button>
        </div>
      )}

      {tab === 'curriculum' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <DraftBadge restored={moduleRestored} lastSaved={moduleLastSaved} onDiscard={clearModuleDraft} />
            <div className="flex gap-2">
              <input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder="New section title"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
              />
              <Button onClick={addModule} className="gap-1 bg-brand-green hover:bg-brand-green-dark"><Plus className="h-4 w-4" /> Add section</Button>
            </div>
          </div>

          {course.modules.map((mod) => (
            <div key={mod.id} className="rounded-xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-semibold">{mod.title}</span>
                <ChevronDown className={cn('h-4 w-4 transition', expandedModule === mod.id && 'rotate-180')} />
              </button>
              {expandedModule === mod.id && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {LESSON_TYPES.map((type) => (
                      <Button key={type} size="sm" variant="outline" onClick={() => addLesson(mod.id, type)}>
                        + {type}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={async () => {
                        try {
                          await deleteModule(id, mod.id, token);
                          queryClient.invalidateQueries({ queryKey: ['course', id] });
                        } catch (err) {
                          toast.error(getErrorMessage(err, 'Could not delete section'));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete section
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {mod.lessons.map((lesson) => (
                      <li key={lesson.id} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <LessonTitleField
                            courseId={id}
                            lessonId={lesson.id}
                            defaultValue={lesson.title}
                            onSave={async (title) => {
                              await updateLesson(id, mod.id, lesson.id, token, { title });
                              queryClient.invalidateQueries({ queryKey: ['course', id] });
                            }}
                          />
                          <span className="text-xs text-muted-foreground">{lesson.type}</span>
                          <button
                            type="button"
                            className="text-xs text-red-600"
                            onClick={async () => {
                              try {
                                await deleteLesson(id, mod.id, lesson.id, token);
                                queryClient.invalidateQueries({ queryKey: ['course', id] });
                              } catch (err) {
                                toast.error(getErrorMessage(err, 'Could not delete lesson'));
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        {lesson.type === 'VIDEO' && (
                          <LessonDraftField
                            courseId={id}
                            lessonId={lesson.id}
                            field="videoUrl"
                            defaultValue={lesson.videoUrl ?? ''}
                            placeholder="Video URL (YouTube)"
                            onSave={async (value) => {
                              await updateLesson(id, mod.id, lesson.id, token, { videoUrl: value });
                              queryClient.invalidateQueries({ queryKey: ['course', id] });
                            }}
                          />
                        )}
                        <LessonRichField
                          courseId={id}
                          lessonId={lesson.id}
                          field="description"
                          defaultValue={lesson.description ?? ''}
                          placeholder="Brief lesson overview shown to students…"
                          size="sm"
                          onSave={async (value) => {
                            await updateLesson(id, mod.id, lesson.id, token, { description: value });
                            queryClient.invalidateQueries({ queryKey: ['course', id] });
                          }}
                        />
                        {lesson.type === 'TEXT' && (
                          <LessonRichField
                            courseId={id}
                            lessonId={lesson.id}
                            field="content"
                            defaultValue={lesson.content ?? ''}
                            placeholder="Write lesson content — headings, lists, images, and links…"
                            size="lg"
                            onSave={async (value) => {
                              await updateLesson(id, mod.id, lesson.id, token, { content: value });
                              queryClient.invalidateQueries({ queryKey: ['course', id] });
                            }}
                          />
                        )}
                        {lesson.type === 'QUIZ' && (
                          <LessonDraftField
                            courseId={id}
                            lessonId={lesson.id}
                            field="content"
                            defaultValue={lesson.content ?? ''}
                            rows={10}
                            mono
                            placeholder="Quiz JSON (questions, options, passingScore)…"
                            onSave={async (value) => {
                              await updateLesson(id, mod.id, lesson.id, token, { content: value });
                              queryClient.invalidateQueries({ queryKey: ['course', id] });
                            }}
                          />
                        )}
                        {lesson.type === 'ASSIGNMENT' && (
                          <AssignmentInstructionsField
                            lessonId={lesson.id}
                            onSaved={() => queryClient.invalidateQueries({ queryKey: ['assignment', lesson.id] })}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
