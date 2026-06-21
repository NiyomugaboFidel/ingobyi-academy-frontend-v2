import { ApiError } from './api-error';

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Unable to reach the server. Check your connection and try again.',
  400: 'Something in your request looks incorrect. Please check and try again.',
  401: 'Your session has ended. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'This action conflicts with existing information.',
  422: 'Some details are invalid. Please review and try again.',
  429: 'Too many attempts. Please wait a moment and try again.',
  500: 'Something went wrong on our side. Please try again in a moment.',
  502: 'The service is temporarily unavailable. Please try again.',
  503: 'The service is temporarily unavailable. Please try again.',
};

const MESSAGE_ALIASES: Record<string, string> = {
  'Invalid credentials': 'Email or password is incorrect.',
  'Email not verified. OTP resent.':
    'Please verify your email. We sent you a new verification code.',
  'Invalid refresh token': 'Your session has ended. Please sign in again.',
  'No refresh token': 'Your session has ended. Please sign in again.',
  'Token revoked': 'Your session has ended. Please sign in again.',
  'User inactive': 'This account is inactive. Contact support if you need help.',
  'Access denied': 'You do not have permission to access this area.',
  'Insufficient role permissions':
    'You do not have permission to perform this action.',
  'Record not found': 'We could not find what you were looking for.',
  'A record with this value already exists':
    'This information is already in use. Try a different value.',
  'Not enrolled': 'You need to enroll in this course first.',
  'Enrollment required': 'You need to enroll in this course first.',
  'Course not found': 'This course is no longer available.',
  'Lesson not found': 'This lesson is no longer available.',
  'Quiz not found': 'This quiz is no longer available.',
  'Answer every question': 'Please answer every question before submitting.',
  'Too many OTP requests':
    'Too many verification codes requested. Please wait before trying again.',
  'Email already registered': 'An account with this email already exists.',
};

const TECHNICAL_PATTERNS: RegExp[] = [
  /prisma/i,
  /sql/i,
  /ECONNREFUSED/i,
  /unexpected token/i,
  /cannot read propert/i,
  /internal server error/i,
  /request failed \(\d+\)/i,
  /jwt/i,
  /invalid `/i,
  /^Error:/i,
  /node_modules/i,
  /P\d{4}/,
];

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

function isTechnicalMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (trimmed.length > 220) return true;
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Convert raw API / thrown messages into user-safe copy. */
export function sanitizeUserMessage(
  message: string | undefined | null,
  statusCode = 500,
  fallback = 'Something went wrong. Please try again.',
): string {
  const trimmed = message?.trim() ?? '';
  if (MESSAGE_ALIASES[trimmed]) return MESSAGE_ALIASES[trimmed];
  if (!trimmed || isTechnicalMessage(trimmed)) {
    return STATUS_MESSAGES[statusCode] ?? fallback;
  }
  return trimmed;
}

export function resolveApiErrorMessage(
  message: string | undefined,
  statusCode: number,
): string {
  return sanitizeUserMessage(message, statusCode);
}

export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isApiError(err)) {
    return sanitizeUserMessage(err.message, err.statusCode, fallback);
  }

  if (err instanceof TypeError && /fetch|network/i.test(err.message)) {
    return STATUS_MESSAGES[0] ?? fallback;
  }

  if (err instanceof Error && err.message) {
    return sanitizeUserMessage(err.message, 500, fallback);
  }

  return fallback;
}

export function shouldRetryRequest(err: unknown): boolean {
  if (!isApiError(err)) return true;
  return err.statusCode >= 500 || err.statusCode === 408;
}
