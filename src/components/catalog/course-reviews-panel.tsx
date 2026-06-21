'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StarRating, StarRatingInput } from '@/components/ui/star-rating';
import { UserNameWithBadges } from '@/components/user/user-badges';
import {
  getMyCourseReview,
  submitCourseReview,
  type CourseReview,
  type RatingDistribution,
} from '@/lib/api/catalog';
import { getErrorMessage } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';

type Props = {
  courseId: string;
  avgRating?: number | null;
  reviewCount?: number;
  ratingDistribution?: RatingDistribution[];
  reviews?: CourseReview[];
};

export function CourseReviewsPanel({
  courseId,
  avgRating,
  reviewCount = 0,
  ratingDistribution = [],
  reviews = [],
}: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: myReview } = useQuery({
    queryKey: ['course-review', courseId],
    queryFn: () => getMyCourseReview(courseId, token!),
    enabled: !!token && !!courseId,
  });

  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment ?? '');
    }
  }, [myReview]);

  const submitMutation = useMutation({
    mutationFn: () =>
      submitCourseReview(courseId, token!, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Review saved');
      queryClient.invalidateQueries({ queryKey: ['course-review', courseId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const totalReviews =
    reviewCount ||
    ratingDistribution.reduce((sum, row) => sum + row.count, 0) ||
    reviews.length;

  return (
    <section className="rounded-xl border border-brand-green/12 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-extrabold text-brand-ink">Student ratings</h2>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="text-center lg:text-left">
          <p className="font-display text-4xl font-extrabold text-brand-ink">
            {avgRating != null ? avgRating.toFixed(1) : '—'}
          </p>
          <StarRating value={avgRating} showValue={false} reviewCount={totalReviews} className="mt-2 justify-center lg:justify-start" />
          <p className="mt-2 text-xs text-muted-foreground">
            {totalReviews > 0 ? `${totalReviews} ratings` : 'No ratings yet'}
          </p>
        </div>

        <div className="space-y-2">
          {(ratingDistribution.length ? ratingDistribution : [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 }))).map(
            (row) => {
              const pct = totalReviews > 0 ? Math.round((row.count / totalReviews) * 100) : 0;
              return (
                <div key={row.star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 font-semibold text-brand-ink">{row.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-green/10">
                    <div
                      className="h-full rounded-full bg-brand-yellow transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{row.count}</span>
                </div>
              );
            },
          )}
        </div>
      </div>

      {token && (
        <div className="mt-6 rounded-xl border border-brand-green/10 bg-brand-mint-wash/40 p-4">
          <p className="text-sm font-bold text-brand-ink">
            {myReview ? 'Update your review' : 'Rate this course'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can review after completing the course.
          </p>
          <div className="mt-3">
            <StarRatingInput
              value={rating}
              onChange={setRating}
              disabled={submitMutation.isPending}
            />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you learned (optional)"
            rows={3}
            className="mt-3 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-green/40"
          />
          <Button
            type="button"
            size="sm"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            className="mt-3 rounded-full bg-brand-green hover:bg-brand-green-dark"
          >
            {submitMutation.isPending ? 'Saving…' : myReview ? 'Update review' : 'Submit review'}
          </Button>
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-6 space-y-4 border-t border-brand-green/8 pt-6">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-sm font-bold text-brand-green">
                {review.user?.avatarUrl ? (
                  <img src={review.user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  review.user?.firstName?.[0] ?? '?'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {review.user ? (
                    <UserNameWithBadges
                      firstName={review.user.firstName}
                      lastName={review.user.lastName}
                      displayRole="STUDENT"
                      isVerified={review.user.isVerified}
                      compact
                      nameClassName="text-sm"
                    />
                  ) : (
                    <span className="text-sm font-semibold">Learner</span>
                  )}
                  <StarRating value={review.rating} size="xs" />
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm leading-relaxed text-brand-ink/80">{review.comment}</p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
