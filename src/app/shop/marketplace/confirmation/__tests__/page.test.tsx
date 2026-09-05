import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS } from "@/features/marketplace/data/products";
import type { Product } from "@/features/marketplace/domain/types";

const catalogMock = vi.hoisted(() => ({ getProduct: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/features/marketplace/server/catalog", () => catalogMock);

import ConfirmationPage from "../page";

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;

function validSearchParams() {
  return {
    referenceId: "1FI-A1B2C3D4",
    productId: "iphone-17",
    variantId: "iphone-17-128-black",
    tenureMonths: "12",
  };
}

async function renderPage(searchParams: Record<string, string | undefined> = validSearchParams()) {
  render(await ConfirmationPage({ searchParams: Promise.resolve(searchParams) }));
}

function expectRecovery() {
  expect(screen.getByRole("heading", { name: "Confirmation unavailable" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Back to Marketplace" })).toHaveAttribute("href", "/shop?tab=marketplace");
  expect(screen.getByText("Pay using 1Fi")).toBeVisible();
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ConfirmationPage", () => {
  it("renders a validated confirmation reconstructed with the server catalog", async () => {
    catalogMock.getProduct.mockReturnValue(iphoneFixture);

    await renderPage();

    expect(catalogMock.getProduct).toHaveBeenCalledWith("iphone-17");
    expect(screen.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
    expect(screen.getByText("₹6,658.33 regular monthly installment")).toBeVisible();
    expect(screen.getByRole("link", { name: "Back to product details" })).toHaveAttribute(
      "href",
      "/shop/marketplace/iphone-17",
    );
    expect(screen.queryByRole("link", { name: "Back to Marketplace" })).not.toBeInTheDocument();
    expect(screen.getByText("Pay using 1Fi")).toBeVisible();
  });

  it("shows recovery for an invalid reference", async () => {
    await renderPage({ ...validSearchParams(), referenceId: "bad" });

    expect(catalogMock.getProduct).not.toHaveBeenCalled();
    expectRecovery();
  });

  it("shows recovery when the product is unavailable", async () => {
    catalogMock.getProduct.mockReturnValue(undefined);

    await renderPage();

    expectRecovery();
  });

  it("shows recovery for an invalid variant", async () => {
    catalogMock.getProduct.mockReturnValue(iphoneFixture);

    await renderPage({ ...validSearchParams(), variantId: "missing-variant" });

    expectRecovery();
  });

  it("shows recovery for an unavailable variant", async () => {
    const unavailableProduct: Product = {
      ...iphoneFixture,
      variants: iphoneFixture.variants.map((variant) => (
        variant.id === "iphone-17-128-black" ? { ...variant, stockStatus: "out_of_stock" } : variant
      )),
    };
    catalogMock.getProduct.mockReturnValue(unavailableProduct);

    await renderPage();

    expectRecovery();
  });

  it("shows recovery for an ineligible tenure", async () => {
    catalogMock.getProduct.mockReturnValue(iphoneFixture);

    await renderPage({ ...validSearchParams(), tenureMonths: "18" });

    expectRecovery();
  });
});
