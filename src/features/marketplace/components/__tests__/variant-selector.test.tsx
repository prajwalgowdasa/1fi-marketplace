import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { PRODUCTS } from "../../data/products";
import { VariantSelector } from "../variant-selector";

const iphoneFixture = PRODUCTS.find(({ id }) => id === "iphone-17")!;
const pixelFixture = PRODUCTS.find(({ id }) => id === "pixel-10")!;

afterEach(cleanup);

function InteractiveSelector() {
  const [value, setValue] = useState({});
  return <VariantSelector product={iphoneFixture} value={value} onChange={setValue} />;
}

describe("VariantSelector", () => {
  it("disables values that cannot belong to an in-stock SKU", () => {
    render(<VariantSelector product={pixelFixture} value={{}} onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "Porcelain" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Obsidian" })).toBeEnabled();
  });

  it("reports the complete attribute selection to its owner", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<VariantSelector product={iphoneFixture} value={{}} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "128 GB" }));

    expect(onChange).toHaveBeenLastCalledWith({ storage: "128 GB" });
  });

  it("supports native radio arrow-key navigation within each attribute group", async () => {
    const user = userEvent.setup();
    render(<InteractiveSelector />);

    const storage = screen.getByRole("radio", { name: "128 GB" });
    storage.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "256 GB" })).toBeChecked();
  });
});
