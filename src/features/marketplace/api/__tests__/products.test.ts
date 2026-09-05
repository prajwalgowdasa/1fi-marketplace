import { afterEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS, toProductSummary } from "../../data/products";
import { fetchProduct, fetchProducts } from "../products";

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

describe("fetchProduct", () => {
  it("encodes the product URL, forwards the signal, and returns data with related products", async () => {
    const payload = {
      data: PRODUCTS[0]!,
      related: [toProductSummary(PRODUCTS[1]!)],
    };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(payload)),
    );
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    const result = await fetchProduct("iphone 17/blue?", signal);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products/iphone%2017%2Fblue%3F",
      { signal, headers: { accept: "application/json" } },
    );
    expect(result).toEqual(payload);
  });
});
