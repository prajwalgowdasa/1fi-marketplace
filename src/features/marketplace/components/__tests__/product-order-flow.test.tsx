import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS } from "../../data/products";
import { ProductExperience } from "../product-experience";

const navigationMock = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => navigationMock,
}));

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;

function renderProduct() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      <ProductExperience product={iphoneFixture} />
    </QueryClientProvider>,
  );
}

async function chooseIphoneVariantAndPlan(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "128 GB" }));
  await user.click(screen.getByRole("radio", { name: "Black" }));
  await user.click(screen.getByRole("button", { name: "View EMI plans" }));
  await user.click(screen.getByRole("radio", { name: /12 months/ }));
}

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn());
});

describe("ProductExperience order flow", () => {
  it("posts only order identifiers and navigates using the server confirmation", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      data: {
        referenceId: "1FI-A1B2C3D4",
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        plan: { tenureMonths: 12, regularInstallmentPaise: 665833, finalInstallmentPaise: 665837, interestRatePercent: 0, totalPayablePaise: 7990000 },
      },
    }), { status: 201, headers: { "content-type": "application/json" } }));
    renderProduct();

    await chooseIphoneVariantAndPlan(user);
    await user.click(screen.getByRole("button", { name: "Proceed with ₹6,658.33 per month" }));

    await vi.waitFor(() => expect(navigationMock.push).toHaveBeenCalledOnce());
    expect(fetch).toHaveBeenCalledWith("/api/orders", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ productId: "iphone-17", variantId: "iphone-17-128-black", tenureMonths: 12 }),
    }));
    expect(navigationMock.push).toHaveBeenCalledWith("/shop/marketplace/confirmation?referenceId=1FI-A1B2C3D4&productId=iphone-17&variantId=iphone-17-128-black&tenureMonths=12");
  });

  it("keeps the variant when returning to details and clears the plan after changing it", async () => {
    const user = userEvent.setup();
    renderProduct();

    await chooseIphoneVariantAndPlan(user);
    await user.click(screen.getByRole("button", { name: "Back to product details" }));

    expect(screen.getByRole("radio", { name: "128 GB" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Black" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "256 GB" }));
    await user.click(screen.getByRole("button", { name: "View EMI plans" }));

    expect(screen.getByRole("button", { name: "Proceed" })).toBeDisabled();
  });
});
