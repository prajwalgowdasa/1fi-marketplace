import { calculateEmiPlan } from "../domain/emi";
import type { Product, ProductReviewSummary, ProductSummary } from "../domain/types";

function createCommerce() {
  return {
    seller: "1Fi Demo Partner",
    deliveryEstimate: "Estimated 2–4 business days",
    warranty: "1-year manufacturer warranty",
    returns: "7-day replacement for eligible defects",
  };
}

function createReviewSummary(productId: string, productName: string): ProductReviewSummary {
  return {
    average: 4.6,
    totalCount: 128,
    distribution: { "1": 2, "2": 3, "3": 9, "4": 28, "5": 86 },
    items: [
      { id: `${productId}-review-1`, reviewer: "Aarav M.", rating: 5, date: "2026-08-18", title: "Reliable for everyday use", body: `${productName} has felt responsive and dependable in daily use. The configuration matched the listing.`, helpfulCount: 24, verifiedPurchase: true },
      { id: `${productId}-review-2`, reviewer: "Meera S.", rating: 4, date: "2026-08-09", title: "Good overall experience", body: "The product arrived as described and setup was straightforward. Packaging and included accessories were in good condition.", helpfulCount: 15, verifiedPurchase: true },
      { id: `${productId}-review-3`, reviewer: "Kabir R.", rating: 5, date: "2026-07-27", title: "Matches the specifications", body: "Performance has matched the stated highlights so far. Variant and colour details were accurate.", helpfulCount: 11, verifiedPurchase: true },
    ],
  };
}

function freezeProduct(product: Omit<Product, "commerce" | "reviews">): Product {
  const productWithTrustData: Product = {
    ...product,
    commerce: createCommerce(),
    reviews: createReviewSummary(product.id, product.name),
  };

  productWithTrustData.images.forEach(Object.freeze);
  productWithTrustData.variants.forEach((variant) => {
    Object.freeze(variant.attributes);
    Object.freeze(variant);
  });
  Object.freeze(productWithTrustData.images);
  Object.freeze(productWithTrustData.features);
  Object.freeze(productWithTrustData.variants);
  Object.freeze(productWithTrustData.eligibleTenures);
  Object.freeze(productWithTrustData.commerce);
  productWithTrustData.reviews.items.forEach(Object.freeze);
  Object.freeze(productWithTrustData.reviews.items);
  Object.freeze(productWithTrustData.reviews.distribution);
  Object.freeze(productWithTrustData.reviews);
  return Object.freeze(productWithTrustData);
}

