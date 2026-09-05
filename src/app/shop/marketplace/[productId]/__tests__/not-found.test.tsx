import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProductNotFound from "../not-found";

describe("ProductNotFound", () => {
  it("uses the single flow header action to return to Marketplace", () => {
    render(<ProductNotFound />);

    expect(screen.getByRole("link", { name: "Back to Marketplace" })).toHaveAttribute(
      "href",
      "/shop?tab=marketplace",
    );
    expect(screen.getByText("Pay using 1Fi")).toBeVisible();
    expect(screen.queryByText("Back to Marketplace")).not.toBeInTheDocument();
  });
});
