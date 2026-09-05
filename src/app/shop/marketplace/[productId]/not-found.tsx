import { AppShell } from "@/shared/components/app-shell";
import { FlowHeader } from "@/shared/components/flow-header";

export default function ProductNotFound() {
  return (
    <AppShell>
      <FlowHeader backLabel="Back to Marketplace" href="/shop?tab=marketplace" />
      <section className="px-4 py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">Product not found</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">This product may no longer be available in Marketplace.</p>
      </section>
    </AppShell>
  );
}
