import type { EmiPlan } from "./types";

export function calculateEmiPlan(pricePaise: number, tenureMonths: number): EmiPlan {
  if (!Number.isInteger(pricePaise) || pricePaise <= 0) {
    throw new Error("pricePaise must be positive");
  }

  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) {
    throw new Error("tenureMonths must be positive");
  }

  const regularInstallmentPaise = Math.floor(pricePaise / tenureMonths);

  return {
    tenureMonths,
    regularInstallmentPaise,
    finalInstallmentPaise: regularInstallmentPaise + (pricePaise % tenureMonths),
    interestRatePercent: 0,
    totalPayablePaise: pricePaise,
  };
}
