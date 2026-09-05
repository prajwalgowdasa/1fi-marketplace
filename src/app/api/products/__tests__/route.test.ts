import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { GET } from "../route";

describe("GET /api/products", () => {
  it("returns filtered summaries and normalized metadata", async () => {
    const response = await GET(
      new Request("http://localhost/api/products?q=apple&category=laptops"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      meta: { total: 2, query: "apple", category: "laptops" },
      data: [{ id: "macbook-air" }, { id: "macbook-pro" }],
    });
  });

  it("returns a typed 400 for an unsupported category", async () => {
    const response = await GET(new Request("http://localhost/api/products?category=cars"));

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_QUERY" } });
  });
});
