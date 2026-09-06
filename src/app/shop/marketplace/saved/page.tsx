import { SavedProductsView } from "@/features/marketplace/components/saved-products-view";
import { AppShell } from "@/shared/components/app-shell";
import { FlowHeader } from "@/shared/components/flow-header";

export default function SavedProductsPage() {
  return (
    <AppShell>
      <FlowHeader backLabel="Back to Marketplace" href="/shop?tab=marketplace" />
      <SavedProductsView />
    </AppShell>
  );
}
