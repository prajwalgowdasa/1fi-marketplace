import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { shareProduct } from "../../lib/share-product";
import { ProductActions } from "../product-actions";

vi.mock("../../lib/share-product", () => ({ shareProduct: vi.fn() }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.resetAllMocks();
});

describe("ProductActions", () => {
  it("saves a product and announces the saved state", async () => {
    const user = userEvent.setup();
    render(<ProductActions productId="iphone-17" productName="iPhone 17" />);

    expect(screen.getByRole("button", { name: "Save iPhone 17" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Save iPhone 17" }));

    expect(screen.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Saved to your products");

    await user.click(screen.getByRole("button", { name: "Remove iPhone 17 from saved products" }));
    expect(screen.getByRole("status")).toHaveTextContent("Removed from saved products.");
  });

  it("announces that a saved choice is active only for this visit when writing storage fails", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage quota exceeded");
    });
    const user = userEvent.setup();
    render(<ProductActions productId="iphone-17" productName="iPhone 17" />);

    await user.click(screen.getByRole("button", { name: "Save iPhone 17" }));

    expect(screen.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Saved for this visit only; browser storage is unavailable.");
  });

  it("announces that a saved choice is active only for this visit when reading storage fails", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    const user = userEvent.setup();
    render(<ProductActions productId="iphone-17" productName="iPhone 17" />);

    await waitFor(() => expect(Storage.prototype.getItem).toHaveBeenCalled());
    await user.click(screen.getByRole("button", { name: "Save iPhone 17" }));

    expect(screen.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Saved for this visit only; browser storage is unavailable.");
  });

  it.each([
    ["shared", "Share sheet opened"],
    ["copied", "Product link copied"],
    ["unavailable", "Sharing is unavailable on this device"],
  ] as const)("announces when sharing is %s", async (outcome, message) => {
    const user = userEvent.setup();
    vi.mocked(shareProduct).mockResolvedValue(outcome);
    render(<ProductActions productId="iphone-17" productName="iPhone 17" shareUrl="https://1fi.example/products/iphone-17" />);

    await user.click(screen.getByRole("button", { name: "Share iPhone 17" }));

    expect(screen.getByRole("status")).toHaveTextContent(message);
  });

  it("does not announce a cancelled share", async () => {
    const user = userEvent.setup();
    vi.mocked(shareProduct).mockResolvedValue("cancelled");
    render(<ProductActions productId="iphone-17" productName="iPhone 17" />);

    await user.click(screen.getByRole("button", { name: "Share iPhone 17" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shares the product's canonical title, message, and URL", async () => {
    const user = userEvent.setup();
    vi.mocked(shareProduct).mockResolvedValue("shared");
    render(<ProductActions productId="iphone-17" productName="iPhone 17" shareUrl="https://1fi.example/products/iphone-17" />);

    await user.click(screen.getByRole("button", { name: "Share iPhone 17" }));

    expect(shareProduct).toHaveBeenCalledWith({
      title: "iPhone 17",
      text: "View iPhone 17 with 0% interest EMI options on 1Fi Marketplace.",
      url: "https://1fi.example/products/iphone-17",
    });
  });
});
