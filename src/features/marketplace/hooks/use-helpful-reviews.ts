"use client";

import { usePersistedToggle } from "./use-persisted-toggle";

export const HELPFUL_REVIEWS_KEY = "1fi.marketplace.helpful-reviews.v1";

export function useHelpfulReview(reviewId: string) {
  return usePersistedToggle(HELPFUL_REVIEWS_KEY, reviewId);
}
