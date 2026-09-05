import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PRODUCTS } from "../../data/products";
import { ConfirmationView } from "../confirmation-view";

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;

describe("ConfirmationView", () => {
  it("reconstructs the confirmed selection from catalog-backed identifiers", () => {
    render(
      <ConfirmationView
        referenceId="1FI-A1B2C3D4"
        product={iphoneFixture}
        variantId="iphone-17-128-black"
        tenureMonths={12}
      />,
    );

    expect(screen.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Mock Marketplace request created");
    expect(screen.getByText("1FI-A1B2C3D4")).toBeVisible();
    expect(screen.getByText("iPhone 17")).toBeVisible();
    expect(screen.getByText("128 GB")).toBeVisible();
    expect(screen.getByText("Black")).toBeVisible();
    expect(screen.getByText("12 months")).toBeVisible();
    expect(screen.getByText("₹6,658.33 regular monthly installment")).toBeVisible();
    expect(screen.getByText("₹6,658.37 final installment")).toBeVisible();
    expect(screen.getByText("₹0 interest")).toBeVisible();
    expect(screen.getByText("₹79,900 total payable")).toBeVisible();
    expect(screen.queryByRole("link", { name: "Back to Marketplace" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Back to product" })).not.toBeInTheDocument();
  });
});
