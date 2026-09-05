import { describe, expect, it } from "vitest";

import { calculateEmiPlan } from "../emi";

describe("calculateEmiPlan", () => {
  it("assigns the division remainder to the final installment", () => {
    expect(calculateEmiPlan(7_990_000, 12)).toEqual({
      tenureMonths: 12,
      regularInstallmentPaise: 665_833,
      finalInstallmentPaise: 665_837,
      interestRatePercent: 0,
      totalPayablePaise: 7_990_000,
    });
  });

  it("rejects non-positive inputs", () => {
    expect(() => calculateEmiPlan(0, 12)).toThrow("pricePaise must be positive");
    expect(() => calculateEmiPlan(100_000, 0)).toThrow("tenureMonths must be positive");
  });
});
