import Link from "next/link";
import { ChartNoAxesCombined, House, ReceiptText, Store, UserRound } from "lucide-react";

type NavigationItem = {
  label: string;
  icon: typeof House;
  href?: string;
};

const navigationItems: readonly NavigationItem[] = [
  { label: "Home", icon: House },
  { label: "Shop", href: "/shop?tab=marketplace", icon: Store },
  { label: "EMI Dues", icon: ReceiptText },
  { label: "Limit", icon: ChartNoAxesCombined },
  { label: "Profile", icon: UserRound },
] as const;

export function BottomNavigation() {
  return (
    <nav aria-label="Primary" className="fixed bottom-3 left-1/2 z-20 w-[calc(100%-32px)] max-w-[468px] -translate-x-1/2 rounded-[30px] bg-white px-2 shadow-[var(--shadow-float)] safe-area-bottom">
      <ul className="grid grid-cols-5">
        {navigationItems.map(({ label, icon: Icon, href }) => (
          <li key={label}>
            {href ? (
              <Link aria-current="page" className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-[var(--brand-500)]" href={href}>
                <span aria-hidden="true" className="absolute top-1 h-1 w-9 rounded-full bg-[var(--brand-500)]" />
                <Icon aria-hidden="true" size={23} strokeWidth={2.25} />
                <span>{label}</span>
              </Link>
            ) : (
              <span aria-disabled="true" className="flex min-h-16 cursor-not-allowed flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium text-[#a3adbf]">
                <Icon aria-hidden="true" size={23} strokeWidth={1.9} />
                <span>{label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
