import { z } from "zod";

import type { Product, Rating } from "./types";

export const productCategorySchema = z.enum(["smartphones", "laptops", "electronics"]);

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  category: z.union([productCategorySchema, z.literal("all")]).default("all"),
});

export const orderRequestSchema = z
  .object({
    productId: z.string().min(1).max(80),
    variantId: z.string().min(1).max(100),
    tenureMonths: z.number().int().positive().max(120),
  })
  .strict();

export const confirmationQuerySchema = orderRequestSchema.extend({
  referenceId: z.string().regex(/^1FI-[A-F0-9]{8}$/),
});

const ratingSchema = z
  .number()
  .int()
  .min(1)
  .max(5)
  .transform((rating): Rating => rating as Rating);

const reviewSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    reviewer: z.string().trim().min(1).max(100),
    rating: ratingSchema,
    date: z.string().trim().min(1).max(20),
    title: z.string().trim().min(1).max(160),
    body: z.string().trim().min(1).max(1_000),
    helpfulCount: z.number().int().nonnegative(),
    verifiedPurchase: z.literal(true),
  })
  .strict();

const reviewSummarySchema = z
  .object({
    average: z.number().min(1).max(5),
    totalCount: z.number().int().nonnegative(),
    distribution: z
      .object({
        "1": z.number().int().nonnegative(),
        "2": z.number().int().nonnegative(),
        "3": z.number().int().nonnegative(),
        "4": z.number().int().nonnegative(),
        "5": z.number().int().nonnegative(),
      })
      .strict(),
    items: z.array(reviewSchema),
  })
  .strict()
  .superRefine((summary, context) => {
    const distributionTotal = Object.values(summary.distribution).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (distributionTotal > summary.totalCount) {
      context.addIssue({
        code: "custom",
        path: ["distribution"],
        message: "Rating distribution cannot exceed total reviews.",
      });
    }
  });

const commerceSchema = z
  .object({
    seller: z.string().trim().min(1).max(100),
    deliveryEstimate: z.string().trim().min(1).max(160),
    warranty: z.string().trim().min(1).max(160),
    returns: z.string().trim().min(1).max(160),
  })
  .strict();

const productSchemaBase = z
  .object({
    id: z.string().trim().min(1).max(80),
    slug: z.string().trim().min(1).max(120),
    brand: z.string().trim().min(1).max(80),
    name: z.string().trim().min(1).max(160),
    category: productCategorySchema,
    description: z.string().trim().min(1).max(1_000),
    images: z.array(
      z
        .object({
          src: z.string().trim().min(1).max(500),
          alt: z.string().trim().min(1).max(200),
        })
        .strict(),
    ),
    features: z.array(z.string().trim().min(1).max(200)),
    originalPricePaise: z.number().int().positive().optional(),
    variants: z.array(
      z
        .object({
          id: z.string().trim().min(1).max(100),
          sku: z.string().trim().min(1).max(100),
          attributes: z.record(z.string(), z.string()),
          pricePaise: z.number().int().positive(),
          stockStatus: z.enum(["in_stock", "out_of_stock"]),
        })
        .strict(),
    ),
    eligibleTenures: z.array(z.number().int().positive().max(120)),
    commerce: commerceSchema,
    reviews: reviewSummarySchema,
  })
  .strict();

export const productSchema: z.ZodType<Product> = productSchemaBase.transform((product) => {
  if (product.originalPricePaise === undefined) {
    const productWithoutOriginalPrice = { ...product };
    delete productWithoutOriginalPrice.originalPricePaise;
    return productWithoutOriginalPrice as Product;
  }

  return product as Product;
});
