import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { toProductSummary, PRODUCTS } from "@/features/marketplace/data/products";
import { SAVED_PRODUCTS_KEY } from "@/features/marketplace/hooks/use-saved-product";
import { useProducts } from "@/features/marketplace/hooks/use-products";

vi.mock("@/features/marketplace/hooks/use-products", () => ({ useProducts: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("tab=marketplace"),
}));

import { CatalogView } from "../catalog-view";

const mockUseProducts = vi.mocked(useProducts);
const iphone = PRODUCTS.find(({ id }) => id === "iphone-17")!;
const catalogFixture = {
  data: [toProductSummary(iphone)],
  meta: { total: 1, query: "", category: "all" as const },
};

function renderCatalog() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <CatalogView />
    </QueryClientProvider>,
  );
}

describe("CatalogView", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders three loading skeletons", () => {
    mockUseProducts.mockReturnValue({ status: "pending" } as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getAllByLabelText("Loading product")).toHaveLength(3);
  });

  it("renders product name, price, and starting EMI from API data", () => {
    mockUseProducts.mockReturnValue({ status: "success", data: catalogFixture } as ReturnType<typeof useProducts>);

    renderCatalog();

    const card = screen.getByRole("link", { name: /iPhone 17/i });
    expect(card).toHaveTextContent("₹79,900");
    expect(card).toHaveTextContent("From ₹3,329.16/month");
  });

  it("links to the saved-products screen with the persisted count", async () => {
    localStorage.setItem(SAVED_PRODUCTS_KEY, '["iphone-17"]');
    mockUseProducts.mockReturnValue({ status: "success", data: catalogFixture } as ReturnType<typeof useProducts>);

    renderCatalog();

    const savedProducts = await screen.findByRole("link", {
      name: "Saved products, 1 item",
    });
    expect(savedProducts).toHaveAttribute("href", "/shop/marketplace/saved");
    expect(savedProducts).toHaveTextContent("Saved");
    expect(savedProducts).toHaveTextContent("1");
  });

  it("offers retry on request failure", async () => {
    const refetch = vi.fn();
    mockUseProducts.mockReturnValue({ status: "error", error: new Error("offline"), refetch } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("renders a filter recovery state when the collection is empty", () => {
    mockUseProducts.mockReturnValue({ status: "success", data: { ...catalogFixture, data: [], meta: { ...catalogFixture.meta, total: 0 } } } as unknown as ReturnType<typeof useProducts>);

    renderCatalog();

    expect(screen.getByRole("heading", { name: "No products found" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeVisible();
  });
});
