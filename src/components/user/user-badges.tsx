'use client';

import {
  BadgeCheck,
  GraduationCap,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { UserRole } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; Icon: typeof GraduationCap; badgeClass: string; verifyClass: string }
> = {
  STUDENT: {
    label: 'Student',
    Icon: GraduationCap,
    badgeClass: 'bg-sky-100 text-sky-800 ring-sky-200',
    verifyClass: 'text-sky-600',
  },
  TRAINER: {
    label: 'Trainer',
    Icon: Sparkles,
    badgeClass: 'bg-amber-100 text-amber-900 ring-amber-200',
    verifyClass: 'text-amber-600',
  },
  ADMIN: {
    label: 'Admin',
    Icon: Shield,
    badgeClass: 'bg-violet-100 text-violet-900 ring-violet-200',
    verifyClass: 'text-violet-600',
  },
  SUPERADMIN: {
    label: 'Super Admin',
    Icon: Shield,
    badgeClass: 'bg-rose-100 text-rose-900 ring-rose-200',
    verifyClass: 'text-rose-600',
  },
  PARENT: {
    label: 'Parent',
    Icon: UserRound,
    badgeClass: 'bg-teal-100 text-teal-900 ring-teal-200',
    verifyClass: 'text-teal-600',
  },
};

export function RoleBadge({
  role,
  className,
  compact = false,
}: {
  role?: UserRole | string | null;
  className?: string;
  compact?: boolean;
}) {
  if (!role || !(role in ROLE_CONFIG)) return null;
  const config = ROLE_CONFIG[role as UserRole];
  const Icon = config.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-bold ring-1 ring-inset',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
        config.badgeClass,
        className,
      )}
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {config.label}
    </span>
  );
}

export function VerifiedMarker({
  role,
  isVerified,
  className,
  showLabel = false,
}: {
  role?: UserRole | string | null;
  isVerified?: boolean;
  className?: string;
  showLabel?: boolean;
}) {
  if (!isVerified) return null;
  const config =
    role && role in ROLE_CONFIG
      ? ROLE_CONFIG[role as UserRole]
      : ROLE_CONFIG.STUDENT;

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', config.verifyClass, className)}
      title={`Verified ${config.label.toLowerCase()}`}
    >
      <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
      )}
    </span>
  );
}

export function UserNameWithBadges({
  firstName,
  lastName,
  displayRole,
  isVerified,
  className,
  nameClassName,
  compact = false,
}: {
  firstName: string;
  lastName: string;
  displayRole?: UserRole | string | null;
  isVerified?: boolean;
  className?: string;
  nameClassName?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      <span className={cn('font-semibold text-foreground', nameClassName)}>
        {firstName} {lastName}
      </span>
      <VerifiedMarker role={displayRole} isVerified={isVerified} />
      {!compact && <RoleBadge role={displayRole} compact />}
    </span>
  );
}

export function UserBadgesRow({
  displayRole,
  isVerified,
  className,
}: {
  displayRole?: UserRole | string | null;
  isVerified?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <RoleBadge role={displayRole} />
      {isVerified && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <VerifiedMarker role={displayRole} isVerified showLabel />
        </span>
      )}
    </div>
  );
}

export { ROLE_CONFIG };
