"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ProductReview, ProductReviewSummary, Rating } from "../domain/types";
import { useHelpfulReview } from "../hooks/use-helpful-reviews";

import { RatingStars } from "./rating-stars";
import { ReviewCard } from "./review-card";

type ProductReviewsProps = {
  reviews: ProductReviewSummary;
};

type PersistedReviewCardProps = {
  review: ProductReview;
  onPersistenceUnavailable: () => void;
};

function PersistedReviewCard({ review, onPersistenceUnavailable }: PersistedReviewCardProps) {
  const { active, persistenceAvailable, toggle } = useHelpfulReview(review.id);
  const hasVoted = useRef(false);

  useEffect(() => {
    if (hasVoted.current && !persistenceAvailable) onPersistenceUnavailable();
  }, [onPersistenceUnavailable, persistenceAvailable]);

  function handleToggleHelpful() {
    hasVoted.current = true;
    toggle();
  }

  return <ReviewCard helpful={active} onToggleHelpful={handleToggleHelpful} review={review} />;
}

export function ProductReviews({ reviews }: ProductReviewsProps) {
  const [persistenceUnavailable, setPersistenceUnavailable] = useState(false);
  const showPersistenceUnavailable = useCallback(() => setPersistenceUnavailable(true), []);
  const ratings: readonly Rating[] = [5, 4, 3, 2, 1];

  return (
    <section aria-labelledby="product-reviews" className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--ink-900)]" id="product-reviews">Customer reviews</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div>
          <p className="text-3xl font-semibold text-[var(--ink-900)]">{reviews.average.toFixed(1)} out of 5</p>
          <RatingStars rating={reviews.average} />
          <p className="mt-1 text-sm text-[var(--ink-500)]">{reviews.totalCount} verified ratings · {reviews.items.length} reviews shown</p>
        </div>
        <ul className="space-y-2">
          {ratings.map((rating) => {
            const count = reviews.distribution[String(rating) as keyof typeof reviews.distribution];
            const percentage = reviews.totalCount === 0 ? 0 : (count / reviews.totalCount) * 100;

            return (
              <li className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-sm" key={rating}>
                <span className="text-[var(--ink-500)]">{rating} stars</span>
                <div
                  aria-label={`${rating} star ratings`}
                  aria-valuemax={reviews.totalCount}
                  aria-valuemin={0}
                  aria-valuenow={count}
                  className="h-2 overflow-hidden rounded-full bg-[var(--line)]"
                  role="progressbar"
                >
                  <span className="block h-full rounded-full bg-[var(--brand-500)]" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-[var(--ink-500)]">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {persistenceUnavailable ? <p className="mt-4 text-sm text-[var(--ink-500)]" role="status">Your vote is active for this visit but could not be saved.</p> : null}
      <div className="mt-6 space-y-4">
        {reviews.items.map((review) => (
          <PersistedReviewCard key={review.id} onPersistenceUnavailable={showPersistenceUnavailable} review={review} />
        ))}
      </div>
    </section>
  );
}
