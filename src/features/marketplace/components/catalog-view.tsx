"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { EmptyState } from "@/shared/components/empty-state";
import { QueryProvider } from "@/providers/query-provider";

import { useCatalogFilters } from "../hooks/use-catalog-filters";
import { SAVED_PRODUCTS_KEY } from "../hooks/use-saved-product";
import { usePersistedIds } from "../hooks/use-persisted-toggle";
import { useProducts } from "../hooks/use-products";
import { CatalogFilters } from "./catalog-filters";
import { ProductList } from "./product-list";
import { ProductListSkeleton } from "./product-list-skeleton";

export function CatalogView() {
  return (
    <QueryProvider>
      <CatalogContent />
    </QueryProvider>
  );
}

function CatalogContent() {
  const { filters, searchText, setSearchText, setCategory, clearFilters } =
    useCatalogFilters();
  const products = useProducts(filters);
  const { activeIds: savedProductIds } = usePersistedIds(SAVED_PRODUCTS_KEY);
  const savedProductCount = savedProductIds.size;

  return (
    <div className="px-4 pt-1">
      <div className="mt-2 mb-2">
        <CatalogFilters
          category={filters.category}
          onCategoryChange={setCategory}
          onSearchTextChange={setSearchText}
          searchText={searchText}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.018em] text-gray-900">
          Marketplace
        </h1>
        <Link
          aria-label={`Saved products, ${savedProductCount} ${savedProductCount === 1 ? "item" : "items"}`}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--brand-500)] bg-white px-3 text-sm font-semibold text-[var(--brand-600)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--brand-050)]"
          href="/shop/marketplace/saved"
        >
          <Heart aria-hidden="true" className={savedProductCount > 0 ? "fill-current" : undefined} size={18} />
          <span>Saved</span>
          <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[var(--brand-050)] px-1.5 text-xs">
            {savedProductCount}
          </span>
        </Link>
      </div>
      <div className="mt-5">
        {products.status === "pending" ? <ProductListSkeleton /> : null}
        {products.status === "error" ? (
          <section
            aria-live="assertive"
            className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-lg font-semibold text-[var(--ink-900)]">
              We couldn’t load Marketplace
            </h2>
            <button
              className="mt-5 min-h-11 rounded-xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white"
              onClick={() => products.refetch()}
              type="button"
            >
              Try again
            </button>
          </section>
        ) : null}
        {products.status === "success" && products.data.data.length === 0 ? (
          <EmptyState title="No products found">
            Try another search or clear your category filter.
            <button
              className="mt-4 min-h-11 rounded-xl bg-[var(--brand-500)] px-4 text-sm font-semibold text-white"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </EmptyState>
        ) : null}
        {products.status === "success" && products.data.data.length > 0 ? (
          <ProductList products={products.data.data} />
        ) : null}
      </div>
    </div>
  );
}
