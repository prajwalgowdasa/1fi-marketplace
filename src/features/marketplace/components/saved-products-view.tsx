"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { QueryProvider } from "@/providers/query-provider";

import type { ProductSummary } from "../domain/types";
import { SAVED_PRODUCTS_KEY } from "../hooks/use-saved-product";
import { usePersistedIds } from "../hooks/use-persisted-toggle";
import { useProducts } from "../hooks/use-products";
import { ProductCard } from "./product-card";
import { ProductListSkeleton } from "./product-list-skeleton";

const marketplaceUrl = "/shop?tab=marketplace";

export function SavedProductsView() {
  return (
    <QueryProvider>
      <SavedProductsContent />
    </QueryProvider>
  );
}

function SavedProductsContent() {
  const products = useProducts({ category: "all", query: "" });
  const { activeIds, persistenceAvailable, toggle } = usePersistedIds(SAVED_PRODUCTS_KEY);
  const savedProducts = products.status === "success"
    ? products.data.data.filter(({ id }) => activeIds.has(id))
    : [];

  return (
    <section className="px-4 pt-2">
      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">
        Saved products
      </h1>
      <p className="mt-2 text-sm leading-6 text-[var(--ink-500)]">
        Keep products here while you compare their prices and EMI options.
      </p>
      {!persistenceAvailable ? (
        <p className="mt-3 rounded-2xl bg-[var(--brand-050)] px-4 py-3 text-sm leading-5 text-[var(--ink-500)]" role="status">
          Saved products are available for this visit only because browser storage is unavailable.
        </p>
      ) : null}

      <div className="mt-6">
        {products.status === "pending" ? <ProductListSkeleton /> : null}
        {products.status === "error" ? <ErrorState onRetry={() => products.refetch()} /> : null}
        {products.status === "success" && savedProducts.length === 0 ? (
          <EmptyState title="No saved products yet">
            <p>Use the heart button on a product to keep it here.</p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand-500)] px-4 font-semibold text-white"
              href={marketplaceUrl}
            >
              Browse Marketplace
            </Link>
          </EmptyState>
        ) : null}
        {products.status === "success" && savedProducts.length > 0 ? (
          <div className="space-y-3">
            {savedProducts.map((product) => (
              <SavedProductCard
                key={product.id}
                onRemove={() => toggle(product.id)}
                product={product}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SavedProductCard({
  onRemove,
  product,
}: {
  onRemove: () => void;
  product: ProductSummary;
}) {
  return (
    <div className="relative">
      <ProductCard product={product} />
      <button
        aria-label={`Remove ${product.name} from saved products`}
        className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--brand-500)] bg-white text-[var(--brand-600)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--brand-050)]"
        onClick={onRemove}
        type="button"
      >
        <Heart aria-hidden="true" className="fill-current" size={19} />
      </button>
    </div>
  );
}
