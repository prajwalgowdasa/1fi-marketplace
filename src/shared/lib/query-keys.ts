import type { CatalogFilterState } from "@/features/marketplace/hooks/use-catalog-filters";

export const marketplaceKeys = {
  all: ["marketplace"] as const,
  products: (filters: CatalogFilterState) => ["marketplace", "products", filters] as const,
  product: (id: string) => ["marketplace", "product", id] as const,
};