export const PRODUCTS: readonly Product[] = Object.freeze([
  freezeProduct({
    id: "iphone-17",
    slug: "iphone-17",
    brand: "Apple",
    name: "iPhone 17",
    category: "smartphones",
    description:
      "iPhone 17 brings a bright everyday display and a camera system built for reliable photos. Its lightweight design keeps performance and battery life close at hand.",
    images: [{ src: "/images/products/iphone-17.webp", alt: "Neutral black smartphone render" }],
    features: ["Advanced dual-camera system", "All-day battery life", "Bright edge-to-edge display"],
    variants: [
      { id: "iphone-17-128-black", sku: "IPH17-128-BLK", attributes: { storage: "128 GB", color: "Black" }, pricePaise: 7_990_000, stockStatus: "in_stock" },
      { id: "iphone-17-256-black", sku: "IPH17-256-BLK", attributes: { storage: "256 GB", color: "Black" }, pricePaise: 8_990_000, stockStatus: "in_stock" },
      { id: "iphone-17-128-blue", sku: "IPH17-128-BLU", attributes: { storage: "128 GB", color: "Blue" }, pricePaise: 7_990_000, stockStatus: "in_stock" },
    ],
    eligibleTenures: [6, 12, 24],
  }),
  freezeProduct({
    id: "pixel-10",
    slug: "pixel-10",
    brand: "Google",
    name: "Pixel 10",
    category: "smartphones",
    description:
      "Google Pixel 10 pairs a clean Android experience with an intelligent camera. It is tuned for quick everyday tasks and crisp photos in changing light.",
    images: [{ src: "/images/products/pixel-10.webp", alt: "Neutral dark smartphone render" }],
    features: ["Google Tensor performance", "Adaptive battery", "Advanced Pixel camera"],
    variants: [
      { id: "pixel-10-128-obsidian", sku: "PXL10-128-OBS", attributes: { storage: "128 GB", color: "Obsidian" }, pricePaise: 6_999_900, stockStatus: "in_stock" },
      { id: "pixel-10-256-porcelain", sku: "PXL10-256-POR", attributes: { storage: "256 GB", color: "Porcelain" }, pricePaise: 7_999_900, stockStatus: "out_of_stock" },
    ],
    eligibleTenures: [6, 12, 18],
  }),
  freezeProduct({
    id: "galaxy-s25-ultra",
    slug: "galaxy-s25-ultra",
    brand: "Samsung",
    name: "Galaxy S25 Ultra",
    category: "smartphones",
    description:
      "Galaxy S25 Ultra combines a large premium screen with a versatile camera system. The built-in S Pen makes notes and precise edits feel natural.",
    images: [{ src: "/images/products/galaxy-s25-ultra.webp", alt: "Neutral titanium smartphone render" }],
    features: ["Built-in S Pen", "200 MP camera", "Large AMOLED display"],
    variants: [
      { id: "galaxy-s25-ultra-256-grey", sku: "GS25U-256-TGR", attributes: { storage: "256 GB", color: "Titanium Grey" }, pricePaise: 11_999_900, stockStatus: "in_stock" },
      { id: "galaxy-s25-ultra-512-black", sku: "GS25U-512-TBK", attributes: { storage: "512 GB", color: "Titanium Black" }, pricePaise: 12_999_900, stockStatus: "in_stock" },
    ],
    eligibleTenures: [12, 18, 24],
  }),
  freezeProduct({
    id: "oneplus-15",
    slug: "oneplus-15",
    brand: "OnePlus",
    name: "OnePlus 15",
    category: "smartphones",
    description:
      "OnePlus 15 is designed for fast, fluid mobile use with a responsive display. Its ample storage options make room for apps, photos, and video.",
    images: [{ src: "/images/products/oneplus-15.webp", alt: "Neutral black smartphone render" }],
    features: ["Fast charging", "High-refresh display", "Flagship performance"],
    variants: [
      { id: "oneplus-15-256-black", sku: "OP15-256-IBK", attributes: { storage: "256 GB", color: "Infinite Black" }, pricePaise: 6_499_900, stockStatus: "in_stock" },
      { id: "oneplus-15-512-sandstone", sku: "OP15-512-SND", attributes: { storage: "512 GB", color: "Sandstone" }, pricePaise: 7_499_900, stockStatus: "in_stock" },
    ],
    eligibleTenures: [6, 12, 18],
  }),
  freezeProduct({
    id: "macbook-air",
    slug: "macbook-air",
    brand: "Apple",
    name: "MacBook Air",
    category: "laptops",
    description:
      "MacBook Air delivers quiet performance in a thin, portable notebook. Its long battery life supports work, study, and creative tasks away from a desk.",
    images: [{ src: "/images/products/macbook-air.webp", alt: "Neutral midnight laptop render" }],
    features: ["Lightweight aluminum enclosure", "Long battery life", "Liquid Retina display"],
    variants: [
      { id: "macbook-air-16-256-midnight", sku: "MBA-16-256-MDN", attributes: { memory: "16 GB", storage: "256 GB", color: "Midnight" }, pricePaise: 9_990_000, stockStatus: "in_stock" },
      { id: "macbook-air-16-512-starlight", sku: "MBA-16-512-STL", attributes: { memory: "16 GB", storage: "512 GB", color: "Starlight" }, pricePaise: 11_990_000, stockStatus: "in_stock" },
    ],
    eligibleTenures: [12, 18, 24],
  }),
  freezeProduct({
    id: "macbook-pro",
    slug: "macbook-pro",
    brand: "Apple",
    name: "MacBook Pro",
    category: "laptops",
    description:
      "MacBook Pro is built for demanding creative and development workflows. Its high-performance hardware and expansive display make complex projects easier to manage.",
    images: [{ src: "/images/products/macbook-pro.webp", alt: "Neutral space-black laptop render" }],
    features: ["Pro-grade performance", "High-resolution display", "Versatile port selection"],
    variants: [
      { id: "macbook-pro-16-512-space-black", sku: "MBP-16-512-SPB", attributes: { memory: "16 GB", storage: "512 GB", color: "Space Black" }, pricePaise: 16_990_000, stockStatus: "in_stock" },
      { id: "macbook-pro-24-1tb-silver", sku: "MBP-24-1TB-SLV", attributes: { memory: "24 GB", storage: "1 TB", color: "Silver" }, pricePaise: 20_990_000, stockStatus: "in_stock" },
    ],
    eligibleTenures: [12, 24],
  }),
  freezeProduct({
    id: "asus-zenbook-14",
    slug: "asus-zenbook-14",
    brand: "ASUS",
    name: "Zenbook 14",
    category: "laptops",
    description:
      "ASUS Zenbook 14 brings a compact premium design to everyday productivity. The 14-inch display and flexible configurations suit work that moves between home and office.",
    images: [{ src: "/images/products/asus-zenbook-14.webp", alt: "Neutral blue laptop render" }],
    features: ["Portable 14-inch design", "OLED display", "Fast PCIe storage"],
    variants: [
      { id: "asus-zenbook-14-16-512-ponder-blue", sku: "ZB14-16-512-PBL", attributes: { memory: "16 GB", storage: "512 GB", color: "Ponder Blue" }, pricePaise: 8_999_000, stockStatus: "in_stock" },
      { id: "asus-zenbook-14-32-1tb-foggy-silver", sku: "ZB14-32-1TB-FSL", attributes: { memory: "32 GB", storage: "1 TB", color: "Foggy Silver" }, pricePaise: 10_999_000, stockStatus: "in_stock" },
    ],
    eligibleTenures: [6, 12, 18],
  }),
  freezeProduct({
    id: "sony-wh-1000xm6",
    slug: "sony-wh-1000xm6",
    brand: "Sony",
    name: "WH-1000XM6",
    category: "electronics",
    description:
      "Sony WH-1000XM6 headphones create a focused listening space with active noise cancellation. Comfortable earcups and long battery life are ready for commutes and flights.",
    images: [{ src: "/images/products/sony-wh-1000xm6.webp", alt: "Neutral over-ear headphones render" }],
    features: ["Industry-leading noise cancellation", "Long battery life", "Premium wireless audio"],
    variants: [
      { id: "sony-wh-1000xm6-black", sku: "WH1000XM6-BLK", attributes: { color: "Black" }, pricePaise: 3_499_000, stockStatus: "in_stock" },
      { id: "sony-wh-1000xm6-platinum-silver", sku: "WH1000XM6-PSL", attributes: { color: "Platinum Silver" }, pricePaise: 3_499_000, stockStatus: "in_stock" },
    ],
    eligibleTenures: [3, 6, 12],
  }),
]);

export function toProductSummary(product: Product): ProductSummary {
  const startingPricePaise = Math.min(
    ...product.variants
      .filter(({ stockStatus }) => stockStatus === "in_stock")
      .map(({ pricePaise }) => pricePaise),
  );

  return {
    id: product.id,
    slug: product.slug,
    brand: product.brand,
    name: product.name,
    category: product.category,
    images: product.images,
    eligibleTenures: product.eligibleTenures,
    startingPricePaise,
    startingEmi: calculateEmiPlan(startingPricePaise, Math.max(...product.eligibleTenures)),
  };
}
