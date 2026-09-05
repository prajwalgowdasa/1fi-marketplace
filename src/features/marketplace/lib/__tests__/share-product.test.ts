import { describe, expect, it, vi } from "vitest";

import { shareProduct } from "../share-product";

const payload = {
  title: "iPhone 17",
  text: "View iPhone 17 with 0% interest EMI options on 1Fi Marketplace.",
  url: "https://1fi.example/shop/marketplace/iphone-17",
};

describe("shareProduct", () => {
  it("uses native share when the device supports it", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(shareProduct(payload, { share })).resolves.toBe("shared");
  });

  it("copies the product link when native share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareProduct(payload, { writeText })).resolves.toBe("copied");
  });

  it("treats only an aborted native share as cancellation", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError"));

    await expect(shareProduct(payload, { share })).resolves.toBe("cancelled");
  });

  it("falls back to copying when native share fails for another reason", async () => {
    const share = vi.fn().mockRejectedValue(new Error("share failed"));
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareProduct(payload, { share, writeText })).resolves.toBe("copied");
  });

  it("reports unavailability when no device capability exists", async () => {
    await expect(shareProduct(payload, {})).resolves.toBe("unavailable");
  });
});
