"use client";

import { Heart, Share2 } from "lucide-react";
import { useState } from "react";

import { shareProduct } from "../lib/share-product";
import { useSavedProduct } from "../hooks/use-saved-product";

type ProductActionsProps = {
  productId: string;
  productName: string;
  shareUrl?: string;
};

export function ProductActions({ productId, productName, shareUrl }: ProductActionsProps) {
  const { active, toggle } = useSavedProduct(productId);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const saveLabel = active ? `Remove ${productName} from saved products` : `Save ${productName}`;

  function handleSave() {
    const result = toggle();
    if (!result.active) {
      setStatusMessage("Removed from saved products.");
    } else if (!result.persistenceAvailable) {
      setStatusMessage("Saved for this visit only; browser storage is unavailable.");
    } else {
      setStatusMessage("Saved to your products");
    }
  }

  async function handleShare() {
    const outcome = await shareProduct({
      title: productName,
      text: `View ${productName} with 0% interest EMI options on 1Fi Marketplace.`,
      url: shareUrl ?? window.location.href,
    });

    if (outcome === "cancelled") return;

    setStatusMessage({
      shared: "Share sheet opened",
      copied: "Product link copied",
      unavailable: "Sharing is unavailable on this device",
    }[outcome]);
  }

  return (
    <div className="flex items-center gap-2">
      <button aria-label={saveLabel} aria-pressed={active} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-200)] text-[var(--ink-900)]" onClick={handleSave} type="button">
        <Heart aria-hidden="true" className={active ? "fill-current" : undefined} size={20} />
      </button>
      <button aria-label={`Share ${productName}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-200)] text-[var(--ink-900)]" onClick={handleShare} type="button">
        <Share2 aria-hidden="true" size={20} />
      </button>
      {statusMessage ? <p aria-live="polite" className="sr-only" role="status">{statusMessage}</p> : null}
    </div>
  );
}
