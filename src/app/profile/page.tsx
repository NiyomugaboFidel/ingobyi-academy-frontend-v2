'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Camera, ExternalLink, Mail, User, Trophy, BookOpen, Building2,
  GraduationCap, Shield, Users, MessageCircle,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard, StatGrid } from '@/components/dashboard/stat-card';
import { getMe } from '@/lib/api/auth';
import { updateMe, updateAvatar, getUserAchievements, getUserCourses } from '@/lib/api/users';
import { getCommunityProfile } from '@/lib/api/community';
import { uploadImage } from '@/lib/api/uploads';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';
import { myEnrollments } from '@/lib/api/enrollments';
import { downloadCertificatePdf } from '@/lib/api/certificates';
import { getEffectiveRole, useAuthStore } from '@/lib/auth/store';
import { useActiveOrg } from '@/lib/hooks/use-active-org';
import { Button } from '@/components/ui/button';
import { RoleBadge, VerifiedMarker } from '@/components/user/user-badges';
import { AchievementGrid, AchievementShowcase } from '@/components/achievements/achievement-grid';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const token = useAuthStore((s) => s.accessToken);
  const storeUser = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({ firstName: '', lastName: '', bio: '' });
  const [saved, setSaved] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => getMe(token!),
    enabled: !!token,
  });

  const user = profile ?? storeUser;
  const { orgId, orgName } = useActiveOrg();
  const role = user ? getEffectiveRole(user, orgId) : 'STUDENT';

  useEffect(() => {
    if (profile) {
      setForm({ firstName: profile.firstName, lastName: profile.lastName, bio: profile.bio ?? '' });
    }
  }, [profile]);

  const { data: socialProfile } = useQuery({
    queryKey: ['community', 'profile', user?.id],
    queryFn: () => getCommunityProfile(user!.id, token),
    enabled: !!user?.id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => getUserAchievements(user!.id),
    enabled: !!user?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: () => getUserCourses(user!.id),
    enabled: !!user?.id,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => myEnrollments(token!),
    enabled: !!token && role === 'STUDENT',
  });

  async function handleAvatar(file: File) {
    if (!token) return;
    setAvatarUploading(true);
    try {
      const uploaded = await uploadImage(file, token);
      const updated = await updateAvatar(token, uploaded.url);
      setAuth(token, updated);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', user?.id] });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Avatar upload failed'));
    } finally {
      setAvatarUploading(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  }

  const saveMutation = useMutation({
    mutationFn: () => updateMe(token!, form),
    onSuccess: (updated) => {
      if (token) setAuth(token, updated);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', user?.id] });
      setSaved(true);
      toast.success('Profile updated');
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Could not save profile changes'));
    },
  });

  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  const followerCount = socialProfile?.followerCount ?? socialProfile?.followers.length ?? 0;
  const followingCount = socialProfile?.followingCount ?? socialProfile?.following.length ?? 0;

  const roleStats = {
    STUDENT: [
      { title: 'Enrolled', value: enrollments.length, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Completed', value: completed, icon: <GraduationCap className="h-5 w-5" /> },
      { title: 'Followers', value: followerCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
    ],
    TRAINER: [
      { title: 'Courses taught', value: courses.length, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Followers', value: followerCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Following', value: followingCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
    ],
    PARENT: [
      { title: 'Following', value: followingCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Followers', value: followerCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Courses', value: courses.length, icon: <BookOpen className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
    ],
    ADMIN: [
      { title: 'Organization', value: orgName ?? '—', icon: <Building2 className="h-5 w-5" /> },
      { title: 'Followers', value: followerCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Following', value: followingCount, icon: <Users className="h-5 w-5" /> },
      { title: 'Achievements', value: achievements.length, icon: <Trophy className="h-5 w-5" /> },
    ],
  };

  const stats = roleStats[role as keyof typeof roleStats] ?? roleStats.STUDENT;

  return (
    <DashboardShell>
      <PageHeader
        title="My profile"
        description="Manage your account. Your public profile is always visible in the community."
        actions={
          user?.id ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded text-xs">
                <Link href={`/users/${user.id}`}>
                  <ExternalLink className="h-3.5 w-3.5" /> Public profile
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded text-xs">
                <Link href="/messages">
                  <MessageCircle className="h-3.5 w-3.5" /> Messages
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="overflow-hidden rounded-2xl border border-brand-green/10 bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-br from-brand-green via-brand-green to-brand-green-dark" />
        <div className="relative px-6 pb-6">
          <div className="absolute -top-12 left-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-brand-green text-2xl font-extrabold text-white shadow-lg">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : initials}
              </div>
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-green text-white hover:bg-brand-green-dark disabled:opacity-60"
                title="Change profile photo"
              >
                <Camera className={cn('h-4 w-4', avatarUploading && 'animate-pulse')} />
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && void handleAvatar(e.target.files[0])}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-14 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-ink">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <RoleBadge role={role} />
                <VerifiedMarker role={role} isVerified={user?.isVerified} showLabel />
                {orgName && (
                  <span className="rounded-full bg-brand-canvas px-3 py-0.5 text-xs font-bold text-brand-ink">{orgName}</span>
                )}
              </div>
              {achievements.length > 0 && (
                <AchievementShowcase achievements={achievements} max={5} className="mt-4" />
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[280px]">
              {[
                { label: 'Followers', value: followerCount },
                { label: 'Following', value: followingCount },
                { label: 'Posts', value: socialProfile?.postCount ?? socialProfile?.posts.length ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-brand-green/10 bg-brand-canvas px-3 py-2 text-center">
                  <p className="text-lg font-extrabold text-brand-ink">{item.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StatGrid cols={4}>
        {stats.map((s) => (
          <StatCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </StatGrid>

      <form
        onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
        className="space-y-5 rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-extrabold text-brand-ink">Personal information</h2>
          <span className="text-xs text-brand-muted">Visible on your public profile</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(['firstName', 'lastName'] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-xs font-semibold capitalize text-brand-ink">{field.replace(/([A-Z])/, ' $1')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className="w-full rounded-lg border border-brand-green/15 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-brand-green"
                />
              </div>
            </div>
          ))}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-brand-ink">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              defaultValue={user?.email ?? ''}
              disabled
              className="w-full rounded-lg border border-brand-green/15 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-muted-foreground"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-brand-ink">Bio</label>
          <RichTextEditor
            value={form.bio || '<p></p>'}
            onChange={(html) => setForm((p) => ({ ...p, bio: html }))}
            placeholder="Tell the community about your learning goals, expertise, and interests…"
            size="md"
          />
        </div>
        <Button type="submit" disabled={saveMutation.isPending} className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">
          {saved ? '✓ Saved!' : saveMutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-brand-ink">
          <Trophy className="h-5 w-5 text-brand-green" /> Achievements &amp; certificates
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Certificates, completed courses, and recognitions from Ingobyi Academy appear here automatically.
        </p>
        <AchievementGrid
          achievements={achievements}
          downloadingId={downloadingCertId}
          onDownloadCertificate={async (certificateId, title) => {
            if (!token) return;
            setDownloadingCertId(certificateId);
            try {
              await downloadCertificatePdf(certificateId, token, `${title}.pdf`);
            } catch (err) {
              toast.error(getErrorMessage(err));
            } finally {
              setDownloadingCertId(null);
            }
          }}
        />
      </div>

      {courses.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-extrabold text-brand-ink">
            {role === 'TRAINER' ? 'Courses taught' : 'Public courses'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-brand-green/10 bg-white p-4 shadow-sm">
                <BookOpen className="h-5 w-5 shrink-0 text-brand-green" />
                <div>
                  <p className="font-semibold text-brand-ink">{c.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{c.status?.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
