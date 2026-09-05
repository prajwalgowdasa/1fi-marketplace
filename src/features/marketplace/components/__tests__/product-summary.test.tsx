import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PRODUCTS } from "@/features/marketplace/data/products";
import { ProductSummary } from "../product-summary";

afterEach(cleanup);

describe("ProductSummary", () => {
  it("announces stock only after a variant is selected", () => {
    const product = PRODUCTS.find(({ id }) => id === "iphone-17")!;
    const variant = product.variants.find(({ id }) => id === "iphone-17-128-black")!;
    const { rerender } = render(<ProductSummary product={product} variant={undefined} />);
    expect(screen.queryByText("In stock")).not.toBeInTheDocument();
    rerender(<ProductSummary product={product} variant={variant} />);
    expect(screen.getByText("In stock")).toBeVisible();
  });

  it("links its review summary to the product reviews", () => {
    const product = PRODUCTS.find(({ id }) => id === "iphone-17")!;

    render(<ProductSummary product={product} variant={undefined} />);

    expect(screen.getByRole("link", { name: "4.6 · 128 reviews" })).toHaveAttribute("href", "#product-reviews");
  });
});
