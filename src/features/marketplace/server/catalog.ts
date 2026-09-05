import "server-only";

import { PRODUCTS, toProductSummary } from "../data/products";
import { filterProducts, type ProductFilters } from "../domain/filter-products";
import { getRelatedProducts } from "../domain/related-products";
import type { Product, ProductSummary } from "../domain/types";

export function listProducts(filters: ProductFilters): ProductSummary[] {
  return filterProducts(PRODUCTS, filters).map(toProductSummary);
}

export function getProduct(productId: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === productId);
}

export function listRelatedProducts(productId: string, limit?: number): ProductSummary[] {
  const product = getProduct(productId);
  if (!product) return [];

  return getRelatedProducts(PRODUCTS.map(toProductSummary), productId, product.category, limit);
}
