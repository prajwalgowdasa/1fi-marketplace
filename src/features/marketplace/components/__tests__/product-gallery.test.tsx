import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProductGallery } from "../product-gallery";

afterEach(cleanup);

describe("ProductGallery", () => {
  it("uses the local fallback when a thumbnail image fails", () => {
    render(<ProductGallery images={[
      { src: "/images/products/iphone-17.webp", alt: "iPhone front" },
      { src: "/images/products/pixel-10.webp", alt: "Pixel front" },
    ]} />);

    fireEvent.error(screen.getByRole("button", { name: "View Pixel front" }).querySelector("img")!);

    expect(screen.getByRole("button", { name: "View Pixel front" }).querySelector("img")).toHaveAttribute("src", expect.stringContaining("product-placeholder.svg"));
  });
});
