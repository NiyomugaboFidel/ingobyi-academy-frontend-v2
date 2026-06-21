import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { ExploreNav } from '@/components/layout/explore-nav';
import { CourseCard } from '@/components/course-card';
import { searchCatalog } from '@/lib/api/catalog';
import { LandingFooter } from '@/components/landing/landing-footer';
import type { Course } from '@/lib/api/types';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}) {
  const params = await searchParams;
  let data: Course[] = [];
  let total = 0;
  let loadError = false;
  try {
    const result = await searchCatalog({
      ...(params.q ? { q: params.q } : {}),
      ...(params.category ? { category: params.category } : {}),
      page: params.page || '1',
      limit: '24',
    });
    data = result.data;
    total = result.meta.total;
  } catch {
    loadError = true;
  }

  return (
    <div className="min-h-screen bg-white font-poppins">
      <ExploreNav />

      {/* Page header */}
      <div className="border-b border-brand-green/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="inline-flex rounded-full bg-brand-green/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">
            Catalog
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink md:text-4xl">
            Course catalog
          </h1>
          <p className="mt-2 text-base leading-relaxed text-brand-ink/70">
            {loadError
              ? 'We could not load courses right now.'
              : `${total} published course${total !== 1 ? 's' : ''}`}
          </p>
          {!loadError && total === 0 ? (
            <p className="mt-1 text-sm text-brand-ink/55">
              Try <Link href="/search" className="font-semibold text-brand-green hover:underline">advanced search</Link> for filters and categories.
            </p>
          ) : null}
        </div>
      </div>

      {/* Course grid */}
      <section className="bg-gradient-to-b from-brand-mint-wash to-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50/80 px-6 py-16 text-center">
              <p className="text-base font-semibold text-red-800">Could not load the catalog</p>
              <p className="mt-1 max-w-md text-sm text-red-700/80">
                Check your connection and try again, or use search to browse courses.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Link>
                <Link
                  href="/search"
                  className="inline-flex rounded-full border border-brand-green/20 px-5 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green/5"
                >
                  Go to search
                </Link>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <p className="text-base font-semibold text-brand-green">No courses found</p>
              <p className="mt-1 text-sm text-brand-ink/55">
                Try a different search or browse all categories.
              </p>
              <Link
                href="/search"
                className="mt-4 inline-flex rounded-full bg-brand-green px-5 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark"
              >
                Search courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
