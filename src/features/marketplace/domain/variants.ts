import type { Product, ProductVariant } from "./types";

export function resolveVariant(
  product: Product,
  selection: Readonly<Record<string, string>>,
): ProductVariant | undefined {
  return product.variants.find(
    (variant) =>
      variant.stockStatus === "in_stock" &&
      Object.entries(selection).every(([attribute, value]) => variant.attributes[attribute] === value),
  );
}
