export function ProductFeatures({ features }: { features: readonly string[] }) {
  return (
    <section aria-labelledby="product-features-heading" className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--ink-900)]" id="product-features-heading">Highlights</h2>
      <ul className="mt-3 space-y-3 text-sm text-[var(--ink-500)]">
        {features.map((feature) => <li className="flex gap-3" key={feature}><span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-500)]" />{feature}</li>)}
      </ul>
    </section>
  );
}
