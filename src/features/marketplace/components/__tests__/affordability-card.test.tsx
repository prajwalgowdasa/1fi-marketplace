import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { AffordabilityCard } from "../affordability-card";

afterEach(cleanup);

describe("AffordabilityCard", () => {
  it("shows a zero-interest monthly plan calculated from the price in paise", () => {
    render(<AffordabilityCard pricePaise={7_990_000} tenureMonths={24} />);

    expect(screen.getByRole("heading", { name: "Pay smarter with 1Fi" })).toBeVisible();
    expect(screen.getByText("From ₹3,329.16/month")).toBeVisible();
    expect(screen.getByText("0% interest")).toBeVisible();
    expect(screen.getByText("Total payable ₹79,900")).toBeVisible();
    expect(screen.getByText("How 1Fi financing works")).toBeVisible();
  });

  it("discloses invested holdings, approval, lien, and market-value risk when financing details are opened", async () => {
    const user = userEvent.setup();
    render(<AffordabilityCard pricePaise={7_990_000} tenureMonths={24} />);

    await user.click(screen.getByText("How 1Fi financing works"));

    expect(screen.getByText(/eligible units stay invested while selected units may be lien-marked/i)).toBeVisible();
    expect(screen.getByText(/lender approval and eligible holdings/i)).toBeVisible();
    expect(screen.getByText(/falling market value can require more collateral or partial repayment/i)).toBeVisible();
  });
});
