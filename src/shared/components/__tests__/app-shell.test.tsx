import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "../app-shell";

describe("AppShell", () => {
  it("renders a centered main landmark and bottom navigation", () => {
    render(
      <AppShell>
        <p>Content</p>
      </AppShell>,
    );

    expect(screen.getByRole("main")).toHaveClass("max-w-[500px]");
    expect(screen.getByRole("main")).toHaveClass("bg-[var(--canvas)]");
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
  });
});
