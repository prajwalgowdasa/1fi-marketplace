import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ShopError from "../shop/error";
import ShopLoading from "../shop/loading";

describe("Shop recovery states", () => {
  it("offers an alert recovery action without exposing exception details", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    render(<ShopError error={new Error("sensitive backend details")} reset={reset} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load this section");
    expect(screen.queryByText("sensitive backend details")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("marks loading content as busy", () => {
    render(<ShopLoading />);

    expect(screen.getAllByLabelText("Loading Shop navigation")[0]?.parentElement).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Loading marketplace").parentElement).toHaveAttribute("aria-busy", "true");
  });
});
