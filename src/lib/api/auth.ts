import { apiRequest } from './client';
import { refreshSession } from './token-refresh';
import type { AuthTokens, User } from './types';

export async function login(email: string, password: string) {
  return apiRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  return apiRequest<{ message: string; email: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD' = 'VERIFY_EMAIL',
) {
  return apiRequest<AuthTokens | { message: string; email: string }>(
    '/auth/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify({ email, code, purpose }),
    },
  );
}

export async function resendOtp(
  email: string,
  purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD',
) {
  return apiRequest<{ message: string; email?: string }>('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email, purpose }),
  });
}

export async function forgotPassword(email: string) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: {
  email: string;
  code: string;
  newPassword: string;
}) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken() {
  return refreshSession();
}

export async function logout(token: string) {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
  });
}

/** Workspace-aware profile (preferred — uses JWT org context). */
export async function getMe(token: string) {
  return apiRequest<User>('/auth/me', { token });
}

/** Alias for profile updates that need full user record. */
export async function getUserProfile(token: string) {
  return apiRequest<User>('/users/me', { token });
}

export async function switchOrg(token: string, organizationId: string) {
  return apiRequest<AuthTokens>('/auth/switch-org', {
    method: 'POST',
    token,
    body: JSON.stringify({ organizationId }),
  });
}
