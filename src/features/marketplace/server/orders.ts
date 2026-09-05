import "server-only";

import { randomUUID } from "node:crypto";

import { calculateEmiPlan } from "../domain/emi";
import type { MockOrderConfirmation, MockOrderRequest } from "../domain/types";
import { getProduct } from "./catalog";

export type OrderDomainErrorCode =
  | "PRODUCT_NOT_FOUND"
  | "INVALID_VARIANT"
  | "VARIANT_UNAVAILABLE"
  | "INVALID_TENURE";

export class OrderDomainError extends Error {
  readonly status = 422;

  constructor(
    readonly code: OrderDomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OrderDomainError";
  }
}

export function createMockOrder(input: MockOrderRequest): MockOrderConfirmation {
  const product = getProduct(input.productId);

  if (!product) {
    throw new OrderDomainError("PRODUCT_NOT_FOUND", "The selected product was not found.");
  }

  const variant = product.variants.find(({ id }) => id === input.variantId);

  if (!variant) {
    throw new OrderDomainError("INVALID_VARIANT", "The selected variant does not belong to this product.");
  }

  if (variant.stockStatus !== "in_stock") {
    throw new OrderDomainError("VARIANT_UNAVAILABLE", "The selected variant is unavailable.");
  }

  if (!product.eligibleTenures.includes(input.tenureMonths)) {
    throw new OrderDomainError("INVALID_TENURE", "The selected tenure is not available for this product.");
  }

  return {
    referenceId: `1FI-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`,
    productId: product.id,
    variantId: variant.id,
    plan: calculateEmiPlan(variant.pricePaise, input.tenureMonths),
  };
}
