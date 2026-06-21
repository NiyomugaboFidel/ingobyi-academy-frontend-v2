import type { ElementType } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UsersRound,
  Settings,
  BarChart3,
  GraduationCap,
  Bell,
  UserCircle,
  Building2,
  KeyRound,
  ClipboardCheck,
  Tags,
  MessageSquare,
  Mail,
  Megaphone,
  Inbox,
  Award,
  LineChart,
  Shield,
} from 'lucide-react';
import type { UserRole } from '@/lib/api/types';

export type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: ElementType;
  badge?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const GROUPS: Record<UserRole, NavGroup[]> = {
  SUPERADMIN: [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { id: 'sa-dashboard', label: 'Dashboard', href: '/superadmin/dashboard', Icon: LayoutDashboard },
        { id: 'sa-workspaces', label: 'Workspaces', href: '/workspaces', Icon: Building2 },
        { id: 'sa-analytics', label: 'Analytics', href: '/superadmin/dashboard', Icon: LineChart },
      ],
    },
    {
      id: 'platform',
      label: 'Platform',
      items: [
        { id: 'sa-orgs', label: 'Organizations', href: '/superadmin/organizations', Icon: Building2 },
        { id: 'sa-users', label: 'Users', href: '/superadmin/users', Icon: Users },
        { id: 'sa-permissions', label: 'Permissions', href: '/superadmin/permissions', Icon: KeyRound },
        { id: 'sa-categories', label: 'Categories', href: '/superadmin/categories', Icon: Tags },
        { id: 'sa-join', label: 'Join requests', href: '/superadmin/join-requests', Icon: Inbox },
      ],
    },
    {
      id: 'learning',
      label: 'Learning',
      items: [
        { id: 'sa-courses', label: 'Courses', href: '/superadmin/courses', Icon: BookOpen },
        { id: 'sa-approvals', label: 'Approvals', href: '/superadmin/course-approvals', Icon: ClipboardCheck },
        { id: 'sa-cert-approvals', label: 'Certificates', href: '/admin/certificate-approvals', Icon: Award },
        { id: 'sa-catalog', label: 'Public catalog', href: '/catalog', Icon: GraduationCap },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'sa-messages', label: 'Messages', href: '/messages', Icon: Mail },
        { id: 'sa-announcements', label: 'Announcements', href: '/announcements', Icon: Megaphone },
        { id: 'sa-notifications', label: 'Notifications', href: '/notifications', Icon: Bell },
      ],
    },
    {
      id: 'cross-access',
      label: 'All dashboards',
      items: [
        { id: 'sa-admin-dash', label: 'Admin panel', href: '/admin/dashboard', Icon: BarChart3 },
        { id: 'sa-trainer-dash', label: 'Trainer panel', href: '/trainer/dashboard', Icon: GraduationCap },
        { id: 'sa-student-dash', label: 'Student panel', href: '/student/dashboard', Icon: BookOpen },
        { id: 'sa-parent-dash', label: 'Parent panel', href: '/parent/dashboard', Icon: Users },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        { id: 'sa-settings', label: 'Settings', href: '/settings', Icon: Settings },
        { id: 'sa-profile', label: 'Profile', href: '/profile', Icon: UserCircle },
      ],
    },
  ],
  ADMIN: [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { id: 'ad-dashboard', label: 'Dashboard', href: '/admin/dashboard', Icon: LayoutDashboard },
        { id: 'ad-workspaces', label: 'Workspaces', href: '/workspaces', Icon: Building2 },
        { id: 'ad-analytics', label: 'Analytics', href: '/admin/dashboard', Icon: BarChart3 },
      ],
    },
    {
      id: 'learning',
      label: 'Learning',
      items: [
        { id: 'ad-courses', label: 'Courses', href: '/admin/courses', Icon: BookOpen },
        { id: 'ad-categories', label: 'Categories', href: '/admin/categories', Icon: Tags },
        { id: 'ad-approvals', label: 'Approvals', href: '/admin/course-approvals', Icon: ClipboardCheck },
        { id: 'ad-cert-approvals', label: 'Certificates', href: '/admin/certificate-approvals', Icon: Award },
      ],
    },
    {
      id: 'people',
      label: 'People',
      items: [
        { id: 'ad-users', label: 'Users', href: '/admin/users', Icon: Users },
        { id: 'ad-moderation', label: 'Moderation', href: '/admin/moderation', Icon: Shield },
        { id: 'ad-join', label: 'Join requests', href: '/admin/join-requests', Icon: Inbox },
        { id: 'ad-orgs', label: 'Organization', href: '/admin/organizations', Icon: Building2 },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'ad-messages', label: 'Messages', href: '/admin/messages', Icon: Mail },
        { id: 'ad-announcements', label: 'Announcements', href: '/announcements', Icon: Megaphone },
        { id: 'ad-notifications', label: 'Notifications', href: '/notifications', Icon: Bell },
      ],
    },
    {
      id: 'system',
      label: 'System',
      items: [
        { id: 'ad-settings', label: 'Settings', href: '/settings', Icon: Settings },
      ],
    },
  ],
  TRAINER: [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { id: 'tr-dashboard', label: 'Dashboard', href: '/trainer/dashboard', Icon: LayoutDashboard },
        { id: 'tr-analytics', label: 'Analytics', href: '/trainer/dashboard', Icon: LineChart },
      ],
    },
    {
      id: 'learning',
      label: 'Learning',
      items: [
        { id: 'tr-courses', label: 'Courses', href: '/trainer/courses', Icon: BookOpen },
        { id: 'tr-grading', label: 'Grading', href: '/trainer/grading', Icon: ClipboardCheck },
        { id: 'tr-attendance', label: 'Attendance', href: '/trainer/attendance', Icon: Users },
        { id: 'tr-students', label: 'Students', href: '/trainer/students', Icon: GraduationCap },
        { id: 'tr-certificates', label: 'Certificates', href: '/student/certificates', Icon: Award },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'tr-feedback', label: 'Feedback', href: '/trainer/feedback', Icon: MessageSquare },
        { id: 'tr-community', label: 'Community', href: '/community', Icon: UsersRound },
        { id: 'tr-messages', label: 'Messages', href: '/trainer/messages', Icon: Mail },
        { id: 'tr-announcements', label: 'Announcements', href: '/announcements', Icon: Megaphone },
        { id: 'tr-notifications', label: 'Notifications', href: '/notifications', Icon: Bell },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { id: 'tr-profile', label: 'Profile', href: '/profile', Icon: UserCircle },
        { id: 'tr-settings', label: 'Settings', href: '/settings', Icon: Settings },
      ],
    },
  ],
  STUDENT: [
    {
      id: 'workspace',
      label: 'Learning',
      items: [
        { id: 'st-dashboard', label: 'Home', href: '/student/dashboard', Icon: LayoutDashboard },
        { id: 'st-workspaces', label: 'Workspaces', href: '/workspaces', Icon: Building2 },
        { id: 'st-enrolled', label: 'My learning', href: '/student/enrolled', Icon: GraduationCap },
        { id: 'st-wishlist', label: 'Saved', href: '/student/wishlist', Icon: Award },
        { id: 'st-progress', label: 'Progress', href: '/student/progress', Icon: BarChart3 },
        { id: 'st-catalog', label: 'Explore', href: '/catalog', Icon: BookOpen },
      ],
    },
    {
      id: 'social',
      label: 'Community',
      items: [
        { id: 'st-community', label: 'Community', href: '/community', Icon: UsersRound },
        { id: 'st-certificates', label: 'Certificates', href: '/student/certificates', Icon: Award },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'st-messages', label: 'Messages', href: '/student/messages', Icon: Mail },
        { id: 'st-announcements', label: 'Announcements', href: '/announcements', Icon: Megaphone },
        { id: 'st-notifications', label: 'Notifications', href: '/notifications', Icon: Bell },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { id: 'st-profile', label: 'Profile', href: '/profile', Icon: UserCircle },
        { id: 'st-settings', label: 'Settings', href: '/settings', Icon: Settings },
      ],
    },
  ],
  PARENT: [
    {
      id: 'workspace',
      label: 'Workspace',
      items: [
        { id: 'pa-dashboard', label: 'Dashboard', href: '/parent/dashboard', Icon: LayoutDashboard },
        { id: 'pa-workspaces', label: 'Workspaces', href: '/workspaces', Icon: Building2 },
      ],
    },
    {
      id: 'family',
      label: 'Family',
      items: [
        { id: 'pa-children', label: 'Children', href: '/parent/children', Icon: Users },
        { id: 'pa-community', label: 'Community', href: '/community', Icon: UsersRound },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      items: [
        { id: 'pa-messages', label: 'Messages', href: '/parent/messages', Icon: Mail },
        { id: 'pa-announcements', label: 'Announcements', href: '/announcements', Icon: Megaphone },
        { id: 'pa-notifications', label: 'Notifications', href: '/notifications', Icon: Bell },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { id: 'pa-profile', label: 'Profile', href: '/profile', Icon: UserCircle },
        { id: 'pa-settings', label: 'Settings', href: '/settings', Icon: Settings },
      ],
    },
  ],
};

export function getNavGroups(role: UserRole): NavGroup[] {
  return GROUPS[role] ?? GROUPS.STUDENT;
}

export function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Home', href: '/' }];

  const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/' }];
  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }
  return crumbs;
}
