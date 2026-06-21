export type UserRole =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'TRAINER'
  | 'STUDENT'
  | 'PARENT';

export type OrganizationType =
  | 'SCHOOL'
  | 'TRAINING_CENTER'
  | 'UNIVERSITY'
  | 'NGO'
  | 'COMPANY'
  | 'GOVERNMENT';

export type ResourceVisibility = 'PUBLIC_GLOBAL' | 'ORG_PRIVATE';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type?: OrganizationType | string;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface Membership {
  organizationId?: string;
  orgId?: string;
  role: UserRole;
  status?: string;
  joinedAt?: string;
  org: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    type?: string;
    isActive?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
  country?: string | null;
  preferredLang?: string;
  platformRole: UserRole;
  isVerified: boolean;
  isActive?: boolean;
  createdAt?: string;
  activeOrgId?: string | null;
  activeOrgRole?: UserRole | null;
  memberships?: Membership[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  isFree: boolean;
  order: number;
  isPublished?: boolean;
  videoUrl?: string | null;
  content?: string | null;
  duration?: number | null;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isPublished?: boolean;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  orgId?: string | null;
  visibility?: ResourceVisibility;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  level: string;
  type: string;
  price?: string | null;
  language?: string | null;
  status?: string;
  avgRating?: number | null;
  reviewCount?: number;
  totalDurationMinutes?: number;
  lessonCount?: number;
  updatedAt?: string;
  org?: { id?: string; name: string; slug: string; logoUrl?: string | null } | null;
  category?: { id?: string; name: string; slug: string } | null;
  modules?: CourseModule[];
  trainers?: Array<{
    isPrimary?: boolean;
    user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  }>;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
  activeOrgId?: string | null;
  activeOrgRole?: UserRole | null;
}
