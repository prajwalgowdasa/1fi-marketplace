import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("tab=marketplace"),
}));
vi.mock("@/features/marketplace/hooks/use-products", () => ({ useProducts: vi.fn() }));
vi.mock("@/features/marketplace/hooks/use-create-order", () => ({ useCreateOrder: () => ({ mutateAsync: vi.fn() }) }));

import { PRODUCTS, toProductSummary } from "@/features/marketplace/data/products";
import { CatalogView } from "@/features/marketplace/components/catalog-view";
import { ConfirmationView } from "@/features/marketplace/components/confirmation-view";
import { EmiSelection } from "@/features/marketplace/components/emi-selection";
import { ProductExperience } from "@/features/marketplace/components/product-experience";
import { useProducts } from "@/features/marketplace/hooks/use-products";
import { ShopTabs } from "../shop-tabs";

const iphone = PRODUCTS.find(({ id }) => id === "iphone-17")!;
const iphone128Black = iphone.variants.find(({ id }) => id === "iphone-17-128-black")!;

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  expect(results.violations).toEqual([]);
}

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("critical Marketplace accessibility", () => {
  it("has no axe violations in the Marketplace success state", async () => {
    vi.mocked(useProducts).mockReturnValue({
      status: "success",
      data: { data: [toProductSummary(iphone)], meta: { total: 1, query: "", category: "all" } },
    } as ReturnType<typeof useProducts>);
    const { container } = render(<QueryClientProvider client={new QueryClient()}><CatalogView /></QueryClientProvider>);

    await expectNoAxeViolations(container);
  });

  it("has no axe violations for product details after selecting a valid SKU", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProductExperience product={iphone} />);
    await user.click(screen.getByRole("radio", { name: "128 GB" }));
    await user.click(screen.getByRole("radio", { name: "Black" }));

    await expectNoAxeViolations(container);
  });

  it("has no axe violations for a selected EMI plan", async () => {
    const user = userEvent.setup();
    const { container } = render(<EmiSelection onBack={vi.fn()} onSubmit={vi.fn(async () => undefined)} product={iphone} variant={iphone128Black} />);
    await user.click(screen.getByRole("radio", { name: /12 months/ }));

    await expectNoAxeViolations(container);
  });

  it("has no axe violations for confirmation success", async () => {
    const { container } = render(<ConfirmationView referenceId="1FI-A1B2C3D4" product={iphone} tenureMonths={12} variantId={iphone128Black.id} />);

    await expectNoAxeViolations(container);
  });

  it("moves keyboard focus through all Shop tabs", async () => {
    const user = userEvent.setup();
    render(<ShopTabs activeTab="top-brands" onTabChange={vi.fn()} />);
    const topBrands = screen.getByRole("tab", { name: "Top Brands" });
    topBrands.focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Nearby Stores" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "1Fi Marketplace" })).toHaveFocus();
  });

  it("moves keyboard focus through enabled EMI radios", async () => {
    const user = userEvent.setup();
    render(<EmiSelection onBack={vi.fn()} onSubmit={vi.fn(async () => undefined)} product={iphone} variant={iphone128Black} />);
    const sixMonths = screen.getByRole("radio", { name: /6 months/ });
    sixMonths.focus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: /12 months/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /12 months/ })).toHaveFocus();
  });
});
