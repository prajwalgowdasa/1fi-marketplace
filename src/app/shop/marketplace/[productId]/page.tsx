import { QueryProvider } from "@/providers/query-provider";
import { ProductDetailContent } from "@/features/marketplace/components/product-experience";
import { AppShell } from "@/shared/components/app-shell";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  return (
    <AppShell>
      <QueryProvider><ProductDetailContent productId={productId} /></QueryProvider>
    </AppShell>
  );
}
