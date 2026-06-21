import { apiRequest } from './client';

export type Assignment = {
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  maxScore: number;
  dueDate?: string | null;
};

export type Submission = {
  id: string;
  assignmentId: string;
  userId: string;
  fileUrl?: string | null;
  textContent?: string | null;
  score?: number | null;
  feedback?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  user?: { id: string; firstName: string; lastName: string; email: string };
};

export function getAssignmentByLesson(lessonId: string, token: string) {
  return apiRequest<Assignment>(`/assignments/${lessonId}`, { token });
}

export function createAssignment(
  token: string,
  body: { lessonId: string; title: string; instructions: string; maxScore?: number; dueDate?: string },
) {
  return apiRequest<Assignment>('/assignments', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function updateAssignment(
  token: string,
  assignmentId: string,
  body: Partial<Pick<Assignment, 'title' | 'instructions' | 'maxScore' | 'dueDate'>>,
) {
  return apiRequest<Assignment>(`/assignments/${assignmentId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export function submitAssignment(
  assignmentId: string,
  token: string,
  body: { textContent?: string; fileUrl?: string },
) {
  return apiRequest<Submission>(`/submissions/${assignmentId}`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export function listSubmissions(assignmentId: string, token: string) {
  return apiRequest<Submission[]>(`/submissions/${assignmentId}`, { token });
}

export function getMySubmission(assignmentId: string, token: string) {
  return apiRequest<Submission | null>(`/submissions/${assignmentId}/mine`, { token });
}

export function gradeSubmission(
  submissionId: string,
  token: string,
  body: { score: number; feedback?: string },
) {
  return apiRequest<Submission>(`/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}
