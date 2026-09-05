type ErrorStateProps = {
  onRetry?: () => void;
};

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <section aria-live="assertive" className="mx-4 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-card)]" role="alert">
      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--ink-900)]">Unable to load this section</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">Check your connection and try again.</p>
      {onRetry ? <button className="mt-5 min-h-11 rounded-xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white" onClick={onRetry} type="button">Try again</button> : null}
    </section>
  );
}
