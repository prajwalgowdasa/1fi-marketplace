"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { EmptyState } from "@/shared/components/empty-state";
import { ShopHero } from "@/shared/components/shop-hero";
import { ShopTabs, type ShopTab } from "@/shared/components/shop-tabs";
import { CatalogView } from "@/features/marketplace/components/catalog-view";

const validTabs = new Set<ShopTab>([
  "top-brands",
  "nearby-stores",
  "marketplace",
]);

const panelContent = {
  "top-brands": (
    <EmptyState title="Top Brands">
      Top Brands is outside this assignment. The Shop frame is ready for that
      experience.
    </EmptyState>
  ),
  "nearby-stores": (
    <EmptyState title="Nearby Stores">
      Nearby Stores is outside this assignment. The Shop frame is ready for that
      experience.
    </EmptyState>
  ),
  marketplace: <CatalogView />,
} satisfies Record<ShopTab, ReactNode>;

function ShopPanels({ activeTab }: { activeTab: ShopTab }) {
  return (
    <>
      {(Object.keys(panelContent) as ShopTab[]).map((tab) => (
        <section
          aria-labelledby={`shop-tab-${tab}`}
          className="pt-1"
          hidden={activeTab !== tab}
          id={`shop-panel-${tab}`}
          key={tab}
          role="tabpanel"
        >
          {panelContent[tab]}
        </section>
      ))}
    </>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: ShopTab =
    requestedTab && validTabs.has(requestedTab as ShopTab)
      ? (requestedTab as ShopTab)
      : "marketplace";

  function changeTab(tab: ShopTab) {
    router.replace(`/shop?tab=${tab}`);
  }

  return (
    <AppShell>
      <ShopHero />
      <ShopTabs activeTab={activeTab} onTabChange={changeTab} />
      <div className="pt-1">
        <ShopPanels activeTab={activeTab} />
      </div>
    </AppShell>
  );
}
