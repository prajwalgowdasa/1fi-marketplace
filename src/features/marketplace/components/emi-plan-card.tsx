import type { EmiPlan } from "../domain/types";
import { formatInr } from "../domain/currency";

type EmiPlanCardProps = {
  checked: boolean;
  onChange: () => void;
  plan: EmiPlan;
};

export function EmiPlanCard({ checked, onChange, plan }: EmiPlanCardProps) {
  return (
    <label className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border p-4 ${checked ? "border-[var(--brand-500)] bg-[var(--brand-050)]" : "border-[var(--line)]"}`}>
      <input checked={checked} name="emi-plan" onChange={onChange} type="radio" value={plan.tenureMonths} />
      <span className="flex flex-1 justify-between gap-3">
        <span>
          <span className="block font-semibold text-[var(--ink-900)]">{plan.tenureMonths} months</span>
          <span className="mt-1 block text-sm text-[var(--ink-500)]">{formatInr(plan.regularInstallmentPaise)} per month · ₹0 interest</span>
        </span>
        <span className="text-right text-sm text-[var(--ink-500)]">Total payable<br /><strong className="font-semibold text-[var(--ink-900)]">{formatInr(plan.totalPayablePaise)}</strong></span>
      </span>
    </label>
  );
}
