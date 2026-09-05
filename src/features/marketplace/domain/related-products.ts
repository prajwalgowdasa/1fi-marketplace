import type { ProductCategory, ProductSummary } from "./types";

export function getRelatedProducts(
  products: readonly ProductSummary[],
  currentProductId: string,
  category: ProductCategory,
  limit = 3,
): ProductSummary[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];

  return products
    .filter((product) => product.id !== currentProductId && product.category === category)
    .slice(0, limit);
}
