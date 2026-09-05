import type { ProductSummary } from "../domain/types";
import { ProductCard } from "./product-card";

export function ProductList({ products }: { products: ProductSummary[] }) {
  return <div className="space-y-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
