import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ProductCommerce } from "../../domain/types";
import { PurchaseConfidence } from "../purchase-confidence";

const commerce: ProductCommerce = {
  seller: "1Fi Demo Partner",
  deliveryEstimate: "Estimated 2–4 business days",
  warranty: "1-year manufacturer warranty",
  returns: "7-day replacement for eligible defects",
};

afterEach(cleanup);

describe("PurchaseConfidence", () => {
  it("shows fulfilment facts and 1Fi's financing-only responsibility", () => {
    render(<PurchaseConfidence commerce={commerce} />);

    expect(screen.getByText("Demo information")).toBeVisible();
    expect(screen.getByText("Sold by")).toBeVisible();
    expect(screen.getByText(commerce.seller)).toBeVisible();
    expect(screen.getByText("Estimated delivery")).toBeVisible();
    expect(screen.getByText(commerce.deliveryEstimate)).toBeVisible();
    expect(screen.getByText("Warranty")).toBeVisible();
    expect(screen.getByText(commerce.warranty)).toBeVisible();
    expect(screen.getByText("Returns")).toBeVisible();
    expect(screen.getByText(commerce.returns)).toBeVisible();
    expect(screen.getByText("The merchant handles product descriptions, availability, delivery, quality, warranty, cancellations and refunds. 1Fi enables the financing journey.")).toBeVisible();
  });
});
