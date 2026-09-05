"use client";

import { useMutation } from "@tanstack/react-query";

import { createOrder } from "../api/orders";
import type { MockOrderRequest } from "../domain/types";

export function useCreateOrder() {
  return useMutation({ mutationFn: (request: MockOrderRequest) => createOrder(request) });
}
