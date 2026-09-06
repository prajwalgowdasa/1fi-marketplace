import { describe, expect, it } from "vitest";

import { PRODUCTS } from "../../data/products";
import { resolveVariant } from "../variants";

describe("resolveVariant", () => {
  it("resolves only an exact available SKU", () => {
    const product = PRODUCTS.find(({ id }) => id === "iphone-17")!;
    expect(resolveVariant(product, { storage: "128 GB", color: "Black" })?.id).toBe(
      "iphone-17-128-black",
    );
    expect(resolveVariant(product, { storage: "512 GB", color: "Green" })).toBeUndefined();
  });

  it("does not resolve an out-of-stock matching variant", () => {
    const product = PRODUCTS.find(({ id }) => id === "pixel-10")!;

    expect(resolveVariant(product, { storage: "256 GB", color: "Frost" })).toBeUndefined();
  });
});
