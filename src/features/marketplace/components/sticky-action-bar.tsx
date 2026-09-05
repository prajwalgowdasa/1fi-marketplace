type StickyActionBarProps = {
  disabled: boolean;
  onClick: () => void;
};

export function StickyActionBar({ disabled, onClick }: StickyActionBarProps) {
  return (
    <button
      className="sticky bottom-20 z-10 mt-8 min-h-12 w-full rounded-2xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      View EMI plans
    </button>
  );
}
