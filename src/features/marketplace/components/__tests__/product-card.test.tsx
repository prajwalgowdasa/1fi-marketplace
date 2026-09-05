import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { toProductSummary, PRODUCTS } from "@/features/marketplace/data/products";

import { ProductCard } from "../product-card";

afterEach(cleanup);

describe("ProductCard", () => {
  it("uses a full-card link and local product image", () => {
    const product = toProductSummary(PRODUCTS.find(({ id }) => id === "iphone-17")!);
    render(<ProductCard product={product} />);

    const link = screen.getByRole("link", { name: /Apple.*iPhone 17/i });
    expect(link).toHaveAttribute("href", "/shop/marketplace/iphone-17");
    expect(screen.getByRole("img", { name: product.images[0]!.alt }).getAttribute("src")).toContain("iphone-17.webp");
  });

  it("replaces a failed product image with the local placeholder", () => {
    const product = toProductSummary(PRODUCTS.find(({ id }) => id === "iphone-17")!);
    render(<ProductCard product={product} />);

    fireEvent.error(screen.getByRole("img", { name: product.images[0]!.alt }));
    expect(screen.getByRole("img", { name: product.images[0]!.alt }).getAttribute("src")).toContain("product-placeholder.svg");
  });
});
