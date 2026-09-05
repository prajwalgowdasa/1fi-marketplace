import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS } from "../../data/products";
import { ApiClientError } from "@/shared/lib/api-client";
import { EmiSelection } from "../emi-selection";

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;
const iphone128Black = iphoneFixture.variants.find(({ id }) => id === "iphone-17-128-black")!;

afterEach(cleanup);

describe("EmiSelection", () => {
  it("requires a plan and reflects the selected monthly amount in the CTA", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => undefined);
    render(<EmiSelection onBack={vi.fn()} onSubmit={onSubmit} product={iphoneFixture} variant={iphone128Black} />);

    const action = screen.getByRole("button", { name: /Proceed/ });
    expect(action).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /12 months/ }));

    expect(action).toHaveAccessibleName("Proceed with ₹6,658.33 per month");
    expect(action).toBeEnabled();
    expect(screen.getByText("₹0 interest")).toBeVisible();
  });

  it("shows the adjusted final installment when the price leaves a remainder", async () => {
    const user = userEvent.setup();
    render(<EmiSelection onBack={vi.fn()} onSubmit={vi.fn(async () => undefined)} product={iphoneFixture} variant={iphone128Black} />);

    await user.click(screen.getByRole("radio", { name: /12 months/ }));

    expect(screen.getByText("₹6,658.33 regular payment")).toBeVisible();
    expect(screen.getByText("₹6,658.37 final installment")).toBeVisible();
    expect(screen.getByText("₹79,900 total payable")).toBeVisible();
  });

  it("prevents duplicate submission and preserves the chosen plan after a safe failure", async () => {
    const user = userEvent.setup();
    let rejectSubmission!: (reason: Error) => void;
    const onSubmit = vi.fn(() => new Promise<void>((_resolve, reject) => {
      rejectSubmission = reject;
    }));
    render(<EmiSelection onBack={vi.fn()} onSubmit={onSubmit} product={iphoneFixture} variant={iphone128Black} />);

    await user.click(screen.getByRole("radio", { name: /12 months/ }));
    await user.click(screen.getByRole("button", { name: "Proceed with ₹6,658.33 per month" }));
    await user.click(screen.getByRole("button", { name: "Submitting plan" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Submitting plan" })).toBeDisabled();

    await act(async () => {
      rejectSubmission(new ApiClientError(500, "INTERNAL_ERROR", "Please try again"));
    });

    expect(await screen.findByRole("alert")).toHaveTextContent("Please try again");
    expect(screen.getByRole("radio", { name: /12 months/ })).toBeChecked();
  });
});
