import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams("tab=marketplace"),
}));

import { createCatalogSearchParams, parseCatalogFilters, useCatalogFilters } from "../use-catalog-filters";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

function FilterProbe() {
  const { searchText, setSearchText } = useCatalogFilters();
  return <input aria-label="Search Marketplace" onChange={(event) => setSearchText(event.target.value)} type="search" value={searchText} />;
}

describe("catalog URL filters", () => {
  it("parses known query and category values", () => {
    expect(parseCatalogFilters(new URLSearchParams("q=Pixel&category=smartphones"))).toEqual({
      query: "Pixel",
      category: "smartphones",
    });
  });

  it("caps direct and constructed queries at the API limit", () => {
    const longQuery = "x".repeat(81);
    expect(parseCatalogFilters(new URLSearchParams(`q=${longQuery}`)).query).toHaveLength(80);
    expect(createCatalogSearchParams(new URLSearchParams("tab=marketplace"), { query: longQuery, category: "all" }).get("q")).toHaveLength(80);
  });

  it("normalizes invalid categories and removes an empty query while preserving the tab", () => {
    expect(parseCatalogFilters(new URLSearchParams("q=Pixel&category=cameras"))).toEqual({ query: "Pixel", category: "all" });
    expect(createCatalogSearchParams(new URLSearchParams("tab=marketplace&q=old"), { query: "  ", category: "all" }).toString()).toBe("tab=marketplace");
  });

  it("preserves the marketplace tab when filters change", () => {
    expect(createCatalogSearchParams(new URLSearchParams("tab=marketplace"), { query: "MacBook", category: "laptops" }).toString()).toBe("tab=marketplace&q=MacBook&category=laptops");
  });

  it("debounces URL replacement while reflecting search text immediately", async () => {
    vi.useFakeTimers();
    render(<FilterProbe />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Marketplace" }), { target: { value: "Pixel" } });
    expect(screen.getByRole("searchbox", { name: "Search Marketplace" })).toHaveValue("Pixel");
    expect(replace).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(250);
    expect(replace).toHaveBeenCalledWith("/shop?tab=marketplace&q=Pixel", { scroll: false });
    vi.useRealTimers();
  });

  it("keeps an immediate edit made before the initial URL synchronization tick", async () => {
    vi.useFakeTimers();
    render(<FilterProbe />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search Marketplace" }), { target: { value: "Pixel" } });
    await vi.advanceTimersByTimeAsync(0);

    expect(screen.getByRole("searchbox", { name: "Search Marketplace" })).toHaveValue("Pixel");
    await vi.advanceTimersByTimeAsync(250);
    expect(replace).toHaveBeenCalledWith("/shop?tab=marketplace&q=Pixel", { scroll: false });
    vi.useRealTimers();
  });
});
