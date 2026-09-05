"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchProducts } from "../api/products";
import type { CatalogFilterState } from "./use-catalog-filters";
import { marketplaceKeys } from "@/shared/lib/query-keys";

export function useProducts(filters: CatalogFilterState) {
  return useQuery({
    queryKey: marketplaceKeys.products(filters),
    queryFn: ({ signal }) => fetchProducts(filters, signal),
  });
}
