"use client";

import { notFound, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Product, ProductSummary as ProductSummaryData, ProductVariant } from "../domain/types";
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
import { AffordabilityCard } from "./affordability-card";
import { ProductReviews } from "./product-reviews";
import { PurchaseConfidence } from "./purchase-confidence";
import { RelatedProducts } from "./related-products";
import { StickyActionBar } from "./sticky-action-bar";
import { type VariantSelection, VariantSelector } from "./variant-selector";
import { EmiSelection } from "./emi-selection";

export function ProductExperience({
  product,
  relatedProducts = [],
}: {
  product: Product;
  relatedProducts?: ProductSummaryData[];
}) {
  const [selection, setSelection] = useState<VariantSelection>({});
  const [invalidAttribute, setInvalidAttribute] = useState<string>();
  const [stage, setStage] = useState<"details" | "emi">("details");
  const router = useRouter();
  const createOrder = useCreateOrder();
  const attributes = useMemo(() => [...new Set(product.variants.flatMap((variant) => Object.keys(variant.attributes)))], [product]);
  const selectedVariant: ProductVariant | undefined = selection && Object.keys(selection).length === attributes.length ? resolveVariant(product, selection) : undefined;
  const displayedPricePaise = selectedVariant?.pricePaise ?? Math.min(
    ...product.variants
      .filter(({ stockStatus }) => stockStatus === "in_stock")
      .map(({ pricePaise }) => pricePaise),
  );
  const longestTenure = Math.max(...product.eligibleTenures);
  const recommendations = relatedProducts.filter(({ id }) => id !== product.id);

  function showEmiPlans() {
    const missingAttribute = attributes.find((attribute) => !selection[attribute]);
    if (missingAttribute) {
      setInvalidAttribute(missingAttribute);
      return;
    }

    if (!selectedVariant) return;

    setInvalidAttribute(undefined);
    setStage("emi");
  }

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
        <ProductGallery key={selection.color ?? "unselected"} images={product.images} selectedColor={selection.color} />
        <div className="mt-6"><ProductSummary product={product} variant={selectedVariant} /></div>
        <div className="mt-7"><AffordabilityCard pricePaise={displayedPricePaise} tenureMonths={longestTenure} /></div>
        <div className="mt-7"><VariantSelector invalidAttribute={invalidAttribute} onChange={(nextSelection) => {
          const colorChanged = Boolean(nextSelection.color && nextSelection.color !== selection.color);
          setSelection(nextSelection);
          if (invalidAttribute && nextSelection[invalidAttribute]) setInvalidAttribute(undefined);
          if (colorChanged) window.scrollTo({ behavior: "smooth", top: 0 });
        }} product={product} value={selection} /></div>
        <div className="mt-7"><ProductFeatures features={product.features} /></div>
        <div className="mt-7"><PurchaseConfidence commerce={product.commerce} /></div>
        <div className="mt-7"><ProductReviews reviews={product.reviews} /></div>
        {recommendations.length > 0 ? <div className="mt-7"><RelatedProducts products={recommendations} /></div> : null}
        <StickyActionBar onClick={showEmiPlans} />
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

  return (
    <ProductExperience
      product={product.data.data}
      relatedProducts={product.data.related}
    />
  );
}

export function DetailHeader() {
  return <FlowHeader backLabel="Back to Marketplace" href="/shop?tab=marketplace" />;
}
