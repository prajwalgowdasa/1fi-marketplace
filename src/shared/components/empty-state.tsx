import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className="mx-4 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--ink-900)]">{title}</h2>
      <div className="mt-2 max-w-sm text-sm leading-6 text-[var(--ink-500)]">{children}</div>
    </section>
  );
}
