import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS, toProductSummary } from "../../data/products";
import { ApiClientError } from "@/shared/lib/api-client";
import { DetailHeader, ProductDetailContent, ProductExperience } from "../product-experience";
import { useProduct } from "../../hooks/use-product";

const navigationMock = vi.hoisted(() => ({ notFound: vi.fn(() => { throw new Error("not found"); }), push: vi.fn() }));

vi.mock("../../hooks/use-product", () => ({ useProduct: vi.fn() }));
vi.mock("../../hooks/use-create-order", () => ({ useCreateOrder: () => ({ mutateAsync: vi.fn() }) }));
vi.mock("next/navigation", () => ({ ...navigationMock, useRouter: () => ({ push: navigationMock.push }) }));

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;
const relatedFixtures = ["iphone-17", "pixel-10", "galaxy-s25-ultra", "oneplus-15"].map(
  (productId) => toProductSummary(PRODUCTS.find(({ id }) => id === productId)!),
);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProductExperience", () => {
  it("uses the compact 1Fi payment header to return to Marketplace", () => {
    render(<DetailHeader />);

    expect(screen.getByRole("link", { name: "Back to Marketplace" })).toHaveAttribute(
      "href",
      "/shop?tab=marketplace",
    );
    expect(screen.getByText("Pay using 1Fi")).toBeVisible();
    expect(screen.queryByText("1Fi Shop")).not.toBeInTheDocument();
  });

  it("keeps the action disabled until attributes resolve to an in-stock SKU", async () => {
    const user = userEvent.setup();
    render(<ProductExperience product={iphoneFixture} />);
    const action = screen.getByRole("button", { name: "View EMI plans" });

    expect(action).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "128 GB" }));
    await user.click(screen.getByRole("radio", { name: "Black" }));

    expect(action).toBeEnabled();
  });

  it("updates the displayed price for the selected SKU", async () => {
    const user = userEvent.setup();
    render(<ProductExperience product={iphoneFixture} />);

    await user.click(screen.getByRole("radio", { name: "256 GB" }));
    await user.click(screen.getByRole("radio", { name: "Black" }));

    expect(screen.getByText("₹89,900")).toBeVisible();
  });

  it("composes trust sections in order and preserves the selection-to-EMI journey", async () => {
    const user = userEvent.setup();
    render(<ProductExperience product={iphoneFixture} relatedProducts={relatedFixtures} />);

    const orderedSections = [
      screen.getByRole("heading", { name: "iPhone 17" }),
      screen.getByRole("heading", { name: "Pay smarter with 1Fi" }),
      screen.getByRole("region", { name: "Product options" }),
      screen.getByRole("heading", { name: "Highlights" }),
      screen.getByRole("heading", { name: "Purchase confidence" }),
      screen.getByRole("heading", { name: "Customer reviews" }),
      screen.getByRole("heading", { name: "You may also like" }),
    ];

    orderedSections.slice(1).forEach((section, index) => {
      const position = orderedSections[index]!.compareDocumentPosition(section);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    expect(screen.getByRole("link", { name: "4.6 · 128 reviews" })).toHaveAttribute(
      "href",
      "#product-reviews",
    );
    expect(screen.queryByRole("link", { name: "Apple iPhone 17" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "256 GB" }));
    await user.click(screen.getByRole("radio", { name: "Black" }));

    expect(screen.getByText("Total payable ₹89,900")).toBeVisible();

    const action = screen.getByRole("button", { name: "View EMI plans" });
    expect(action.parentElement?.lastElementChild).toBe(action);
    expect(action).toHaveClass("sticky", "bottom-20");
    expect(action).not.toHaveClass("shadow-[var(--shadow-float)]");

    await user.click(action);
    expect(screen.getByRole("heading", { name: "Choose your EMI plan" })).toBeVisible();
  });

  it("does not leave related-product spacing when recommendations are empty", () => {
    render(<ProductExperience product={iphoneFixture} relatedProducts={[]} />);

    const reviewsHeading = screen.getByRole("heading", { name: "Customer reviews" });
    const action = screen.getByRole("button", { name: "View EMI plans" });

    expect(action.previousElementSibling).toContainElement(reviewsHeading);
  });

  it("returns from the EMI stage with the variant selection preserved", async () => {
    const user = userEvent.setup();
    render(<ProductExperience product={iphoneFixture} />);

    await user.click(screen.getByRole("radio", { name: "128 GB" }));
    await user.click(screen.getByRole("radio", { name: "Black" }));
    await user.click(screen.getByRole("button", { name: "View EMI plans" }));
    expect(screen.getByRole("heading", { name: "Choose your EMI plan" })).toBeVisible();

    const backButton = screen.getByRole("button", { name: "Back to product details" });
    expect(screen.queryByText("Back to product details")).not.toBeInTheDocument();
    await user.click(backButton);
    expect(screen.getByRole("radio", { name: "128 GB" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Black" })).toBeChecked();
  });

  it("shows detail skeletons while the product query is pending", () => {
    vi.mocked(useProduct).mockReturnValue({ status: "pending" } as ReturnType<typeof useProduct>);
    render(<ProductDetailContent productId="iphone-17" />);

    expect(screen.getByRole("status", { name: "Loading product image" })).toBeVisible();
  });

  it("renders product data returned by the detail query", () => {
    vi.mocked(useProduct).mockReturnValue({
      status: "success",
      data: { data: iphoneFixture, related: relatedFixtures.slice(1) },
    } as ReturnType<typeof useProduct>);
    render(<ProductDetailContent productId="iphone-17" />);

    expect(screen.getByRole("heading", { name: "iPhone 17" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Google Pixel 10" })).toHaveAttribute(
      "href",
      "/shop/marketplace/pixel-10",
    );
    expect(useProduct).toHaveBeenCalledWith("iphone-17");
  });

  it("offers a retry after a detail query error", async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(useProduct).mockReturnValue({ status: "error", error: new Error("offline"), refetch } as unknown as ReturnType<typeof useProduct>);
    render(<ProductDetailContent productId="iphone-17" />);

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("uses the not-found treatment for a typed missing product response", () => {
    vi.mocked(useProduct).mockReturnValue({ status: "error", error: new ApiClientError(404, "PRODUCT_NOT_FOUND", "Missing") } as unknown as ReturnType<typeof useProduct>);

    expect(() => render(<ProductDetailContent productId="missing" />)).toThrow("not found");
    expect(navigationMock.notFound).toHaveBeenCalled();
  });
});
