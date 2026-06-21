import { apiRequest } from './client';
import { clampLimit, clampPage } from './pagination';
import type { Course, Paginated } from './types';

export type CatalogSearchParams = {
  q?: string;
  category?: string;
  categories?: string;
  level?: string;
  levels?: string;
  type?: string;
  org?: string;
  price?: 'all' | 'free' | 'paid';
  sort?: 'relevance' | 'popular' | 'newest' | 'title';
  language?: string;
  duration?: string;
  ratingMin?: string | number;
  page?: string | number;
  limit?: string | number;
};

export async function searchCatalog(params: CatalogSearchParams = {}) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 'all') continue;
    search.set(key, String(value));
  }

  search.set('page', String(clampPage(params.page)));
  search.set('limit', String(clampLimit(params.limit, 20)));

  const qs = search.toString();
  return apiRequest<Paginated<Course>>(qs ? `/catalog?${qs}` : '/catalog');
}

export type CourseReview = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    id?: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    platformRole?: string;
    isVerified?: boolean;
  };
};

export type RatingDistribution = {
  star: number;
  count: number;
};

export type CatalogCourseDetail = Course & {
  avgRating?: number | null;
  reviewCount?: number;
  ratingDistribution?: RatingDistribution[];
  reviews?: CourseReview[];
  trainers?: Array<{
    isPrimary: boolean;
    user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  }>;
};

export async function getCourseBySlug(slug: string) {
  return apiRequest<CatalogCourseDetail>(`/catalog/${slug}`);
}

/** Reviews from published catalog courses (trainer feedback view). */
export async function listCourseReviews(slugs: string[]) {
  const reviews: Array<CourseReview & { courseTitle: string; courseSlug: string }> = [];
  await Promise.all(
    slugs.map(async (slug) => {
      try {
        const course = await getCourseBySlug(slug);
        for (const review of course.reviews ?? []) {
          reviews.push({
            ...review,
            courseTitle: course.title,
            courseSlug: slug,
          });
        }
      } catch {
        /* skip unpublished or missing */
      }
    }),
  );
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
};

export async function getCategories() {
  return apiRequest<CategoryNode[]>('/catalog/categories');
}

export async function getFeatured() {
  return apiRequest<Course[]>('/catalog/featured');
}

export type SearchSuggestionCourse = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  shortDescription?: string | null;
  level?: string;
  price?: string | null;
  category?: { name: string; slug: string } | null;
  org?: { name: string; slug: string } | null;
  enrollmentCount?: number;
};

export type SearchSuggestionCategory = {
  name: string;
  slug: string;
  courseCount?: number;
};

export type CatalogSuggestions = {
  query: string;
  courses: SearchSuggestionCourse[];
  categories: SearchSuggestionCategory[];
  topics: string[];
  popularTerms: string[];
};

export async function getSearchSuggestions(q?: string) {
  const qs = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
  return apiRequest<CatalogSuggestions>(`/catalog/suggestions${qs}`);
}

export function getMyCourseReview(courseId: string, token: string) {
  return apiRequest<CourseReview | null>(`/reviews/courses/${courseId}/mine`, { token });
}

export function submitCourseReview(
  courseId: string,
  token: string,
  body: { rating: number; comment?: string },
) {
  return apiRequest<CourseReview>(`/reviews/courses/${courseId}`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}
