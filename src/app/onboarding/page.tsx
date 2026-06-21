'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  School,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMe, refreshToken, switchOrg } from '@/lib/api/auth';
import { applyAuthSession } from '@/lib/api/session';
import { getErrorMessage } from '@/lib/api/errors';
import {
  bootstrapOrganization,
  listMyJoinRequests,
  listAllOrgDirectory,
  submitJoinRequest,
} from '@/lib/api/organizations';
import type { UserRole } from '@/lib/api/types';
import {
  getPostAuthRedirect,
  hasActiveMembership,
  needsOnboarding,
  useAuthStore,
} from '@/lib/auth/store';
import { cn } from '@/lib/utils';

const REQUESTABLE_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'STUDENT', label: 'Student', description: 'Learn courses in this organization' },
  { value: 'TRAINER', label: 'Trainer', description: 'Create and teach courses' },
  { value: 'PARENT', label: 'Parent', description: 'Monitor a child\'s progress' },
];

const ORG_TYPES = [
  { value: 'SCHOOL', label: 'School' },
  { value: 'TRAINING_CENTER', label: 'Training center' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'NGO', label: 'NGO' },
  { value: 'COMPANY', label: 'Company' },
];

type Step = 'choose' | 'join' | 'create' | 'waiting';

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user, setAuth, clearAuth } = useAuthStore();
  const [step, setStep] = useState<Step>('choose');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [requestedRole, setRequestedRole] = useState<UserRole>('STUDENT');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('SCHOOL');
  const [orgCountry, setOrgCountry] = useState('');
  const [orgSearch, setOrgSearch] = useState('');

  const { data: directoryOrgs = [], isLoading: dirLoading } = useQuery({
    queryKey: ['onboarding', 'directory'],
    queryFn: () => listAllOrgDirectory(),
  });

  const { data: myRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['onboarding', 'my-requests'],
    queryFn: () => listMyJoinRequests(accessToken!),
    enabled: !!accessToken,
  });

  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');
  const selectedOrg = directoryOrgs.find((o) => o.id === selectedOrgId);
  const filteredOrgs = directoryOrgs.filter((org) => {
    const q = orgSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      org.name.toLowerCase().includes(q) ||
      org.type?.toLowerCase().includes(q) ||
      org.city?.toLowerCase().includes(q) ||
      org.country?.toLowerCase().includes(q)
    );
  });

  if (!accessToken || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-canvas px-4">
        <p className="text-sm text-brand-muted">Sign in to continue onboarding.</p>
        <Button asChild className="bg-brand-green hover:bg-brand-green-dark">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  useEffect(() => {
    if (user && !needsOnboarding(user)) {
      router.replace(getPostAuthRedirect(user));
    }
  }, [user, router]);

  if (user && !needsOnboarding(user)) {
    return null;
  }

  async function refreshStatus() {
    if (!accessToken) return;
    setRefreshing(true);
    try {
      try {
        const refreshed = await refreshToken();
        applyAuthSession(refreshed);
      } catch {
        const freshUser = await getMe(accessToken);
        setAuth(accessToken, freshUser);
      }
      await queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      const currentUser = useAuthStore.getState().user;
      if (currentUser && hasActiveMembership(currentUser)) {
        toast.success('You\'ve been approved! Redirecting…');
        router.push(getPostAuthRedirect(currentUser));
      } else {
        toast.info('Still waiting for approval');
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not refresh status'));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleJoinRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !selectedOrgId) return;
    setSubmitting(true);
    try {
      await submitJoinRequest(accessToken, {
        organizationId: selectedOrgId,
        requestedRole,
        message: message.trim() || undefined,
      });
      toast.success('Request sent! An admin will review it.');
      setMessage('');
      setStep('waiting');
      await queryClient.invalidateQueries({ queryKey: ['onboarding', 'my-requests'] });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not submit request'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !orgName.trim()) return;
    setSubmitting(true);
    try {
      const org = await bootstrapOrganization(accessToken, {
        name: orgName.trim(),
        type: orgType,
        country: orgCountry.trim() || undefined,
      });
      const switched = await switchOrg(accessToken, org.id);
      applyAuthSession(switched);
      toast.success('Organization created! You are now the admin.');
      router.push(getPostAuthRedirect(switched.user));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create organization'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-canvas">
      <header className="border-b border-brand-green/10 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-brand-muted sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-brand-muted"
              onClick={() => {
                clearAuth();
                router.push('/login');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-ink md:text-3xl">
            Welcome, {user.firstName}!
          </h1>
          <p className="mt-2 text-sm text-brand-muted md:text-base">
            Join a school or organization to get started, or create your own workspace.
          </p>
        </div>

        {(pendingRequests.length > 0 || step === 'waiting') && (
          <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50/80 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <h2 className="font-semibold text-amber-900">Waiting for approval</h2>
                  <p className="mt-1 text-sm text-amber-800/90">
                    Your request was sent to the organization admin. You&apos;ll get access once approved.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 border-amber-300 text-amber-900"
                onClick={refreshStatus}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                Check status
              </Button>
            </div>
            <ul className="mt-4 space-y-2">
              {(requestsLoading ? [] : pendingRequests).map((req) => (
                <li
                  key={req.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200/80 bg-white px-3 py-2 text-sm"
                >
                  <span className="font-medium text-brand-ink">
                    {req.org?.name ?? 'Organization'}
                  </span>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {req.requestedRole} · Pending
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-700/80">
              Or an admin can add you directly from their members panel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="border-amber-300 text-amber-900">
                <Link href="/search">Browse public courses</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-amber-900 hover:bg-amber-100">
                <Link href="/contact">Need help?</Link>
              </Button>
            </div>
          </section>
        )}

        {step === 'choose' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setStep('join')}
              className="dash-card group flex flex-col items-start gap-3 p-6 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                <School className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-ink">Join an organization</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Browse schools and request a role. Wait for admin approval.
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setStep('create')}
              className="dash-card group flex flex-col items-start gap-3 p-6 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-ink">Create organization</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Set up your own school or training center. You become the admin.
                </p>
              </div>
            </button>
          </div>
        )}

        {step === 'join' && (
          <div className="dash-card p-6">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="mb-4 text-xs font-medium text-brand-green hover:underline"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-brand-ink">Request to join</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Pick an organization and the role you&apos;d like. An admin will approve or assign a different role.
            </p>

            {dirLoading ? (
              <div className="mt-6 h-32 animate-pulse rounded-lg bg-brand-canvas" />
            ) : (
              <form onSubmit={handleJoinRequest} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Organization
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                    <Input
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder="Search organizations by name, city, or type…"
                      className="h-10 pl-9"
                    />
                  </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-brand-green/10 p-2">
                    {filteredOrgs.map((org) => {
                      const alreadyPending = pendingRequests.some(
                        (r) => r.orgId === org.id,
                      );
                      return (
                        <label
                          key={org.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                            selectedOrgId === org.id
                              ? 'bg-brand-green/10 ring-1 ring-brand-green/30'
                              : 'hover:bg-brand-green/5',
                            alreadyPending && 'opacity-50',
                          )}
                        >
                          <input
                            type="radio"
                            name="org"
                            value={org.id}
                            checked={selectedOrgId === org.id}
                            disabled={alreadyPending}
                            onChange={() => setSelectedOrgId(org.id)}
                            className="accent-brand-green"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-brand-ink">{org.name}</p>
                            <p className="truncate text-xs text-brand-muted">
                              {[org.type?.replace('_', ' '), org.city, org.country]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          {alreadyPending && (
                            <span className="text-[10px] text-amber-700">Pending</span>
                          )}
                        </label>
                      );
                    })}
                    {filteredOrgs.length === 0 && (
                      <p className="py-4 text-center text-sm text-brand-muted">
                        {orgSearch.trim()
                          ? 'No organizations match your search.'
                          : 'No organizations in the directory yet.'}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Requested role
                  </label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {REQUESTABLE_ROLES.map((r) => (
                      <label
                        key={r.value}
                        className={cn(
                          'cursor-pointer rounded-lg border px-3 py-3 transition-colors',
                          requestedRole === r.value
                            ? 'border-brand-green bg-brand-green/8'
                            : 'border-brand-green/15 hover:border-brand-green/30',
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={requestedRole === r.value}
                          onChange={() => setRequestedRole(r.value)}
                          className="sr-only"
                        />
                        <p className="text-sm font-semibold text-brand-ink">{r.label}</p>
                        <p className="mt-0.5 text-[11px] text-brand-muted">{r.description}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      selectedOrg
                        ? `Why do you want to join ${selectedOrg.name}?`
                        : 'Tell the admin a bit about yourself…'
                    }
                    rows={3}
                    className="w-full rounded-md border border-brand-green/18 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/15"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!selectedOrgId || submitting}
                  className="w-full gap-2 bg-brand-green hover:bg-brand-green-dark sm:w-auto"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit request
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 'create' && (
          <div className="dash-card p-6">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="mb-4 text-xs font-medium text-brand-green hover:underline"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold text-brand-ink">Create your organization</h2>
            <p className="mt-1 text-sm text-brand-muted">
              You&apos;ll be the admin and can invite members or approve join requests.
            </p>
            <form onSubmit={handleCreateOrg} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">
                  Organization name
                </label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Green Hills School"
                  required
                  className="h-11"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">
                  Type
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="h-11 w-full rounded-md border border-brand-green/18 bg-white px-3 text-sm outline-none focus:border-brand-green"
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">
                  Country (optional)
                </label>
                <Input
                  value={orgCountry}
                  onChange={(e) => setOrgCountry(e.target.value)}
                  placeholder="e.g. Rwanda"
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={!orgName.trim() || submitting}
                className="gap-2 bg-brand-green hover:bg-brand-green-dark"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create organization
              </Button>
            </form>
          </div>
        )}

        {myRequests.filter((r) => r.status !== 'PENDING').length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-brand-muted">Previous requests</h2>
            <ul className="mt-3 space-y-2">
              {myRequests
                .filter((r) => r.status !== 'PENDING')
                .map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border border-brand-green/10 bg-white px-4 py-3 text-sm"
                  >
                    <span>{req.org?.name ?? 'Organization'}</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-red-50 text-red-700',
                      )}
                    >
                      {req.status === 'APPROVED' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {req.status}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-center text-sm text-brand-muted">
          While you wait, you can{' '}
          <Link href="/catalog" className="font-medium text-brand-green hover:underline">
            browse the public course catalog
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
