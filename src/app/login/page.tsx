'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { ExploreNav } from '@/components/layout/explore-nav';
import { BrandLogo } from '@/components/brand-logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  forgotPassword,
  login,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from '@/lib/api/auth';
import { applyAuthSession } from '@/lib/api/session';
import { useAuthStore } from '@/lib/auth/store';
import { redirectPathLabel, resolvePostAuthRedirect, sanitizeRedirectPath } from '@/lib/auth/redirect';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/api/errors';

type Mode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80';

const inputClass =
  'h-12 rounded-md border-2 border-brand-green/18 bg-white px-5 text-[15px] font-medium text-brand-ink shadow-sm transition-all placeholder:text-brand-ink/38 focus-visible:border-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/15';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-white font-poppins antialiased">
      <ExploreNav showCatalogQuickNav={false} />
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-brand-ink/55">Loading…</p>
      </div>
    </div>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const safeRedirect = sanitizeRedirectPath(redirectParam);
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [otp, setOtp] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'VERIFY_EMAIL' | 'RESET_PASSWORD'>('VERIFY_EMAIL');

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  function goAfterAuth(user: Parameters<typeof resolvePostAuthRedirect>[0]) {
    router.push(resolvePostAuthRedirect(user, redirectParam));
  }

  function setAuthMode(m: 'signin' | 'signup') {
    setMode(m);
    setError('');
  }

  async function handleResendOtp() {
    if (!verifyEmail) return;
    setResending(true);
    setError('');
    try {
      await resendOtp(verifyEmail, otpPurpose);
      setOtp('');
      toast.success('New code sent to your email');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend code'));
    } finally {
      setResending(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      applyAuthSession(data);
      toast.success('Welcome back!');
      goAfterAuth(data.user);
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid credentials');
      if (msg.includes('Email not verified')) {
        setVerifyEmail(email);
        setOtpPurpose('VERIFY_EMAIL');
        setOtp('');
        setMode('verify');
        toast.info('Enter the verification code sent to your email');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, firstName, lastName });
      setVerifyEmail(email);
      setOtpPurpose('VERIFY_EMAIL');
      setOtp('');
      setMode('verify');
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp(verifyEmail, otp, otpPurpose);
      if (otpPurpose === 'VERIFY_EMAIL' && 'accessToken' in data) {
        applyAuthSession(data);
        toast.success('Account verified!');
        goAfterAuth(data.user);
      } else {
        setMode('reset');
        toast.success('Code verified — set your new password');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setVerifyEmail(email);
      setOtpPurpose('RESET_PASSWORD');
      setOtp('');
      setMode('verify');
      toast.success('Reset code sent to your email');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send reset code'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email: verifyEmail, code: otp, newPassword: password });
      toast.success('Password updated — sign in with your new password');
      setEmail(verifyEmail);
      setPassword('');
      setOtp('');
      setMode('signin');
    } catch (err) {
      setError(getErrorMessage(err, 'Password reset failed'));
    } finally {
      setLoading(false);
    }
  }

  const heading =
    mode === 'verify'
      ? otpPurpose === 'RESET_PASSWORD'
        ? 'Enter reset code'
        : 'Verify your email'
      : mode === 'forgot'
        ? 'Forgot password'
        : mode === 'reset'
          ? 'Set new password'
          : 'Welcome to Ingobyi Academy';

  const subheading =
    mode === 'verify'
      ? `We sent a 6-digit code to ${verifyEmail}`
      : mode === 'forgot'
        ? 'Enter your email and we will send a reset code.'
        : mode === 'reset'
          ? 'Choose a strong new password for your account.'
          : mode === 'signin'
            ? 'Sign in to your account to continue learning.'
            : 'Create your free account and start learning today.';

  return (
    <div className="min-h-screen bg-white font-poppins antialiased">
      <ExploreNav showCatalogQuickNav={false} />

      <div className="grid min-h-[calc(100vh-4.25rem)] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden p-6 lg:flex xl:p-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] shadow-2xl"
          >
            <img
              src={AUTH_IMAGE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-green/90 via-brand-green/35 to-transparent" />
            <div className="relative z-10 mt-auto p-8 xl:p-10">
              <BrandLogo size="lg" />
              <p className="mt-6 max-w-md font-semibold leading-snug text-white drop-shadow-sm xl:text-lg">
                Rwanda&apos;s learning infrastructure for schools &amp; organizations
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
                Join thousands of learners and trainers building skills for Africa&apos;s future.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/55 transition hover:text-brand-green"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to home
            </Link>

            <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
              <BrandLogo size="lg" className="max-w-[min(100%,260px)]" />
            </div>

            {mode === 'signin' || mode === 'signup' ? (
              <>
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-2xl font-bold tracking-tight text-brand-ink sm:text-[26px]"
                >
                  {heading}
                </motion.h1>

                <div className="mx-auto mt-6 flex w-full max-w-md rounded-md bg-brand-login-highlight p-1.5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className={cn(
                      'relative z-10 flex-1 rounded-md py-3 text-sm font-semibold transition-all',
                      mode === 'signin'
                        ? 'bg-brand-green text-white shadow-md'
                        : 'text-brand-green/75 hover:text-brand-green',
                    )}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={cn(
                      'relative z-10 flex-1 rounded-md py-3 text-sm font-semibold transition-all',
                      mode === 'signup'
                        ? 'bg-brand-green text-white shadow-md'
                        : 'text-brand-green/75 hover:text-brand-green',
                    )}
                  >
                    Register
                  </button>
                </div>

                <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-brand-ink/55">
                  {subheading}
                </p>
                {safeRedirect && (mode === 'signin' || mode === 'signup') ? (
                  <p className="mx-auto mt-3 max-w-md rounded-lg bg-brand-mint-wash/60 px-4 py-2 text-center text-xs text-brand-green">
                    After signing in, you&apos;ll return to {redirectPathLabel(safeRedirect)}.
                  </p>
                ) : null}
              </>
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-brand-ink">{heading}</h1>
                <p className="mt-2 text-sm text-brand-ink/55">{subheading}</p>
              </div>
            )}

            <div className="mt-8 space-y-6">
              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-xs font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              {mode === 'signin' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  onSubmit={handleSignIn}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Email
                    </label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-[13px] font-semibold text-brand-ink">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                        }}
                        className="text-xs font-medium text-brand-green/80 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Min. 8 characters"
                        className={cn(inputClass, 'pr-12')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-green/45 hover:text-brand-green"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-md bg-brand-green text-base font-bold text-white shadow-lg transition hover:bg-brand-green-dark"
                  >
                    {loading ? '…' : 'Sign in'}
                  </Button>
                  {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true' && (
                    <p className="text-center text-xs text-brand-ink/45">
                      Demo: fidelniyomugabo67@gmail.com / password123 · holly.worshiptv@gmail.com / password123
                    </p>
                  )}
                </motion.form>
              )}

              {mode === 'signup' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  onSubmit={handleSignUp}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                        First name
                      </label>
                      <Input
                        autoComplete="given-name"
                        placeholder="Alice"
                        className={inputClass}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                        Last name
                      </label>
                      <Input
                        autoComplete="family-name"
                        placeholder="Doe"
                        className={inputClass}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Email
                    </label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        className={cn(inputClass, 'pr-12')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-green/45 hover:text-brand-green"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Confirm password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-md bg-brand-green text-base font-bold text-white shadow-lg transition hover:bg-brand-green-dark"
                  >
                    {loading ? '…' : 'Create account'}
                  </Button>
                </motion.form>
              )}

              {mode === 'verify' && (
                <form onSubmit={handleVerify} className="space-y-5">
                  <div className="flex flex-col items-center gap-3">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                        <InputOTPSlot index={1} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                        <InputOTPSlot index={2} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                        <InputOTPSlot index={4} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                        <InputOTPSlot index={5} className="h-12 w-11 rounded-md border-2 border-brand-green/20 text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-brand-ink/45">Code expires in 10 minutes</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="h-12 w-full rounded-md bg-brand-green font-bold text-white"
                  >
                    {loading ? '…' : otpPurpose === 'RESET_PASSWORD' ? 'Continue' : 'Verify'}
                  </Button>
                  <button
                    type="button"
                    disabled={resending}
                    onClick={handleResendOtp}
                    className="w-full text-center text-sm font-medium text-brand-green/80 underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    className="w-full text-center text-sm font-medium text-brand-ink/55 underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setOtp('');
                    }}
                  >
                    Back to sign in
                  </button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Email
                    </label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={inputClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-md bg-brand-green font-bold text-white"
                  >
                    {loading ? '…' : 'Send reset code'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm font-medium text-brand-ink/55 underline-offset-4 hover:underline"
                    onClick={() => {
                      setMode('signin');
                      setError('');
                    }}
                  >
                    Back to sign in
                  </button>
                </form>
              )}

              {mode === 'reset' && (
                <form onSubmit={handleReset} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      New password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        className={cn(inputClass, 'pr-12')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-green/45 hover:text-brand-green"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-brand-ink">
                      Confirm new password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-md bg-brand-green font-bold text-white"
                  >
                    {loading ? '…' : 'Update password'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
