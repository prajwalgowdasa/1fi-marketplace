export type ProductCategory = "smartphones" | "laptops" | "electronics";

export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductVariant = {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  pricePaise: number;
  stockStatus: "in_stock" | "out_of_stock";
};

export type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: ProductImage[];
  features: string[];
  originalPricePaise?: number;
  variants: ProductVariant[];
  eligibleTenures: number[];
};

export type EmiPlan = {
  tenureMonths: number;
  regularInstallmentPaise: number;
  finalInstallmentPaise: number;
  interestRatePercent: 0;
  totalPayablePaise: number;
};

export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "brand" | "name" | "category" | "images" | "eligibleTenures"
> & {
  startingPricePaise: number;
  startingEmi: EmiPlan;
};

export type MockOrderRequest = {
  productId: string;
  variantId: string;
  tenureMonths: number;
};

export type MockOrderConfirmation = {
  referenceId: string;
  productId: string;
  variantId: string;
  plan: EmiPlan;
};
