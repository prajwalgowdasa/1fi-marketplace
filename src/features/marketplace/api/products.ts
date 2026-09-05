import type { Product, ProductCategory, ProductSummary } from "../domain/types";
import { requestJson } from "@/shared/lib/api-client";

export type ProductsResponse = {
  data: ProductSummary[];
  meta: {
    total: number;
    query: string;
    category: ProductCategory | "all";
  };
};

export type ProductRequestFilters = {
  query: string;
  category: ProductCategory | "all";
};

export type ProductDetailResponse = {
  data: Product;
  related: ProductSummary[];
};

export function fetchProducts(filters: ProductRequestFilters, signal?: AbortSignal): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  const queryValue = filters.query.trim().slice(0, 80);
  if (queryValue) params.set("q", queryValue);
  if (filters.category !== "all") params.set("category", filters.category);
  const query = params.toString();
  return requestJson<ProductsResponse>(
    `/api/products${query ? `?${query}` : ""}`,
    signal ? { signal } : {},
  );
}

export function fetchProduct(productId: string, signal?: AbortSignal): Promise<ProductDetailResponse> {
  return requestJson<ProductDetailResponse>(
    `/api/products/${encodeURIComponent(productId)}`,
    signal ? { signal } : {},
  );
}
