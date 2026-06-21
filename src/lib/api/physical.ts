import { apiRequest } from './client';

export type PhysicalSession = {
  id: string;
  courseId: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string | null;
  capacity?: number | null;
  isOnline: boolean;
  meetingUrl?: string | null;
  course?: { title: string };
};

export type AttendanceEntry = {
  userId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
};

export function listSessions(token: string, params: { courseId?: string; trainerId?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.courseId) qs.set('courseId', params.courseId);
  if (params.trainerId) qs.set('trainerId', params.trainerId);
  const q = qs.toString();
  return apiRequest<PhysicalSession[]>(`/physical/sessions${q ? `?${q}` : ''}`, { token });
}

export function createSession(
  token: string,
  body: {
    courseId: string;
    title: string;
    trainerId: string;
    startTime: string;
    endTime: string;
    description?: string;
    isOnline?: boolean;
    meetingUrl?: string;
  },
) {
  return apiRequest<PhysicalSession>('/physical/sessions', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function recordAttendance(sessionId: string, token: string, entries: AttendanceEntry[]) {
  return apiRequest(`/physical/sessions/${sessionId}/attendance`, {
    method: 'POST',
    token,
    body: JSON.stringify({ entries }),
  });
}

export function getAttendance(sessionId: string, token: string) {
  return apiRequest<Array<{ userId: string; status: string; user?: { firstName: string; lastName: string } }>>(
    `/physical/sessions/${sessionId}/attendance`,
    { token },
  );
}
