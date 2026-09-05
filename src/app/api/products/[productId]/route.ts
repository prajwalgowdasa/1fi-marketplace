import { getProduct } from "@/features/marketplace/server/catalog";

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: noStoreHeaders });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
): Promise<Response> {
  try {
    const { productId } = await params;
    const product = getProduct(productId);

    if (!product) {
      return json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "The requested product was not found." } },
        404,
      );
    }

    return json({ data: product });
  } catch {
    return json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } }, 500);
  }
}
