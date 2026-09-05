import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchProducts } from "../products";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchProducts", () => {
  it("trims and caps a direct query while preserving category and signal", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        data: [],
        meta: { total: 0, query: "", category: "laptops" },
      })),
    );
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    await fetchProducts({
      query: `  ${"x".repeat(90)}  `,
      category: "laptops",
    }, signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/products?q=${"x".repeat(80)}&category=laptops`,
      { signal, headers: { accept: "application/json" } },
    );
  });
});
