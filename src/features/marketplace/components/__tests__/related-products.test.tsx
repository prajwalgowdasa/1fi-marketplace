import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PRODUCTS, toProductSummary } from "../../data/products";

import { RelatedProducts } from "../related-products";

const relatedProducts = PRODUCTS.filter(({ id }) =>
  ["pixel-10", "galaxy-s25-ultra", "oneplus-15"].includes(id),
).map(toProductSummary);

afterEach(cleanup);

describe("RelatedProducts", () => {
  it("links each recommendation with its starting price and longest-tenure EMI", () => {
    render(<RelatedProducts products={relatedProducts} />);

    expect(screen.getByRole("heading", { name: "You may also like" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Google Pixel 10" })).toHaveAttribute(
      "href",
      "/shop/marketplace/pixel-10",
    );
    expect(screen.getByRole("link", { name: "Samsung Galaxy S25 Ultra" })).toHaveAttribute(
      "href",
      "/shop/marketplace/galaxy-s25-ultra",
    );
    expect(screen.getByRole("link", { name: "OnePlus OnePlus 15" })).toHaveAttribute(
      "href",
      "/shop/marketplace/oneplus-15",
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("₹69,999")).toBeVisible();
    expect(screen.getByText("From ₹3,888.83/month")).toBeVisible();
    expect(screen.getByText("₹1,19,999")).toBeVisible();
    expect(screen.getByText("From ₹4,999.95/month")).toBeVisible();
    expect(screen.getByText("₹64,999")).toBeVisible();
    expect(screen.getByText("From ₹3,611.05/month")).toBeVisible();
  });

  it("renders no section when there are no recommendations", () => {
    const { container } = render(<RelatedProducts products={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("heading", { name: "You may also like" })).not.toBeInTheDocument();
  });

  it("uses the local placeholder when a recommendation image fails", () => {
    render(<RelatedProducts products={[relatedProducts[0]!]} />);

    const image = screen.getByRole("img", { name: relatedProducts[0]!.images[0]!.alt });
    fireEvent.error(image);

    expect(image.getAttribute("src")).toContain("product-placeholder.svg");
  });
});
