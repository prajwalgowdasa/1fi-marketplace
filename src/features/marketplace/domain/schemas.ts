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

function isRealIsoCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]!;
}

const reviewDateSchema = z
  .string()
  .trim()
  .refine(isRealIsoCalendarDate, "Review date must be a real ISO calendar date.");

const reviewSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    reviewer: z.string().trim().min(1).max(100),
    rating: ratingSchema,
    date: reviewDateSchema,
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
    if (distributionTotal === summary.totalCount && summary.totalCount > 0) {
      const weightedTotal = Object.entries(summary.distribution).reduce(
        (sum, [rating, count]) => sum + Number(rating) * count,
        0,
      );
      const aggregateAverage = Number((weightedTotal / summary.totalCount).toFixed(1));
      const displayedAverage = Number(summary.average.toFixed(1));
      if (aggregateAverage !== displayedAverage) {
        context.addIssue({
          code: "custom",
          path: ["average"],
          message: "Average must match the rounded rating distribution.",
        });
      }
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
          color: z.string().trim().min(1).max(80).optional(),
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
