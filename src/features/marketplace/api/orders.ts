import type { MockOrderConfirmation, MockOrderRequest } from "../domain/types";
import { requestJson } from "@/shared/lib/api-client";

export function createOrder(request: MockOrderRequest, signal?: AbortSignal): Promise<{ data: MockOrderConfirmation }> {
  return requestJson<{ data: MockOrderConfirmation }>("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
    ...(signal ? { signal } : {}),
  });
}
