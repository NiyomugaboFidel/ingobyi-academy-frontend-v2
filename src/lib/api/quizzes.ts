import { apiRequest } from './client';

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type QuizPayload = {
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  attempts: Array<{ id: string; score: number; isPassed: boolean; attemptedAt: string }>;
};

export function getQuiz(lessonId: string, token: string) {
  return apiRequest<QuizPayload>(`/quizzes/lesson/${lessonId}`, { token });
}

export function submitQuiz(lessonId: string, token: string, answers: number[]) {
  return apiRequest<{
    id: string;
    score: number;
    isPassed: boolean;
    correctCount: number;
    totalQuestions: number;
    passingScore: number;
  }>(`/quizzes/lesson/${lessonId}/submit`, {
    method: 'POST',
    token,
    body: JSON.stringify({ answers }),
  });
}
