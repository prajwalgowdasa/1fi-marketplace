type StickyActionBarProps = {
  onClick: () => void;
};

export function StickyActionBar({ onClick }: StickyActionBarProps) {
  return (
    <button
      className="sticky bottom-20 z-10 mt-8 min-h-12 w-full rounded-2xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white"
      onClick={onClick}
      type="button"
    >
      View EMI plans
    </button>
  );
}
