"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatInr } from "../domain/currency";
import type { ProductSummary } from "../domain/types";

function RelatedProductCard({ product }: { product: ProductSummary }) {
  const image = product.images[0]!;
  const [imageSource, setImageSource] = useState(image.src);

  return (
    <Link
      aria-label={`${product.brand} ${product.name}`}
      className="block h-full rounded-3xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-card)] transition hover:border-[var(--brand-500)]"
      href={`/shop/marketplace/${product.id}`}
    >
      <Image
        alt={image.alt}
        className="aspect-[4/3] w-full rounded-2xl object-cover"
        height={180}
        onError={() => setImageSource("/images/product-placeholder.svg")}
        src={imageSource}
        width={240}
      />
      <div className="px-1 pb-1 pt-3">
        <p className="text-xs font-semibold text-[var(--ink-500)]">{product.brand}</p>
        <h3 className="mt-1 text-base font-semibold tracking-[-0.02em] text-[var(--ink-900)]">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-semibold text-[var(--ink-900)]">
          {formatInr(product.startingPricePaise)}
        </p>
        <p className="mt-1 text-xs text-[var(--ink-500)]">
          From {formatInr(product.startingEmi.regularInstallmentPaise)}/month
        </p>
      </div>
    </Link>
  );
}

export function RelatedProducts({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-products-heading">
      <h2
        className="text-lg font-semibold text-[var(--ink-900)]"
        id="related-products-heading"
      >
        You may also like
      </h2>
      <ul className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <li className="w-[76%] shrink-0 snap-start" key={product.id}>
            <RelatedProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
