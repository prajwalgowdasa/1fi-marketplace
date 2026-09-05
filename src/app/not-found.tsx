import Link from "next/link";

import { AppShell } from "@/shared/components/app-shell";

export default function NotFound() {
  return (
    <AppShell>
      <section className="px-4 py-16 text-center">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--brand-050)] px-5 py-8 shadow-[var(--shadow-card)]">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">This Marketplace page is unavailable or may have moved.</p>
          <Link className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-500)] px-5 text-sm font-semibold text-white" href="/shop?tab=marketplace">Back to Marketplace</Link>
        </div>
      </section>
    </AppShell>
  );
}
