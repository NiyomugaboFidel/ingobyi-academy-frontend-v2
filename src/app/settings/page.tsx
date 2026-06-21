'use client';

import { useState } from 'react';
import { useTheme, type ThemeMode } from '@/components/theme-provider';
import {
  Bell, Lock, Globe2, Trash2, Shield, Palette, Mail,
  MessageSquare, Eye, Download, User,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';
import { useAuthStore } from '@/lib/auth/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'language', label: 'Language', icon: Globe2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'data', label: 'Data & export', icon: Download },
  { id: 'account', label: 'Account', icon: User },
];

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [active, setActive] = useState('notifications');
  const [lang, setLang] = useState('en');
  const { theme, setTheme } = useTheme();
  const [notifs, setNotifs] = useState({
    email: true, progress: true, messages: true, marketing: false, courseUpdates: true,
  });

  return (
    <DashboardShell>
        <PageHeader title="Settings" description="Manage your account preferences and system configuration." />

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Some settings are preview-only</p>
          <p className="mt-0.5 text-amber-800/90">
            Appearance (theme) works today. Notification, language, security, and account actions will be saved in a future update.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar nav */}
          <nav className="space-y-1 rounded-xl border border-brand-green/10 bg-white p-2 shadow-sm">
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" onClick={() => setActive(s.id)}
                className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  active === s.id ? 'bg-brand-green text-white' : 'text-brand-ink hover:bg-brand-green/5')}>
                <s.icon className="h-4 w-4" />{s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-6">
            {active === 'notifications' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Notification preferences</h2>
                <p className="mt-1 text-sm text-muted-foreground">Choose what you want to be notified about.</p>
                <div className="mt-5 space-y-4">
                  {[
                    { key: 'email' as const, label: 'Email notifications', desc: 'Course updates, enrollments, and system alerts.' },
                    { key: 'progress' as const, label: 'Progress reminders', desc: 'Weekly reminders to continue learning.' },
                    { key: 'messages' as const, label: 'Message notifications', desc: 'New direct messages and course chat.' },
                    { key: 'courseUpdates' as const, label: 'Course updates', desc: 'New lessons and content in enrolled courses.' },
                    { key: 'marketing' as const, label: 'Marketing emails', desc: 'News, events, and program announcements.' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-start justify-between gap-4 border-b border-brand-green/6 pb-4 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-brand-ink">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={(v) => setNotifs((p) => ({ ...p, [key]: v }))} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'privacy' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Privacy settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ingobyi Academy keeps learner profiles public so people can follow each other, share progress, and start conversations in the community.
                </p>
                <div className="mt-5 space-y-4">
                  {[
                    {
                      label: 'Public profile',
                      desc: 'Your name, avatar, bio, achievements, and community posts are visible to everyone.',
                      enabled: true,
                    },
                    {
                      label: 'Community connections',
                      desc: 'Other members can follow you and send direct messages based on platform messaging rules.',
                      enabled: true,
                    },
                    {
                      label: 'Learning activity',
                      desc: 'Completed courses and achievements may appear on your public profile.',
                      enabled: true,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 rounded-xl border border-brand-green/8 bg-brand-canvas/60 p-4">
                      <div>
                        <p className="text-sm font-semibold text-brand-ink">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="rounded-full bg-brand-green/10 px-3 py-1 text-[11px] font-bold text-brand-green">
                        Always on
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'language' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Language &amp; region</h2>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Interface language</label>
                    <select value={lang} onChange={(e) => setLang(e.target.value)}
                      className="w-full rounded-lg border border-brand-green/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-green">
                      <option value="en">English</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">Timezone</label>
                    <select className="w-full rounded-lg border border-brand-green/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-green">
                      <option>Africa/Kigali (CAT, UTC+2)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {active === 'appearance' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Appearance</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setTheme(t as ThemeMode)}
                      className={cn('rounded-xl border-2 p-4 text-center text-sm font-semibold capitalize transition',
                        theme === t ? 'border-brand-green bg-brand-green/5 text-brand-green' : 'border-brand-green/15 hover:border-brand-green/30')}>
                      {t}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {active === 'security' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Security</h2>
                <div className="mt-5 space-y-3">
                  {['Current password', 'New password', 'Confirm new password'].map((label) => (
                    <div key={label}>
                      <label className="mb-1 block text-xs font-semibold">{label}</label>
                      <input type="password" className="w-full rounded-lg border border-brand-green/15 px-4 py-2.5 text-sm outline-none focus:border-brand-green" />
                    </div>
                  ))}
                  <Button className="rounded-full bg-brand-green font-bold hover:bg-brand-green-dark">Update password</Button>
                </div>
                <div className="mt-6 border-t border-brand-green/8 pt-6">
                  <h3 className="text-sm font-bold text-brand-ink">Two-factor authentication</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  <Button variant="outline" className="mt-3 rounded-full">Enable 2FA</Button>
                </div>
              </section>
            )}

            {active === 'data' && (
              <section className="rounded-2xl border border-brand-green/10 bg-white p-6 shadow-sm">
                <h2 className="font-extrabold text-brand-ink">Data &amp; export</h2>
                <p className="mt-1 text-sm text-muted-foreground">Download your data or import records.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button variant="outline" className="gap-2 rounded-full"><Download className="h-4 w-4" /> Export my data (JSON)</Button>
                  <Button variant="outline" className="gap-2 rounded-full"><Download className="h-4 w-4" /> Export progress (CSV)</Button>
                </div>
              </section>
            )}

            {active === 'account' && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <h2 className="font-extrabold text-red-900">Danger zone</h2>
                </div>
                <p className="mt-2 text-sm text-red-700">
                  Deleting your account ({user?.email}) is permanent. All progress, certificates, and messages will be lost.
                </p>
                <Button variant="destructive" className="mt-4 rounded-full">Delete account</Button>
              </section>
            )}

            <div className="flex justify-end">
              <Button className="rounded-full bg-brand-green px-8 font-bold hover:bg-brand-green-dark">Save all settings</Button>
            </div>
          </div>
        </div>
    </DashboardShell>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} role="switch" aria-checked={checked}
      className={cn('relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-brand-green' : 'bg-gray-200')}>
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0')} />
    </button>
  );
}
