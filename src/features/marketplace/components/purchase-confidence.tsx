import type { ProductCommerce } from "../domain/types";

type PurchaseConfidenceProps = {
  commerce: ProductCommerce;
};

export function PurchaseConfidence({ commerce }: PurchaseConfidenceProps) {
  return (
    <section aria-labelledby="purchase-confidence-heading" className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--ink-900)]" id="purchase-confidence-heading">Purchase confidence</h2>
        <span className="rounded-full bg-[var(--brand-050)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-700)]">Demo information</span>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-500)]">Sold by</dt>
          <dd className="text-right font-medium text-[var(--ink-900)]">{commerce.seller}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-500)]">Estimated delivery</dt>
          <dd className="text-right font-medium text-[var(--ink-900)]">{commerce.deliveryEstimate}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-500)]">Warranty</dt>
          <dd className="text-right font-medium text-[var(--ink-900)]">{commerce.warranty}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-500)]">Returns</dt>
          <dd className="text-right font-medium text-[var(--ink-900)]">{commerce.returns}</dd>
        </div>
      </dl>
      <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm leading-6 text-[var(--ink-500)]">The merchant handles product descriptions, availability, delivery, quality, warranty, cancellations and refunds. 1Fi enables the financing journey.</p>
    </section>
  );
}
