import { ZodError } from "zod";

import { catalogQuerySchema } from "@/features/marketplace/domain/schemas";
import { listProducts } from "@/features/marketplace/server/catalog";

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

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const filters = catalogQuerySchema.parse(Object.fromEntries(url.searchParams));
    const data = listProducts({ query: filters.q, category: filters.category });

    return json({
      data,
      meta: { total: data.length, query: filters.q, category: filters.category },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return json(
        {
          error: {
            code: "INVALID_QUERY",
            message: "The product query is invalid.",
            fieldErrors: fieldErrors(error),
          },
        },
        400,
      );
    }

    return json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, 500);
  }
}
