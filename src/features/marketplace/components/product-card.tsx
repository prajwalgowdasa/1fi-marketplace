import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import type { ProductSummary } from "../domain/types";
import { formatInr } from "../domain/currency";

export function ProductCard({ product }: { product: ProductSummary }) {
  const image = product.images[0]!;
  const [imageSource, setImageSource] = useState(image.src);
  return (
    <Link
      aria-label={`${product.brand} ${product.name}`}
      className="flex min-h-28 gap-4 rounded-3xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-card)] transition hover:border-[var(--brand-500)]"
      href={`/shop/marketplace/${product.id}`}
    >
      <Image alt={image.alt} className="h-24 w-24 shrink-0 rounded-2xl object-cover" height={96} onError={() => setImageSource("/images/product-placeholder.svg")} src={imageSource} width={96} />
      <div className="min-w-0 py-1">
        <p className="text-xs font-semibold text-[var(--ink-500)]">{product.brand}</p>
        <h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[var(--ink-900)]">{product.name}</h2>
        <p className="mt-2 text-sm font-semibold text-[var(--ink-900)]">{formatInr(product.startingPricePaise)}</p>
        <p className="mt-1 text-xs text-[var(--ink-500)]">From {formatInr(product.startingEmi.regularInstallmentPaise)}/month</p>
      </div>
    </Link>
  );
}
