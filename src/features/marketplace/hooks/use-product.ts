"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProduct } from "../api/products";
import { ApiClientError } from "@/shared/lib/api-client";
import { marketplaceKeys } from "@/shared/lib/query-keys";

export function useProduct(productId: string) {
  return useQuery({
    queryKey: marketplaceKeys.product(productId),
    queryFn: ({ signal }) => fetchProduct(productId, signal),
    retry: (count, error) => !(error instanceof ApiClientError && error.status === 404) && count < 1,
  });
}
