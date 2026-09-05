"use client";

import { useMemo, useState } from "react";

import { calculateEmiPlan } from "../domain/emi";
import type { Product, ProductVariant } from "../domain/types";
import { formatInr } from "../domain/currency";
import { ApiClientError } from "@/shared/lib/api-client";
import { FlowHeader } from "@/shared/components/flow-header";
import { EmiPlanCard } from "./emi-plan-card";
import { PaymentBreakdown } from "./payment-breakdown";

type EmiSelectionProps = {
  product: Product;
  variant: ProductVariant;
  onBack: () => void;
  onSubmit: (tenureMonths: number) => Promise<void>;
};

export function EmiSelection({ onBack, onSubmit, product, variant }: EmiSelectionProps) {
  const [selectedTenure, setSelectedTenure] = useState<number>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();
  const plans = useMemo(() => product.eligibleTenures.map((tenure) => calculateEmiPlan(variant.pricePaise, tenure)), [product.eligibleTenures, variant.pricePaise]);
  const selectedPlan = plans.find((plan) => plan.tenureMonths === selectedTenure);

  async function submit() {
    if (!selectedPlan || isPending) return;

    setIsPending(true);
    setError(undefined);
    try {
      await onSubmit(selectedPlan.tenureMonths);
    } catch (submissionError) {
      setError(submissionError instanceof ApiClientError ? submissionError.message : "We couldn’t submit this plan. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const ctaLabel = selectedPlan ? `Proceed with ${formatInr(selectedPlan.regularInstallmentPaise)} per month` : "Proceed";

  return (
    <>
      <FlowHeader backLabel="Back to product details" onBack={onBack} />
      <section className="px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">Choose your EMI plan</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">Select a zero-interest plan for {product.name}.</p>
        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-semibold text-[var(--ink-900)]">Available EMI plans</legend>
          {plans.map((plan) => <EmiPlanCard checked={plan.tenureMonths === selectedTenure} key={plan.tenureMonths} onChange={() => { setSelectedTenure(plan.tenureMonths); setError(undefined); }} plan={plan} />)}
        </fieldset>
        {selectedPlan && <div className="mt-6"><PaymentBreakdown plan={selectedPlan} pricePaise={variant.pricePaise} /></div>}
        {error && <p aria-live="polite" className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        <button
          className="sticky bottom-20 z-10 mt-6 min-h-12 w-full rounded-2xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-float)] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!selectedPlan || isPending}
          onClick={submit}
          type="button"
        >
          {isPending ? "Submitting plan" : ctaLabel}
        </button>
      </section>
    </>
  );
}
