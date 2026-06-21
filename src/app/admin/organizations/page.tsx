'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Building2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { EmptyState } from '@/components/dashboard/empty-state';
import { DetailPageSkeleton } from '@/components/dashboard/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/api/errors';
import {
  getCertificateSettings,
  listMyMemberships,
  updateCertificateSettings,
  updateOrganization,
} from '@/lib/api/organizations';
import { useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';

export default function AdminOrgsPage() {
  const token = useAuthStore((s) => s.accessToken)!;
  const { orgId, orgName } = useActiveOrg();
  const queryClient = useQueryClient();

  const { data: memberships = [] } = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => listMyMemberships(token),
    enabled: !!token,
  });

  const activeMembership = memberships.find((m) => m.org.id === orgId);
  const org = activeMembership?.org;

  const [form, setForm] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    website: '',
  });

  const [certForm, setCertForm] = useState({
    ceoName: '',
    ceoTitle: '',
    programLeaderName: '',
    programLeaderTitle: '',
  });

  const { isLoading } = useQuery({
    queryKey: ['organizations', 'detail', orgId],
    queryFn: async () => {
      if (!org) return null;
      setForm({
        name: org.name ?? '',
        description: '',
        country: '',
        city: '',
        website: '',
      });
      return org;
    },
    enabled: !!org,
  });

  const { data: certSettings, isLoading: certLoading } = useQuery({
    queryKey: ['organizations', 'certificate-settings', orgId],
    queryFn: () => getCertificateSettings(orgId!, token),
    enabled: !!orgId && !!token,
  });

  useEffect(() => {
    if (certSettings?.settings) {
      setCertForm({
        ceoName: certSettings.settings.ceoName,
        ceoTitle: certSettings.settings.ceoTitle,
        programLeaderName: certSettings.settings.programLeaderName,
        programLeaderTitle: certSettings.settings.programLeaderTitle,
      });
    }
  }, [certSettings]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('No organization selected');
      return updateOrganization(orgId, token, {
        name: form.name,
        description: form.description || undefined,
        country: form.country || undefined,
        city: form.city || undefined,
        website: form.website || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Organization updated');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const saveCertMutation = useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('No organization selected');
      return updateCertificateSettings(orgId, token, certForm);
    },
    onSuccess: () => {
      toast.success('Certificate signatories saved');
      queryClient.invalidateQueries({ queryKey: ['organizations', 'certificate-settings', orgId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!orgId) {
    return (
      <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
        <PageHeader
          title="Organization"
          description="Manage your workspace settings."
          breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Organization' }]}
        />
        <EmptyState
          icon={Building2}
          title="No workspace selected"
          description="Join or create an organization to manage settings."
          primaryAction={{ label: 'Go to onboarding', href: '/onboarding' }}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={['ADMIN', 'SUPERADMIN']}>
      <PageHeader
        title="Organization"
        description={`Settings for ${orgName ?? 'your workspace'}.`}
        breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: 'Organization' }]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {isLoading ? (
          <DetailPageSkeleton />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="dash-card space-y-4 p-6"
          >
            <h2 className="text-lg font-bold text-foreground">Organization profile</h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-brand-green/18 px-3 py-2 text-sm outline-none focus:border-brand-green"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Website</label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://"
              />
            </div>
            <p className="text-xs text-brand-muted">
              Slug: <span className="font-mono">{org?.slug}</span> · Type: {org?.type}
            </p>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="gap-2 bg-brand-green hover:bg-brand-green-dark"
            >
              <Save className="h-4 w-4" />
              Save organization
            </Button>
          </form>
        )}

        {certLoading ? (
          <DetailPageSkeleton />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCertMutation.mutate();
            }}
            className="dash-card space-y-4 p-6"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10">
                <Award className="h-5 w-5 text-brand-green" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Certificate signatories</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Names printed on approved PDF certificates and shown to students after course completion.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-brand-green/20 bg-brand-mint-wash px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">
                Certificate issuer
              </p>
              <p className="mt-1 text-sm font-bold text-brand-ink">
                {certSettings?.issuerName ?? 'Ingobyi Innovation Hub'}
              </p>
              <p className="mt-1 text-xs text-brand-muted">
                All certificates on Ingobyi Academy are provided by Ingobyi Innovation Hub,
                regardless of which school or organization runs the course.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">CEO name</label>
                <Input
                  value={certForm.ceoName}
                  onChange={(e) => setCertForm((f) => ({ ...f, ceoName: e.target.value }))}
                  placeholder={certSettings?.defaults.ceoName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">CEO title</label>
                <Input
                  value={certForm.ceoTitle}
                  onChange={(e) => setCertForm((f) => ({ ...f, ceoTitle: e.target.value }))}
                  placeholder={certSettings?.defaults.ceoTitle}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Program leader name</label>
                <Input
                  value={certForm.programLeaderName}
                  onChange={(e) => setCertForm((f) => ({ ...f, programLeaderName: e.target.value }))}
                  placeholder={certSettings?.defaults.programLeaderName}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-muted">Program leader title</label>
                <Input
                  value={certForm.programLeaderTitle}
                  onChange={(e) => setCertForm((f) => ({ ...f, programLeaderTitle: e.target.value }))}
                  placeholder={certSettings?.defaults.programLeaderTitle}
                />
              </div>
            </div>

            <p className="rounded-lg bg-brand-mint-wash px-3 py-2 text-xs text-brand-muted">
              Defaults: {certSettings?.defaults.ceoName} ({certSettings?.defaults.ceoTitle}) and{' '}
              {certSettings?.defaults.programLeaderName} ({certSettings?.defaults.programLeaderTitle}).
              Certificates include a QR code linking to public verification and the learner&apos;s achievements profile.
            </p>

            <Button
              type="submit"
              disabled={saveCertMutation.isPending}
              className="gap-2 bg-brand-green hover:bg-brand-green-dark"
            >
              <Save className="h-4 w-4" />
              Save certificate settings
            </Button>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
