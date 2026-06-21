'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import {
  BookOpen, Building2, ClipboardCheck, GraduationCap, Shield, Sparkles, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type RoleVariant = 'trainer' | 'admin' | 'superadmin';

const VARIANTS: Record<RoleVariant, {
  label: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  Icon: typeof GraduationCap;
}> = {
  trainer: {
    label: 'Instructor portal',
    title: 'Your teaching workspace',
    subtitle: 'Manage courses, track student progress, grade assignments, and stay connected with learners.',
    gradient: 'from-emerald-800 via-brand-green to-brand-green-dark',
    accent: 'text-brand-mint',
    Icon: GraduationCap,
  },
  admin: {
    label: 'Organization admin',
    title: 'Operations command center',
    subtitle: 'Oversee enrollments, moderate content, approve courses, and keep your organization running smoothly.',
    gradient: 'from-slate-800 via-brand-green-dark to-brand-green',
    accent: 'text-sky-200',
    Icon: Building2,
  },
  superadmin: {
    label: 'Platform superadmin',
    title: 'Platform command center',
    subtitle: 'Cross-tenant oversight — organizations, users, permissions, and platform-wide learning operations.',
    gradient: 'from-indigo-950 via-brand-green-darker to-brand-green-dark',
    accent: 'text-violet-200',
    Icon: Shield,
  },
};

export function RoleHero({
  variant,
  userName,
  orgName,
  actions,
  stats,
}: {
  variant: RoleVariant;
  userName?: string;
  orgName?: string;
  actions?: ReactNode;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  const v = VARIANTS[variant];
  const greeting = userName ? `Hello, ${userName}` : v.label;

  return (
    <section className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9', v.gradient)}>
      <v.Icon className="absolute -right-6 -top-6 h-36 w-36 text-white/8" />
      <Sparkles className="absolute bottom-4 right-8 h-16 w-16 text-white/6" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20', v.accent)}>
            <v.Icon className="h-3.5 w-3.5" />
            {v.label}
          </span>
          <p className="mt-3 text-sm font-medium text-white/70">{greeting}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{v.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
            {orgName && variant === 'admin' ? `${orgName} — ` : ''}
            {v.subtitle}
          </p>
          {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {stats.map((s) => (
              <div key={s.label} className="min-w-[100px] rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{s.label}</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function ActionTile({
  href,
  Icon,
  label,
  description,
  badge,
  variant = 'default',
}: {
  href: string;
  Icon: typeof BookOpen;
  label: string;
  description?: string;
  badge?: string | number;
  variant?: 'default' | 'primary' | 'warning';
}) {
  const styles = {
    default: 'hover:border-brand-green/25 hover:bg-brand-mint-wash/50',
    primary: 'border-brand-green/20 bg-brand-green/5 hover:border-brand-green/35 hover:bg-brand-green/8',
    warning: 'border-amber-200/80 bg-amber-50/80 hover:border-amber-300 dark:border-amber-800 dark:bg-amber-950/30',
  };

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-all hover:shadow-md',
        styles[variant],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-lg border border-brand-green/10 bg-brand-green/5 p-2 text-brand-green transition group-hover:bg-brand-green/10">
          <Icon className="h-4 w-4" />
        </div>
        {badge != null && badge !== 0 && (
          <span className="rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-bold text-white">{badge}</span>
        )}
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-brand-green">{label}</p>
      {description && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>}
    </Link>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function TrainerHeroActions() {
  return (
    <>
      <Button asChild size="sm" className="rounded-full bg-white text-brand-green hover:bg-white/90">
        <Link href="/trainer/courses/new"><BookOpen className="mr-1.5 h-4 w-4" /> New course</Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
        <Link href="/trainer/grading"><ClipboardCheck className="mr-1.5 h-4 w-4" /> Grade work</Link>
      </Button>
      <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10">
        <Link href="/trainer/messages"><Users className="mr-1.5 h-4 w-4" /> Messages</Link>
      </Button>
    </>
  );
}
