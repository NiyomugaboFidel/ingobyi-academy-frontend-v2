'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import { LearningShell } from '@/components/layout/learning-shell';
import { EmptyState } from '@/components/dashboard/empty-state';
import { listWishlist } from '@/lib/api/wishlist';
import { learningKeys } from '@/lib/query/learning';
import { useAuthStore } from '@/lib/auth/store';

export default function StudentWishlistPage() {
  const token = useAuthStore((s) => s.accessToken)!;

  const { data: items = [], isLoading } = useQuery({
    queryKey: learningKeys.myWishlist(),
    queryFn: () => listWishlist(token),
    enabled: !!token,
    refetchOnWindowFocus: true,
  });

  return (
    <LearningShell allowedRoles={['STUDENT', 'SUPERADMIN']}>
      <h1 className="mb-6 text-2xl font-extrabold text-foreground">Saved courses</h1>
      {!isLoading && items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved courses"
          description="Bookmark courses while browsing to find them here later."
          primaryAction={{ label: 'Browse catalog', href: '/catalog' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/catalog/${item.course.slug}`}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-brand-green/25"
            >
              <p className="font-semibold text-foreground">{item.course.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.course.price ? `RWF ${Number(item.course.price).toLocaleString()}` : 'Free'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </LearningShell>
  );
}
