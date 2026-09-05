import type { Product, ProductCategory } from "./types";

export type ProductFilters = {
  query: string;
  category: ProductCategory | "all";
};

export function filterProducts(products: readonly Product[], filters: ProductFilters): Product[] {
  const normalizedQuery = filters.query.trim().toLocaleLowerCase("en-IN");

  return products.filter((product) => {
    const matchesCategory = filters.category === "all" || product.category === filters.category;
    const matchesQuery =
      normalizedQuery === "" ||
      `${product.brand} ${product.name}`.toLocaleLowerCase("en-IN").includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });
}
