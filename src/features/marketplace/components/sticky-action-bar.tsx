type StickyActionBarProps = {
  disabled: boolean;
  onClick: () => void;
};

export function StickyActionBar({ disabled, onClick }: StickyActionBarProps) {
  return (
    <div className="sticky bottom-20 z-10 -mx-4 mt-8 border-t border-[var(--line)] bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
      <button className="min-h-12 w-full rounded-2xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45" disabled={disabled} onClick={onClick} type="button">View EMI plans</button>
    </div>
  );
}
