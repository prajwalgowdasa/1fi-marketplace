import { describe, expect, it } from "vitest";

import { PRODUCTS } from "../../data/products";
import { filterProducts } from "../filter-products";

describe("filterProducts", () => {
  it("combines normalized brand/name search with category filtering", () => {
    expect(filterProducts(PRODUCTS, { query: " apple ", category: "laptops" })).toHaveLength(2);
    expect(filterProducts(PRODUCTS, { query: "pixel", category: "smartphones" })[0]?.id).toBe(
      "pixel-10",
    );
  });

  it("does not mutate the source collection", () => {
    const originalIds = PRODUCTS.map(({ id }) => id);

    filterProducts(PRODUCTS, { query: "", category: "all" });

    expect(PRODUCTS.map(({ id }) => id)).toEqual(originalIds);
  });
});
