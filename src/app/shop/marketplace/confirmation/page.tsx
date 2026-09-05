import { ConfirmationUnavailable, ConfirmationView } from "@/features/marketplace/components/confirmation-view";
import { calculateEmiPlan } from "@/features/marketplace/domain/emi";
import { confirmationQuerySchema } from "@/features/marketplace/domain/schemas";
import type { EmiPlan } from "@/features/marketplace/domain/types";
import { getProduct } from "@/features/marketplace/server/catalog";
import { AppShell } from "@/shared/components/app-shell";
import { FlowHeader } from "@/shared/components/flow-header";

type ConfirmationSearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<ConfirmationSearchParams> }) {
  const query = await searchParams;
  const parsed = confirmationQuerySchema.safeParse({
    referenceId: getSingleValue(query.referenceId),
    productId: getSingleValue(query.productId),
    variantId: getSingleValue(query.variantId),
    tenureMonths: Number(getSingleValue(query.tenureMonths)),
  });

  let confirmedSelection: {
    product: NonNullable<ReturnType<typeof getProduct>>;
    plan: EmiPlan;
    referenceId: string;
    tenureMonths: number;
    variantId: string;
  } | undefined;

  if (parsed.success) {
    try {
      const product = getProduct(parsed.data.productId);
      const variant = product?.variants.find(({ id }) => id === parsed.data.variantId);

      if (product && variant?.stockStatus === "in_stock" && product.eligibleTenures.includes(parsed.data.tenureMonths)) {
        confirmedSelection = {
          product,
          plan: calculateEmiPlan(variant.pricePaise, parsed.data.tenureMonths),
          referenceId: parsed.data.referenceId,
          tenureMonths: parsed.data.tenureMonths,
          variantId: variant.id,
        };
      }
    } catch {
      confirmedSelection = undefined;
    }
  }

  const content = confirmedSelection ? <ConfirmationView {...confirmedSelection} /> : <ConfirmationUnavailable />;
  const backHref = confirmedSelection
    ? `/shop/marketplace/${confirmedSelection.product.id}`
    : "/shop?tab=marketplace";
  const backLabel = confirmedSelection ? "Back to product details" : "Back to Marketplace";

  return (
    <AppShell>
      <FlowHeader backLabel={backLabel} href={backHref} />
      {content}
    </AppShell>
  );
}
