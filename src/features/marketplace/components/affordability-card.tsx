import { formatInr } from "../domain/currency";
import { calculateEmiPlan } from "../domain/emi";

type AffordabilityCardProps = {
  pricePaise: number;
  tenureMonths: number;
};

export function AffordabilityCard({ pricePaise, tenureMonths }: AffordabilityCardProps) {
  const plan = calculateEmiPlan(pricePaise, tenureMonths);

  return (
    <section aria-labelledby="affordability-heading" className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <h2 className="text-lg font-semibold text-[var(--ink-900)]" id="affordability-heading">Pay smarter with 1Fi</h2>
      <dl className="mt-4 space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-[var(--ink-500)]">Monthly payment</dt>
          <dd className="font-semibold text-[var(--ink-900)]">From {formatInr(plan.regularInstallmentPaise)}/month</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-[var(--ink-500)]">Interest</dt>
          <dd className="font-semibold text-[var(--ink-900)]">{plan.interestRatePercent}% interest</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-[var(--ink-500)]">Total payable</dt>
          <dd className="font-semibold text-[var(--ink-900)]">Total payable {formatInr(plan.totalPayablePaise)}</dd>
        </div>
      </dl>
      <details className="mt-4 border-t border-[var(--line)] pt-4 text-sm leading-6 text-[var(--ink-500)]">
        <summary className="cursor-pointer font-semibold text-[var(--ink-900)]">How 1Fi financing works</summary>
        <p className="mt-3">Your limit depends on lender approval and eligible holdings. Selected eligible units may be lien-marked for the financing period.</p>
        <p className="mt-2">Falling market value can require more collateral or partial repayment.</p>
      </details>
    </section>
  );
}
