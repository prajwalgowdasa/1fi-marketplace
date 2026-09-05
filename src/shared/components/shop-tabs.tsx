"use client";

import type { KeyboardEvent } from "react";
import { cn } from "@/shared/lib/cn";

export type ShopTab = "top-brands" | "nearby-stores" | "marketplace";

type ShopTabsProps = {
  activeTab: ShopTab;
  onTabChange: (tab: ShopTab) => void;
};

const tabs: ReadonlyArray<{ id: ShopTab; label: string }> = [
  { id: "top-brands", label: "Top Brands" },
  { id: "nearby-stores", label: "Nearby Stores" },
  { id: "marketplace", label: "1Fi Marketplace" },
];

export function ShopTabs({ activeTab, onTabChange }: ShopTabsProps) {
  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex]!;
    onTabChange(nextTab.id);
    document.getElementById(`shop-tab-${nextTab.id}`)?.focus();
    window.requestAnimationFrame(() => document.getElementById(`shop-tab-${nextTab.id}`)?.focus());
  }

  return (
    <div className="relative z-10 -mt-7 px-4">
      <div
        aria-label="Shop sections"
        className="grid grid-cols-3 rounded-[28px] bg-[var(--brand-050)] p-1.5 shadow-[var(--shadow-card)]"
        role="tablist"
      >
        {tabs.map((tab, index) => {
          const selected = activeTab === tab.id;
          return (
            <button
              aria-controls={`shop-panel-${tab.id}`}
              aria-selected={selected}
              className={cn(
                "relative min-h-11 rounded-[23px] px-1 text-center text-xs font-semibold leading-tight text-[var(--ink-500)] sm:text-sm",
                selected && "bg-white text-[var(--brand-500)] shadow-[var(--shadow-card)]",
              )}
              id={`shop-tab-${tab.id}`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(event) => moveFocus(event, index)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {tab.label}
              {selected ? (
                <span aria-hidden="true" className="absolute inset-x-1/2 bottom-1.5 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[var(--brand-500)]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
