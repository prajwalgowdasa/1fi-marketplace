import type { Product, ProductVariant } from "../domain/types";
import { formatInr } from "../domain/currency";
import { ProductActions } from "./product-actions";

export function ProductSummary({ product, shareUrl, variant }: { product: Product; shareUrl?: string; variant: ProductVariant | undefined }) {
  const startingPrice = Math.min(...product.variants.filter(({ stockStatus }) => stockStatus === "in_stock").map(({ pricePaise }) => pricePaise));
  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-[var(--brand-500)]">{product.brand}</p>
        <ProductActions productId={product.id} productName={product.name} {...(shareUrl === undefined ? {} : { shareUrl })} />
      </div>
      <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[var(--ink-900)]">{product.name}</h1>
      <a className="inline-flex min-h-11 items-center gap-2" href="#product-reviews">
        <span aria-hidden="true">★</span>
        <span>{product.reviews.average.toFixed(1)} · {product.reviews.totalCount} reviews</span>
      </a>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-500)]">{product.description}</p>
      <p aria-live="polite" className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--ink-900)]">{formatInr(variant?.pricePaise ?? startingPrice)}</p>
      {variant ? <p className="mt-1 text-sm text-[var(--ink-500)]">Selected {Object.values(variant.attributes).join(" · ")}</p> : <p className="mt-1 text-sm text-[var(--ink-500)]">Select options to see your exact price.</p>}
      {variant ? <p className="mt-1 text-sm font-medium text-[var(--ink-900)]">{variant.stockStatus === "in_stock" ? "In stock" : "Out of stock"}</p> : null}
    </section>
  );
}
