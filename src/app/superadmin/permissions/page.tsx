'use client';

import { Fragment } from 'react';
import { Shield, Check } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/dashboard/page-header';

const ROLES = ['SUPERADMIN', 'ADMIN', 'TRAINER', 'STUDENT', 'PARENT'] as const;

const ROLE_BADGE: Record<string, string> = {
  SUPERADMIN: 'border border-red-200 bg-red-50 text-red-800',
  ADMIN: 'border border-orange-200 bg-orange-50 text-orange-800',
  TRAINER: 'border border-blue-200 bg-blue-50 text-blue-800',
  STUDENT: 'border border-green-200 bg-green-50 text-green-800',
  PARENT: 'border border-purple-200 bg-purple-50 text-purple-800',
};

const PERMISSIONS: { group: string; items: { label: string; roles: string[] }[] }[] = [
  {
    group: 'Platform',
    items: [
      { label: 'Full system access', roles: ['SUPERADMIN'] },
      { label: 'Manage all organizations', roles: ['SUPERADMIN'] },
      { label: 'Manage all users', roles: ['SUPERADMIN'] },
      { label: 'View platform analytics', roles: ['SUPERADMIN', 'ADMIN'] },
    ],
  },
  {
    group: 'Courses',
    items: [
      { label: 'View public courses', roles: ['SUPERADMIN', 'ADMIN', 'TRAINER', 'STUDENT', 'PARENT'] },
      { label: 'Create courses', roles: ['SUPERADMIN', 'ADMIN', 'TRAINER'] },
      { label: 'Edit any course', roles: ['SUPERADMIN', 'ADMIN'] },
      { label: 'Approve / reject courses', roles: ['SUPERADMIN'] },
      { label: 'Delete / archive courses', roles: ['SUPERADMIN', 'ADMIN'] },
    ],
  },
  {
    group: 'Users',
    items: [
      { label: 'View all users', roles: ['SUPERADMIN', 'ADMIN'] },
      { label: 'Activate / deactivate users', roles: ['SUPERADMIN'] },
      { label: 'Manage user roles', roles: ['SUPERADMIN'] },
    ],
  },
  {
    group: 'Enrollments',
    items: [
      { label: 'Enroll in courses', roles: ['SUPERADMIN', 'STUDENT'] },
      { label: 'View enrollments', roles: ['SUPERADMIN', 'ADMIN', 'TRAINER'] },
      { label: 'Manage enrollments', roles: ['SUPERADMIN', 'ADMIN'] },
    ],
  },
  {
    group: 'Organization',
    items: [
      { label: 'Access admin panel', roles: ['SUPERADMIN', 'ADMIN'] },
      { label: 'Manage categories', roles: ['SUPERADMIN', 'ADMIN'] },
      { label: 'Review join requests', roles: ['SUPERADMIN', 'ADMIN'] },
      { label: 'Organization settings', roles: ['SUPERADMIN', 'ADMIN'] },
    ],
  },
];

export default function SuperadminPermissionsPage() {
  return (
    <DashboardShell allowedRoles={['SUPERADMIN']}>
      
        <PageHeader
          title="Permissions matrix"
          description="Role-based access control overview. Superadmin has unrestricted access to all platform features."
          breadcrumbs={[
            { label: 'Superadmin', href: '/superadmin/dashboard' },
            { label: 'Permissions' },
          ]}
        />

        <div className="dash-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-brand-green/10 bg-brand-canvas">
              <tr>
                <th className="sticky left-0 z-10 bg-brand-canvas px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                  Permission
                </th>
                {ROLES.map((r) => (
                  <th key={r} className="px-3 py-2.5 text-center">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[r]}`}>
                      {r}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((group) => (
                <Fragment key={group.group}>
                  <tr>
                    <td
                      colSpan={ROLES.length + 1}
                      className="border-b border-brand-green/8 bg-brand-mint-wash px-3 py-2"
                    >
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-green">
                        <Shield className="h-3 w-3" />
                        {group.group}
                      </span>
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.label} className="border-b border-brand-green/5 hover:bg-brand-canvas/80">
                      <td className="sticky left-0 z-10 bg-brand-white px-3 py-2.5 text-brand-ink">
                        {item.label}
                      </td>
                      {ROLES.map((role) => (
                        <td key={role} className="px-3 py-2.5 text-center">
                          {item.roles.includes(role) ? (
                            <div className="flex justify-center">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-brand-green/15 bg-brand-green/8">
                                <Check className="h-3 w-3 text-brand-green" strokeWidth={2.5} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="h-1 w-1 rounded-full bg-brand-muted-light" />
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-brand-muted">
          Superadmin bypasses all route guards and can access admin, trainer, and student dashboards.
        </p>
      
    </DashboardShell>
  );
}
