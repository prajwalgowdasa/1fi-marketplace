import { describe, expect, it } from "vitest";

import { PRODUCTS, toProductSummary } from "../../data/products";
import {
  catalogQuerySchema,
  confirmationQuerySchema,
  orderRequestSchema,
  productSchema,
} from "../schemas";

describe("marketplace schemas", () => {
  it("rejects an unsupported category and overlong search query", () => {
    expect(catalogQuerySchema.safeParse({ category: "cars", q: "" }).success).toBe(false);
    expect(catalogQuerySchema.safeParse({ category: "all", q: "x".repeat(81) }).success).toBe(false);
  });

  it("applies catalog defaults and rejects unknown order request properties", () => {
    expect(catalogQuerySchema.parse({})).toEqual({ q: "", category: "all" });
    expect(
      orderRequestSchema.safeParse({
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        tenureMonths: 12,
        pricePaise: 7_990_000,
      }).success,
    ).toBe(false);
  });

  it("accepts the fixed-shape confirmation query", () => {
    expect(
      confirmationQuerySchema.parse({
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        tenureMonths: 12,
        referenceId: "1FI-ABCDEF12",
      }),
    ).toMatchObject({ referenceId: "1FI-ABCDEF12" });
  });

  it("projects its starting EMI from the lowest available price and longest tenure", () => {
    const pixel = PRODUCTS.find(({ id }) => id === "pixel-10")!;

    expect(toProductSummary(pixel)).toMatchObject({
      startingPricePaise: 6_999_900,
      startingEmi: { tenureMonths: 18, totalPayablePaise: 6_999_900 },
    });
  });

  it("accepts the product fixtures", () => {
    expect(PRODUCTS.every((product) => productSchema.safeParse(product).success)).toBe(true);
  });

  it("keeps an absent optional original price absent after parsing", () => {
    const parsedProduct = productSchema.parse(PRODUCTS[0]!);

    expect("originalPricePaise" in parsedProduct).toBe(false);
  });

  it("rejects review item ratings outside the supported range", () => {
    const invalidRating = structuredClone(PRODUCTS[0]!);
    invalidRating.reviews.items[0]!.rating = 6 as 5;

    expect(productSchema.safeParse(invalidRating).success).toBe(false);
  });

  it("rejects review dates that are not real ISO calendar dates", () => {
    const invalidDate = structuredClone(PRODUCTS[0]!);
    invalidDate.reviews.items[0]!.date = "2026-02-30";

    expect(productSchema.safeParse(invalidDate).success).toBe(false);
  });

  it("keeps fixture averages equal to the rounded complete rating distribution", () => {
    for (const product of PRODUCTS) {
      const { distribution, totalCount } = product.reviews;
      const weightedTotal = Object.entries(distribution).reduce(
        (sum, [rating, count]) => sum + Number(rating) * count,
        0,
      );

      expect(Object.values(distribution).reduce((sum, count) => sum + count, 0)).toBe(totalCount);
      expect(Number((weightedTotal / totalCount).toFixed(1))).toBe(product.reviews.average);
    }
  });

  it("rejects an average that disagrees with a complete rating distribution", () => {
    const inconsistentAverage = structuredClone(PRODUCTS[0]!);
    inconsistentAverage.reviews.average = 4.5;

    expect(productSchema.safeParse(inconsistentAverage).success).toBe(false);
  });

  it("rejects review distributions that exceed the total review count", () => {
    const invalidDistribution = structuredClone(PRODUCTS[0]!);
    invalidDistribution.reviews.totalCount = 2;

    expect(productSchema.safeParse(invalidDistribution).success).toBe(false);
  });
});
