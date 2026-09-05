"use client";

import type { CatalogFilterState } from "../hooks/use-catalog-filters";

type CatalogFiltersProps = {
  searchText: string;
  category: CatalogFilterState["category"];
  onSearchTextChange: (value: string) => void;
  onCategoryChange: (category: CatalogFilterState["category"]) => void;
};

const categories: ReadonlyArray<{ value: CatalogFilterState["category"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "smartphones", label: "Smartphones" },
  { value: "laptops", label: "Laptops" },
  { value: "electronics", label: "Electronics" },
];

export function CatalogFilters({ searchText, category, onSearchTextChange, onCategoryChange }: CatalogFiltersProps) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="sr-only">Search Marketplace</span>
        <input
          className="min-h-11 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink-900)] shadow-[var(--shadow-card)] placeholder:text-[var(--ink-500)]"
          onChange={(event) => onSearchTextChange(event.target.value)}
          maxLength={80}
          placeholder="Search products"
          type="search"
          value={searchText}
        />
      </label>
      <div aria-label="Product categories" className="scrollbar-hidden flex gap-2 overflow-x-auto pb-1" role="group">
        {categories.map((item) => {
          const selected = item.value === category;
          return (
            <button
              aria-pressed={selected}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold ${selected ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white" : "border-[var(--line)] bg-white text-[var(--ink-500)]"}`}
              key={item.value}
              onClick={() => onCategoryChange(item.value)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
