import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { POST } from "../route";

function orderRequest(body: unknown): Request {
  return new Request("http://localhost/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders", () => {
  it("creates a server-priced mock order", async () => {
    const response = await POST(
      orderRequest({
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        tenureMonths: 12,
      }),
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      data: {
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        plan: { totalPayablePaise: 7_990_000, interestRatePercent: 0 },
      },
    });
  });

  it("returns INVALID_JSON for malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_JSON" } });
  });

  it("returns INVALID_ORDER for schema violations", async () => {
    const response = await POST(
      orderRequest({
        productId: "iphone-17",
        variantId: "iphone-17-128-black",
        tenureMonths: 12,
        pricePaise: 1,
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_ORDER" } });
  });

  it("returns PRODUCT_NOT_FOUND for an unknown product", async () => {
    const response = await POST(
      orderRequest({ productId: "missing", variantId: "iphone-17-128-black", tenureMonths: 12 }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { code: "PRODUCT_NOT_FOUND" } });
  });

  it("returns INVALID_VARIANT for a variant outside the product", async () => {
    const response = await POST(
      orderRequest({ productId: "iphone-17", variantId: "pixel-10-128-obsidian", tenureMonths: 12 }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_VARIANT" } });
  });

  it("returns VARIANT_UNAVAILABLE for an out-of-stock variant", async () => {
    const response = await POST(
      orderRequest({ productId: "pixel-10", variantId: "pixel-10-256-frost", tenureMonths: 12 }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { code: "VARIANT_UNAVAILABLE" } });
  });

  it("returns INVALID_TENURE when the product does not support the requested term", async () => {
    const response = await POST(
      orderRequest({ productId: "iphone-17", variantId: "iphone-17-128-black", tenureMonths: 18 }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ error: { code: "INVALID_TENURE" } });
  });
});
