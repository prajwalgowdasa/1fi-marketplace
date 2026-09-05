import type { ProductReview } from "../domain/types";

import { RatingStars } from "./rating-stars";

type ReviewCardProps = {
  review: ProductReview;
  helpful: boolean;
  onToggleHelpful: () => void;
};

function formatReviewDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function ReviewCard({ review, helpful, onToggleHelpful }: ReviewCardProps) {
  const helpfulCount = review.helpfulCount + (helpful ? 1 : 0);

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-medium text-[var(--ink-900)]">{review.reviewer}</span>
        <span className="text-sm font-medium text-[var(--brand-700)]">Verified purchase (demo fixture)</span>
        <time className="text-sm text-[var(--ink-500)]" dateTime={review.date}>{formatReviewDate(review.date)}</time>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <RatingStars rating={review.rating} />
        <span className="text-sm text-[var(--ink-500)]">{review.rating} out of 5</span>
      </div>
      <h3 className="mt-3 font-semibold text-[var(--ink-900)]">{review.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">{review.body}</p>
      <button
        aria-pressed={helpful}
        className="mt-4 min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm font-medium text-[var(--ink-900)] transition hover:bg-[var(--brand-050)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-500)]"
        onClick={onToggleHelpful}
        type="button"
      >
        Helpful ({helpfulCount})
      </button>
    </article>
  );
}
