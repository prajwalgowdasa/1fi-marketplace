"use client";

import { usePersistedToggle } from "./use-persisted-toggle";

export const SAVED_PRODUCTS_KEY = "1fi.marketplace.saved-products.v1";

export function useSavedProduct(productId: string) {
  return usePersistedToggle(SAVED_PRODUCTS_KEY, productId);
}
