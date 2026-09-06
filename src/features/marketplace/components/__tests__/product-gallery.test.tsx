import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProductGallery } from "../product-gallery";

afterEach(cleanup);

describe("ProductGallery", () => {
  it("promotes the image mapped to a newly selected color", () => {
    const images = [
      { src: "/images/products/iphone-17/black.webp", alt: "Black iPhone", color: "Black" },
      { src: "/images/products/iphone-17/blue.webp", alt: "Blue iPhone", color: "Blue" },
    ];
    const renderGallery = (selectedColor?: string) => (
      <ProductGallery
        key={selectedColor ?? "unselected"}
        images={images}
        selectedColor={selectedColor}
      />
    );
    const { rerender } = render(renderGallery());

    rerender(renderGallery("Blue"));

    expect(screen.getByRole("img", { name: "Blue iPhone" })).toHaveAttribute(
      "src",
      expect.stringContaining("blue.webp"),
    );
    expect(screen.getByRole("button", { name: "View Blue iPhone" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches the featured image when a thumbnail is selected", () => {
    render(<ProductGallery images={[
      { src: "/images/products/iphone-17/front-and-back.webp", alt: "iPhone front and back" },
      { src: "/images/products/iphone-17/color-lineup.webp", alt: "iPhone color lineup" },
    ]} />);

    fireEvent.click(screen.getByRole("button", { name: "View iPhone color lineup" }));

    expect(screen.getByRole("img", { name: "iPhone color lineup" })).toHaveAttribute("src", expect.stringContaining("color-lineup.webp"));
  });

  it("uses the local fallback when a thumbnail image fails", () => {
    render(<ProductGallery images={[
      { src: "/images/products/iphone-17/front-and-back.webp", alt: "iPhone front" },
      { src: "/images/products/pixel-10/indigo-in-use.webp", alt: "Pixel front" },
    ]} />);

    fireEvent.error(screen.getByRole("button", { name: "View Pixel front" }).querySelector("img")!);

    expect(screen.getByRole("button", { name: "View Pixel front" }).querySelector("img")).toHaveAttribute("src", expect.stringContaining("product-placeholder.svg"));
  });
});
