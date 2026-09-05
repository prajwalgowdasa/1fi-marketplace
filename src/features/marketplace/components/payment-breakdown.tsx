import type { EmiPlan } from "../domain/types";
import { formatInr } from "../domain/currency";

export function PaymentBreakdown({ plan, pricePaise }: { plan: EmiPlan; pricePaise: number }) {
  return (
    <section aria-labelledby="payment-breakdown-heading" className="rounded-2xl border border-[var(--line)] p-4">
      <h2 className="font-semibold text-[var(--ink-900)]" id="payment-breakdown-heading">Payment breakdown</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Product price</dt><dd>{formatInr(pricePaise)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Interest</dt><dd>₹0 interest</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Total payable</dt><dd>{formatInr(plan.totalPayablePaise)} total payable</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Regular payment</dt><dd>{formatInr(plan.regularInstallmentPaise)} regular payment</dd></div>
        {plan.finalInstallmentPaise !== plan.regularInstallmentPaise && <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Final adjusted payment</dt><dd>{formatInr(plan.finalInstallmentPaise)} final installment</dd></div>}
        <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Tenure</dt><dd>{plan.tenureMonths} months</dd></div>
      </dl>
    </section>
  );
}
