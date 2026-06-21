'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { DraftBadge } from '@/components/ui/draft-badge';
import { listCourses, listCourseStudents } from '@/lib/api/courses';
import { createSession, getAttendance, listSessions, recordAttendance } from '@/lib/api/physical';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { draftKey } from '@/lib/drafts/storage';
import { useObjectDraft } from '@/lib/drafts/use-object-draft';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TrainerAttendancePage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const {
    value: statusMap,
    setValue: setStatusMap,
    clearDraft: clearAttendanceDraft,
    restored,
    lastSaved,
  } = useObjectDraft<Record<string, string>>(
    draftKey('attendance', selectedSession ?? 'none'),
    {},
    {
      enabled: !!selectedSession,
      onRestore: () => toast.info('Restored unsaved attendance marks'),
    },
  );

  const { data: sessions = [] } = useQuery({
    queryKey: ['physical', 'sessions'],
    queryFn: () => listSessions(token, { trainerId: user?.id }),
    enabled: !!token,
  });

  const { data: coursesPage } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: () => listCourses(token, 1, 100),
    enabled: !!token,
  });

  const selectedSessionMeta = sessions.find((s) => s.id === selectedSession);

  const { data: attendance = [] } = useQuery({
    queryKey: ['attendance', selectedSession],
    queryFn: () => getAttendance(selectedSession!, token),
    enabled: !!selectedSession && !!token,
  });

  const { data: enrolledStudents } = useQuery({
    queryKey: ['course-students', selectedSessionMeta?.courseId],
    queryFn: () => listCourseStudents(selectedSessionMeta!.courseId, token, 1, 100),
    enabled: !!selectedSessionMeta?.courseId && !!token,
  });

  const roster =
    attendance.length > 0
      ? attendance
      : (enrolledStudents?.data ?? []).map((e) => ({
          userId: e.userId,
          status: 'PRESENT' as const,
          user: e.user,
        }));

  async function createQuickSession() {
    const course = coursesPage?.data[0];
    if (!course || !user) return;
    try {
      const start = new Date();
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      await createSession(token, {
        courseId: course.id,
        title: `Session – ${course.title}`,
        trainerId: user.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isOnline: true,
      });
      queryClient.invalidateQueries({ queryKey: ['physical', 'sessions'] });
      toast.success('Session created');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create session'));
    }
  }

  async function saveAttendance() {
    if (!selectedSession || roster.length === 0) return;
    try {
      await recordAttendance(
        selectedSession,
        token,
        roster.map((row) => ({
          userId: row.userId,
          status: (statusMap[row.userId] as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') || row.status || 'PRESENT',
        })),
      );
      clearAttendanceDraft();
      toast.success('Attendance saved');
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedSession] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save attendance'));
    }
  }

  return (
    <DashboardShell allowedRoles={['TRAINER', 'SUPERADMIN']}>
      <PageHeader
        title="Attendance"
        description="Mark attendance for physical or live sessions."
        breadcrumbs={[{ label: 'Trainer', href: '/trainer/dashboard' }, { label: 'Attendance' }]}
        actions={<Button size="sm" onClick={createQuickSession} className="bg-brand-green hover:bg-brand-green-dark">New session</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2 rounded-xl border border-border bg-card p-3">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSession(s.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm ${selectedSession === s.id ? 'bg-brand-green text-white' : 'hover:bg-muted'}`}
            >
              <span className="block font-medium">{s.title}</span>
              <span className={`text-xs ${selectedSession === s.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                {new Date(s.startTime).toLocaleString()}
              </span>
            </button>
          ))}
        </aside>

        <div>
          {selectedSession ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <DraftBadge restored={restored} lastSaved={lastSaved} onDiscard={clearAttendanceDraft} />
                <Button size="sm" onClick={saveAttendance} className="bg-brand-green hover:bg-brand-green-dark">Save attendance</Button>
              </div>
              <div className="space-y-2">
                {roster.length === 0 && (
                  <p className="text-sm text-muted-foreground">No enrolled students for this course yet.</p>
                )}
                {roster.map((row) => (
                  <div key={row.userId} className="flex items-center justify-between rounded-lg border border-border px-4 py-2">
                    <span className="text-sm">{row.user?.firstName} {row.user?.lastName}</span>
                    <select
                      value={statusMap[row.userId] ?? row.status}
                      onChange={(e) => setStatusMap({ ...statusMap, [row.userId]: e.target.value })}
                      className="rounded border border-border px-2 py-1 text-xs"
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                      <option value="EXCUSED">Excused</option>
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a session to mark attendance.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
