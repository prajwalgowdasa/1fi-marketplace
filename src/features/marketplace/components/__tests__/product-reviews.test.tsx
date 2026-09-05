import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS } from "../../data/products";
import { HELPFUL_REVIEWS_KEY } from "../../hooks/use-helpful-reviews";
import { ProductReviews } from "../product-reviews";

const reviews = PRODUCTS.find((product) => product.id === "iphone-17")!.reviews;

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("ProductReviews", () => {
  it("shows the curated iPhone review summary and verified reviews", () => {
    render(<ProductReviews reviews={reviews} />);

    expect(screen.getByRole("heading", { name: "Customer reviews" })).toHaveAttribute("id", "product-reviews");
    expect(screen.getByText("4.6 out of 5")).toBeVisible();
    expect(screen.getByText("128 verified ratings · 3 reviews shown")).toBeVisible();
    expect(screen.getAllByText("Verified purchase")).toHaveLength(3);
    expect(screen.getByText("5 stars")).toBeVisible();
  });

  it("updates and persists a review helpful vote", async () => {
    const user = userEvent.setup();
    render(<ProductReviews reviews={reviews} />);

    const helpfulButton = screen.getByRole("button", { name: "Helpful (24)" });
    await user.click(helpfulButton);

    expect(helpfulButton).toHaveAttribute("aria-pressed", "true");
    expect(helpfulButton).toHaveTextContent("Helpful (25)");
    expect(JSON.parse(localStorage.getItem(HELPFUL_REVIEWS_KEY)!)).toEqual(["iphone-17-review-1"]);

    await user.click(helpfulButton);

    expect(helpfulButton).toHaveAttribute("aria-pressed", "false");
    expect(helpfulButton).toHaveTextContent("Helpful (24)");
  });

  it("announces when a helpful vote cannot be saved", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage quota exceeded");
    });
    const user = userEvent.setup();
    render(<ProductReviews reviews={reviews} />);

    await user.click(screen.getByRole("button", { name: "Helpful (24)" }));

    expect(screen.getByRole("status")).toHaveTextContent("Your vote is active for this visit but could not be saved.");
  });
});
