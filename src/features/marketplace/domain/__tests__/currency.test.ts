import { describe, expect, it } from "vitest";

import { formatInr } from "../currency";

describe("formatInr", () => {
  it("formats integer paise as Indian currency", () => {
    expect(formatInr(7_990_000)).toBe("₹79,900");
    expect(formatInr(665_833)).toBe("₹6,658.33");
  });
});
