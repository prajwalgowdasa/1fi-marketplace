import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { GET } from "../route";

describe("GET /api/products/[productId]", () => {
  it("returns the full product for a known product", async () => {
    const response = await GET(new Request("http://localhost/api/products/iphone-17"), {
      params: Promise.resolve({ productId: "iphone-17" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ data: { id: "iphone-17", variants: expect.any(Array) } });
  });

  it("returns a stable not-found error", async () => {
    const response = await GET(new Request("http://localhost/api/products/missing"), {
      params: Promise.resolve({ productId: "missing" }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ error: { code: "PRODUCT_NOT_FOUND" } });
  });
});
