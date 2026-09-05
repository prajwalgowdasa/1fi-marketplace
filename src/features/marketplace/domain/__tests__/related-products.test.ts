import { describe, expect, it } from "vitest";

import { PRODUCTS, toProductSummary } from "../../data/products";
import { getRelatedProducts } from "../related-products";

describe("getRelatedProducts", () => {
  it("returns the first same-category products while excluding the current product", () => {
    const summaries = PRODUCTS.map(toProductSummary);
    const related = getRelatedProducts(summaries, "iphone-17", "smartphones", 3);

    expect(related).toHaveLength(3);
    expect(related.every(({ category }) => category === "smartphones")).toBe(true);
    expect(related.some(({ id }) => id === "iphone-17")).toBe(false);
    expect(related.map(({ id }) => id)).toEqual(["pixel-10", "galaxy-s25-ultra", "oneplus-15"]);
  });
});
