import { ZodError } from "zod";

import { orderRequestSchema } from "@/features/marketplace/domain/schemas";
import { createMockOrder, OrderDomainError } from "@/features/marketplace/server/orders";

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: noStoreHeaders });
}

function fieldErrors(error: ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path.join(".") || "form";
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ error: { code: "INVALID_JSON", message: "The request body must be valid JSON." } }, 400);
  }

  try {
    const input = orderRequestSchema.parse(payload);
    return json({ data: createMockOrder(input) }, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return json(
        {
          error: {
            code: "INVALID_ORDER",
            message: "The order request is invalid.",
            fieldErrors: fieldErrors(error),
          },
        },
        400,
      );
    }

    if (error instanceof OrderDomainError) {
      return json({ error: { code: error.code, message: error.message } }, error.status);
    }

    return json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, 500);
  }
}
