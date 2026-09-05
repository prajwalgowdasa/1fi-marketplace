"use client";

import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Product, ProductVariant } from "../domain/types";
import { resolveVariant } from "../domain/variants";
import { useProduct } from "../hooks/use-product";
import { useCreateOrder } from "../hooks/use-create-order";
import { ApiClientError } from "@/shared/lib/api-client";
import { ErrorState } from "@/shared/components/error-state";
import { FlowHeader } from "@/shared/components/flow-header";
import { Skeleton } from "@/shared/components/skeleton";
import { ProductFeatures } from "./product-features";
import { ProductGallery } from "./product-gallery";
import { ProductSummary } from "./product-summary";
import { StickyActionBar } from "./sticky-action-bar";
import { type VariantSelection, VariantSelector } from "./variant-selector";
import { EmiSelection } from "./emi-selection";

export function ProductExperience({ product }: { product: Product }) {
  const [selection, setSelection] = useState<VariantSelection>({});
  const [stage, setStage] = useState<"details" | "emi">("details");
  const router = useRouter();
  const createOrder = useCreateOrder();
  const attributes = useMemo(() => new Set(product.variants.flatMap((variant) => Object.keys(variant.attributes))), [product]);
  const selectedVariant: ProductVariant | undefined = selection && Object.keys(selection).length === attributes.size ? resolveVariant(product, selection) : undefined;

  if (stage === "emi" && selectedVariant) {
    return (
      <EmiSelection
        onBack={() => setStage("details")}
        onSubmit={async (tenureMonths) => {
          const { data: confirmation } = await createOrder.mutateAsync({ productId: product.id, variantId: selectedVariant.id, tenureMonths });
          const params = new URLSearchParams({ referenceId: confirmation.referenceId, productId: confirmation.productId, variantId: confirmation.variantId, tenureMonths: String(confirmation.plan.tenureMonths) });
          router.push(`/shop/marketplace/confirmation?${params.toString()}`);
        }}
        product={product}
        variant={selectedVariant}
      />
    );
  }

  return (
    <>
      <DetailHeader />
      <div className="px-4 py-6">
        <ProductGallery images={product.images} />
        <div className="mt-6"><ProductSummary product={product} variant={selectedVariant} /></div>
        <div className="mt-7"><VariantSelector onChange={setSelection} product={product} value={selection} /></div>
        <div className="mt-7"><ProductFeatures features={product.features} /></div>
        <StickyActionBar disabled={!selectedVariant} onClick={() => setStage("emi")} />
      </div>
    </>
  );
}

export function ProductDetailContent({ productId }: { productId: string }) {
  const product = useProduct(productId);

  if (product.status === "pending") {
    return <><DetailHeader /><div className="space-y-5 px-4 py-6"><Skeleton className="aspect-square w-full" label="Loading product image" /><Skeleton className="h-7 w-40" label="Loading product details" /><Skeleton className="h-28 w-full" label="Loading product options" /></div></>;
  }

  if (product.status === "error") {
    if (product.error instanceof ApiClientError && product.error.code === "PRODUCT_NOT_FOUND") notFound();
    return <><DetailHeader /><div className="py-6"><ErrorState onRetry={() => product.refetch()} /></div></>;
  }

  return <ProductExperience product={product.data.data} />;
}

export function DetailHeader() {
  return <FlowHeader backLabel="Back to Marketplace" href="/shop?tab=marketplace" />;
}
