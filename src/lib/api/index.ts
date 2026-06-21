/** Central API exports — import from `@/lib/api` for consistency. */
export { apiRequest, apiUrl, ApiError, API_BASE } from './client';
export * from './types';
export * from './pagination';
export * from './errors';
export * from './session';
export * from './auth';
export * from './users';
export * from './organizations';
export * from './courses';
export * from './catalog';
export * from './enrollments';
export * from './lessons';
export * from './progress';
export * from './assignments';
export * from './quizzes';
export * from './analytics';
export {
  activateUser,
  deactivateUser,
  getPlatformStatsSafe,
  getSuperadminStats,
  listAllJoinRequests,
  listAllSuperadminOrgs,
  listAllSuperadminUsers,
  listCategories,
  listOrgJoinRequests,
  listPendingCourses,
  listSuperadminOrgs,
  listSuperadminUsers,
  reviewJoinRequest,
  approveCourse as superadminApproveCourse,
  rejectCourse as superadminRejectCourse,
} from './superadmin';
export type {
  CourseCategory,
  EnrichedJoinRequest,
  OrgJoinRequest,
  PendingCourse,
  SuperadminOrg,
  SuperadminUser,
} from './superadmin';
export * from './community';
export * from './reports';
export * from './messaging';
export * from './announcements';
export * from './notifications';
export * from './wishlist';
export * from './certificates';
export * from './achievements';
export * from './audit';
export * from './parent';
export * from './physical';
export * from './uploads';
