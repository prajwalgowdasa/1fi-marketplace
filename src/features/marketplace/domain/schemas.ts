import { z } from "zod";

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
