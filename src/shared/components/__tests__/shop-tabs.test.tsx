import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ShopPage from "@/app/shop/page";
import { ShopTabs } from "../shop-tabs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams("tab=marketplace"),
}));

describe("ShopTabs", () => {
  it("exposes three keyboard-operable Shop tabs", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();

    render(<ShopTabs activeTab="marketplace" onTabChange={onTabChange} />);

    expect(screen.getByRole("tab", { name: "1Fi Marketplace" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByRole("tab")).toHaveLength(3);

    await user.click(screen.getByRole("tab", { name: "Top Brands" }));
    await user.keyboard("{ArrowRight}");

    expect(onTabChange).toHaveBeenNthCalledWith(1, "top-brands");
    expect(onTabChange).toHaveBeenNthCalledWith(2, "nearby-stores");
  });

  it("keeps every tab-controlled panel in the document", () => {
    render(<ShopPage />);

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels).toHaveLength(3);

    screen.getAllByRole("tab").forEach((tab) => {
      const panelId = tab.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      expect(document.getElementById(panelId!)).toBeInTheDocument();
    });
  });

  it("keeps the Marketplace search close to the tab control", () => {
    render(<ShopPage />);

    expect(document.getElementById("shop-panel-marketplace")).toHaveClass("pt-1");
    expect(document.getElementById("shop-panel-marketplace")).not.toHaveClass("pt-8");
  });
});
