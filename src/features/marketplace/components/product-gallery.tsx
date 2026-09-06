"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "../domain/types";

export function ProductGallery({
  images,
  selectedColor,
}: {
  images: readonly ProductImage[];
  selectedColor?: string | undefined;
}) {
  const matchingColorIndex = selectedColor
    ? images.findIndex((image) => image.color === selectedColor)
    : -1;
  const [selectedIndex, setSelectedIndex] = useState(
    matchingColorIndex >= 0 ? matchingColorIndex : 0,
  );
  const [failedImages, setFailedImages] = useState<ReadonlySet<number>>(() => new Set());
  const selectedImage = images[selectedIndex] ?? images[0];

  if (!selectedImage) return null;

  const src = failedImages.has(selectedIndex) ? "/images/product-placeholder.svg" : selectedImage.src;
  const markFailed = (index: number) => setFailedImages((current) => new Set(current).add(index));
  return (
    <section aria-label="Product images">
      <div className="overflow-hidden rounded-3xl bg-[var(--brand-050)]">
        <Image alt={selectedImage.alt} className="aspect-square w-full object-cover" height={460} onError={() => markFailed(selectedIndex)} src={src} width={460} />
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex list-none gap-3">
          {images.map((image, index) => (
            <li key={image.src}>
              <button aria-label={`View ${image.alt}`} aria-pressed={selectedIndex === index} className="min-h-11 min-w-11 overflow-hidden rounded-xl border-2 border-transparent aria-[pressed=true]:border-[var(--brand-500)]" onClick={() => setSelectedIndex(index)} type="button">
                <Image alt="" className="h-11 w-11 object-cover" height={44} onError={() => markFailed(index)} src={failedImages.has(index) ? "/images/product-placeholder.svg" : image.src} width={44} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
