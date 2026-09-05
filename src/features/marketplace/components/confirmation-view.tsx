import { formatInr } from "../domain/currency";
import { calculateEmiPlan } from "../domain/emi";
import type { EmiPlan, Product } from "../domain/types";

type ConfirmationViewProps = {
  referenceId: string;
  product: Product;
  variantId: string;
  tenureMonths: number;
  plan?: EmiPlan;
};

export function ConfirmationUnavailable() {
  return (
    <section className="px-4 py-10 text-center">
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--brand-050)] px-5 py-8 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">Confirmation unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">This link can’t show a Marketplace plan right now.</p>
      </div>
    </section>
  );
}

export function ConfirmationView({ referenceId, product, variantId, tenureMonths, plan: confirmedPlan }: ConfirmationViewProps) {
  const variant = product.variants.find(({ id }) => id === variantId);

  if (!variant) return <ConfirmationUnavailable />;

  const plan = confirmedPlan ?? calculateEmiPlan(variant.pricePaise, tenureMonths);

  return (
    <section className="px-4 py-6">
      <div className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
        <p aria-live="polite" className="text-sm font-semibold text-[var(--brand-500)]" role="status">Mock Marketplace request created</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-900)]">Plan selected!</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">Your selected no-cost EMI plan is ready to review.</p>

        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
            <dt className="text-[var(--ink-500)]">Reference ID</dt>
            <dd className="font-semibold text-[var(--ink-900)]">{referenceId}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
            <dt className="text-[var(--ink-500)]">Product</dt>
            <dd className="text-right font-semibold text-[var(--ink-900)]">{product.name}</dd>
          </div>
          {Object.entries(variant.attributes).map(([attribute, value]) => (
            <div className="flex items-start justify-between gap-4" key={attribute}>
              <dt className="capitalize text-[var(--ink-500)]">{attribute}</dt>
              <dd className="text-right font-medium text-[var(--ink-900)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section aria-labelledby="selected-plan-heading" className="mt-5 rounded-3xl border border-[var(--line)] p-5">
        <h2 className="font-semibold text-[var(--ink-900)]" id="selected-plan-heading">Selected EMI plan</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Tenure</dt><dd>{plan.tenureMonths} months</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Regular installment</dt><dd>{formatInr(plan.regularInstallmentPaise)} regular monthly installment</dd></div>
          {plan.finalInstallmentPaise !== plan.regularInstallmentPaise && <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Final installment</dt><dd>{formatInr(plan.finalInstallmentPaise)} final installment</dd></div>}
          <div className="flex justify-between gap-4"><dt className="text-[var(--ink-500)]">Interest</dt><dd>₹0 interest</dd></div>
          <div className="flex justify-between gap-4 font-semibold text-[var(--ink-900)]"><dt>Total payable</dt><dd>{formatInr(plan.totalPayablePaise)} total payable</dd></div>
        </dl>
      </section>
    </section>
  );
}
