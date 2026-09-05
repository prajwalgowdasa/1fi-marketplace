# Trust-First Product Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Share, Save, transparent 1Fi affordability guidance, purchase-confidence information, curated reviews with Helpful voting, and related products without changing the existing checkout sequence.

**Architecture:** Extend the validated product domain with commerce and review facts, return related summaries with the detail response, and compose small focused product-detail components. Browser sharing and versioned local persistence are isolated behind typed adapters so unavailable APIs or storage failures never interrupt variant selection or EMI checkout.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Zod 4, TanStack Query 5, Vitest, Testing Library, Playwright, axe-core.

**Spec:** `docs/superpowers/specs/2026-09-05-trust-first-product-experience-design.md`

## Global Constraints

- Keep the project an independent frontend demonstration with no live 1Fi, lender, merchant, account, portfolio, or order integration.
- Preserve the Product → EMI plans → Confirmation sequence and existing one-step back navigation.
- Do not show investment-return projections or imply guaranteed savings from future mutual-fund performance.
- Label commerce and verified-review fixtures as demonstration data in the UI.
- Use paise integers and the existing `calculateEmiPlan` function for every displayed payment value.
- Use 44-pixel minimum interactive targets, stable accessible names, polite live status messages, and reduced-motion-safe styling.
- Add no new runtime dependency.
- The project directory currently has no Git repository. Run each verification checkpoint; run the listed commit only after repository initialization is separately authorized.

---

## File Map

### Domain and data

- Modify `src/features/marketplace/domain/types.ts`: commerce, review, rating, and product-detail response types.
- Modify `src/features/marketplace/domain/schemas.ts`: strict runtime validation for expanded product detail data.
- Modify `src/features/marketplace/data/products.ts`: deterministic demonstration commerce and curated review fixtures.
- Create `src/features/marketplace/domain/related-products.ts`: pure related-product selection.
- Modify `src/features/marketplace/server/catalog.ts`: expose related summaries.
- Modify `src/app/api/products/[productId]/route.ts`: validate and return `{ data, related }`.
- Modify `src/features/marketplace/api/products.ts`: consume the expanded response contract.

### Browser capabilities and state

- Create `src/features/marketplace/lib/share-product.ts`: native-share and clipboard capability adapter.
- Create `src/features/marketplace/hooks/use-persisted-toggle.ts`: SSR-safe versioned set persistence.
- Create `src/features/marketplace/hooks/use-saved-product.ts`: saved-product wrapper.
- Create `src/features/marketplace/hooks/use-helpful-reviews.ts`: review-vote wrapper.

### Product-detail UI

- Create `src/features/marketplace/components/product-actions.tsx`: Share and Save controls and announcements.
- Create `src/features/marketplace/components/affordability-card.tsx`: exact EMI decision support and financing disclosure.
- Create `src/features/marketplace/components/purchase-confidence.tsx`: commerce facts and role separation.
- Create `src/features/marketplace/components/rating-stars.tsx`: reusable visual rating with a text equivalent supplied by its caller.
- Create `src/features/marketplace/components/review-card.tsx`: presentational verified-review card.
- Create `src/features/marketplace/components/product-reviews.tsx`: aggregate ratings and Helpful state.
- Create `src/features/marketplace/components/related-products.tsx`: horizontal product recommendations.
- Modify `src/features/marketplace/components/product-summary.tsx`: rating anchor and action-row composition.
- Modify `src/features/marketplace/components/product-experience.tsx`: compose the approved section order and pass related summaries.

### Tests and documentation

- Add focused domain, hook, adapter, and component tests beside their subjects.
- Modify `tests/e2e/marketplace.spec.ts` and `tests/e2e/accessibility.spec.ts`.
- Modify `README.md` and refresh `docs/screenshots/product-details.png` only through the existing Playwright capture path.

---

### Task 1: Expand and validate the product domain

**Files:**
- Modify: `src/features/marketplace/domain/types.ts`
- Modify: `src/features/marketplace/domain/schemas.ts`
- Modify: `src/features/marketplace/data/products.ts`
- Test: `src/features/marketplace/domain/__tests__/schemas.test.ts`

**Interfaces:**
- Produces: `Rating`, `RatingDistribution`, `ProductCommerce`, `ProductReview`, `ProductReviewSummary`, and expanded `Product`.
- Produces: `productSchema: z.ZodType<Product>`.
- Consumes: existing `Product`, variant and category definitions.

- [ ] **Step 1: Write the failing schema tests**

Add assertions equivalent to:

```ts
expect(PRODUCTS.every((product) => productSchema.safeParse(product).success)).toBe(true);

const invalidRating = structuredClone(PRODUCTS[0]);
invalidRating.reviews.items[0].rating = 6 as 5;
expect(productSchema.safeParse(invalidRating).success).toBe(false);

const invalidDistribution = structuredClone(PRODUCTS[0]);
invalidDistribution.reviews.totalCount = 2;
expect(productSchema.safeParse(invalidDistribution).success).toBe(false);
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run: `pnpm vitest run src/features/marketplace/domain/__tests__/schemas.test.ts`

Expected: FAIL because `productSchema` and expanded fixture properties do not exist.

- [ ] **Step 3: Add exact domain types**

Add:

```ts
export type Rating = 1 | 2 | 3 | 4 | 5;
export type RatingDistribution = Record<"1" | "2" | "3" | "4" | "5", number>;

export type ProductCommerce = {
  seller: string;
  deliveryEstimate: string;
  warranty: string;
  returns: string;
};

export type ProductReview = {
  id: string;
  reviewer: string;
  rating: Rating;
  date: string;
  title: string;
  body: string;
  helpfulCount: number;
  verifiedPurchase: true;
};

export type ProductReviewSummary = {
  average: number;
  totalCount: number;
  distribution: RatingDistribution;
  items: ProductReview[];
};
```

Extend `Product` with `commerce: ProductCommerce` and `reviews: ProductReviewSummary`.

- [ ] **Step 4: Add strict schemas and cross-field validation**

Define rating, commerce, review and product schemas. Refine review summaries with:

```ts
const distributionTotal = Object.values(summary.distribution).reduce((sum, count) => sum + count, 0);
if (distributionTotal > summary.totalCount) {
  context.addIssue({
    code: "custom",
    path: ["distribution"],
    message: "Rating distribution cannot exceed total reviews.",
  });
}
```

Use `z.number().int().min(1).max(5)` for item ratings, `z.number().min(1).max(5)` for the average, non-negative integers for counts, non-empty bounded strings for display copy, and `z.literal(true)` for `verifiedPurchase`.

- [ ] **Step 5: Add deterministic demonstration fixtures**

Create a helper that returns the same valid aggregate shape with product-specific IDs and names:

```ts
function createReviewSummary(productId: string, productName: string): ProductReviewSummary {
  return {
    average: 4.6,
    totalCount: 128,
    distribution: { "1": 2, "2": 3, "3": 9, "4": 28, "5": 86 },
    items: [
      { id: `${productId}-review-1`, reviewer: "Aarav M.", rating: 5, date: "2026-08-18", title: "Reliable for everyday use", body: `${productName} has felt responsive and dependable in daily use. The configuration matched the listing.`, helpfulCount: 24, verifiedPurchase: true },
      { id: `${productId}-review-2`, reviewer: "Meera S.", rating: 4, date: "2026-08-09", title: "Good overall experience", body: "The product arrived as described and setup was straightforward. Packaging and included accessories were in good condition.", helpfulCount: 15, verifiedPurchase: true },
      { id: `${productId}-review-3`, reviewer: "Kabir R.", rating: 5, date: "2026-07-27", title: "Matches the specifications", body: "Performance has matched the stated highlights so far. Variant and colour details were accurate.", helpfulCount: 11, verifiedPurchase: true },
    ],
  };
}
```

Give each product `commerce` with seller `1Fi Demo Partner`, delivery `Estimated 2–4 business days`, warranty `1-year manufacturer warranty`, and returns `7-day replacement for eligible defects`. Use `createReviewSummary(product.id, product.name)` while constructing each frozen product, and freeze nested commerce, review, distribution and review-item objects in `freezeProduct`.

- [ ] **Step 6: Run the focused tests and domain suite**

Run: `pnpm vitest run src/features/marketplace/domain/__tests__`

Expected: PASS with all product fixtures accepted and both invalid cross-field examples rejected.

- [ ] **Step 7: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/domain src/features/marketplace/data/products.ts
git commit -m "feat: add marketplace trust data"
```

---

### Task 2: Return deterministic related products from the detail API

**Files:**
- Create: `src/features/marketplace/domain/related-products.ts`
- Create: `src/features/marketplace/domain/__tests__/related-products.test.ts`
- Modify: `src/features/marketplace/server/catalog.ts`
- Modify: `src/app/api/products/[productId]/route.ts`
- Modify: `src/app/api/products/[productId]/__tests__/route.test.ts`
- Modify: `src/features/marketplace/api/products.ts`

**Interfaces:**
- Consumes: `ProductSummary[]`, `ProductCategory`, and `productSchema` from Task 1.
- Produces: `getRelatedProducts(products, currentProductId, category, limit?): ProductSummary[]`.
- Produces: `listRelatedProducts(productId, limit?): ProductSummary[]`.
- Produces: `ProductDetailResponse = { data: Product; related: ProductSummary[] }`.

- [ ] **Step 1: Write the failing pure-function test**

```ts
const summaries = PRODUCTS.map(toProductSummary);
const related = getRelatedProducts(summaries, "iphone-17", "smartphones", 3);

expect(related).toHaveLength(3);
expect(related.every(({ category }) => category === "smartphones")).toBe(true);
expect(related.some(({ id }) => id === "iphone-17")).toBe(false);
expect(related.map(({ id }) => id)).toEqual(["pixel-10", "galaxy-s25-ultra", "oneplus-15"]);
```

- [ ] **Step 2: Verify the missing-function failure**

Run: `pnpm vitest run src/features/marketplace/domain/__tests__/related-products.test.ts`

Expected: FAIL because `getRelatedProducts` does not exist.

- [ ] **Step 3: Implement the pure selector**

```ts
export function getRelatedProducts(
  products: readonly ProductSummary[],
  currentProductId: string,
  category: ProductCategory,
  limit = 3,
): ProductSummary[] {
  if (!Number.isInteger(limit) || limit <= 0) return [];
  return products
    .filter((product) => product.id !== currentProductId && product.category === category)
    .slice(0, limit);
}
```

- [ ] **Step 4: Extend the API route test first**

Assert that the iPhone detail response contains three related smartphones, excludes `iphone-17`, and that `productSchema.parse(body.data)` succeeds.

- [ ] **Step 5: Implement the server and client contracts**

In the catalogue server, map `PRODUCTS` through `toProductSummary` and delegate to `getRelatedProducts`. In the detail route, validate the product and return:

```ts
return json({
  data: productSchema.parse(product),
  related: listRelatedProducts(product.id),
});
```

In the API client export:

```ts
export type ProductDetailResponse = {
  data: Product;
  related: ProductSummary[];
};

export function fetchProduct(productId: string, signal?: AbortSignal): Promise<ProductDetailResponse> {
  return requestJson<ProductDetailResponse>(
    `/api/products/${encodeURIComponent(productId)}`,
    signal ? { signal } : {},
  );
}
```

- [ ] **Step 6: Run domain, API-route, and API-client tests**

Run: `pnpm vitest run src/features/marketplace/domain/__tests__/related-products.test.ts src/app/api/products/[productId]/__tests__/route.test.ts src/features/marketplace/api/__tests__/products.test.ts`

Expected: PASS.

- [ ] **Step 7: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/domain/related-products.ts src/features/marketplace/domain/__tests__/related-products.test.ts src/features/marketplace/server/catalog.ts src/app/api/products src/features/marketplace/api/products.ts src/features/marketplace/api/__tests__/products.test.ts
git commit -m "feat: return related marketplace products"
```

---

### Task 3: Add resilient versioned local persistence

**Files:**
- Create: `src/features/marketplace/hooks/use-persisted-toggle.ts`
- Create: `src/features/marketplace/hooks/use-saved-product.ts`
- Create: `src/features/marketplace/hooks/use-helpful-reviews.ts`
- Create: `src/features/marketplace/hooks/__tests__/use-persisted-toggle.test.tsx`

**Interfaces:**
- Produces: `PersistedToggleState = { active: boolean; persistenceAvailable: boolean; toggle(): void }`.
- Produces: `usePersistedToggle(storageKey, itemId): PersistedToggleState`.
- Produces: `useSavedProduct(productId): PersistedToggleState` using `1fi.marketplace.saved-products.v1`.
- Produces: `useHelpfulReview(reviewId): PersistedToggleState` using `1fi.marketplace.helpful-reviews.v1`.

- [ ] **Step 1: Write failing hook tests**

Use `renderHook` and `act` to cover these exact outcomes:

```ts
const { result } = renderHook(() => useSavedProduct("iphone-17"));
await waitFor(() => expect(result.current.active).toBe(false));
act(() => result.current.toggle());
expect(result.current.active).toBe(true);
expect(JSON.parse(localStorage.getItem("1fi.marketplace.saved-products.v1")!)).toEqual(["iphone-17"]);
```

Also seed malformed JSON and expect inactive state without a thrown render error. Mock `Storage.prototype.setItem` to throw, toggle once, then expect `active` to be true and `persistenceAvailable` to be false.

- [ ] **Step 2: Verify the hook tests fail**

Run: `pnpm vitest run src/features/marketplace/hooks/__tests__/use-persisted-toggle.test.tsx`

Expected: FAIL because the hooks do not exist.

- [ ] **Step 3: Implement the base hook and wrappers**

The base hook must:

```ts
export type PersistedToggleState = {
  active: boolean;
  persistenceAvailable: boolean;
  toggle: () => void;
};
```

Use `useEffect` to read after mount, accept only arrays whose entries are strings, and store state as `Set<string>`. `toggle` must update in memory first, then attempt to serialise a sorted array. Catch read errors as empty state and catch write errors by setting `persistenceAvailable` to false.

The wrappers are exact delegates:

```ts
export const SAVED_PRODUCTS_KEY = "1fi.marketplace.saved-products.v1";
export function useSavedProduct(productId: string) {
  return usePersistedToggle(SAVED_PRODUCTS_KEY, productId);
}

export const HELPFUL_REVIEWS_KEY = "1fi.marketplace.helpful-reviews.v1";
export function useHelpfulReview(reviewId: string) {
  return usePersistedToggle(HELPFUL_REVIEWS_KEY, reviewId);
}
```

- [ ] **Step 4: Run the hook tests**

Run: `pnpm vitest run src/features/marketplace/hooks/__tests__/use-persisted-toggle.test.tsx`

Expected: PASS for normal, malformed-storage, and failed-write cases.

- [ ] **Step 5: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/hooks
git commit -m "feat: persist marketplace preferences safely"
```

---

### Task 4: Add native Share and saved-product actions

**Files:**
- Create: `src/features/marketplace/lib/share-product.ts`
- Create: `src/features/marketplace/lib/__tests__/share-product.test.ts`
- Create: `src/features/marketplace/components/product-actions.tsx`
- Create: `src/features/marketplace/components/__tests__/product-actions.test.tsx`
- Modify: `src/features/marketplace/components/product-summary.tsx`
- Modify: `src/features/marketplace/components/__tests__/product-summary.test.tsx`

**Interfaces:**
- Consumes: `useSavedProduct(productId)` from Task 3 and `ProductReviewSummary` from Task 1.
- Produces: `ShareOutcome = "shared" | "copied" | "cancelled" | "unavailable"`.
- Produces: `shareProduct(payload, environment?): Promise<ShareOutcome>`.
- Produces: `ProductActions({ productId, productName, shareUrl? })`.
- Changes: `ProductSummary` props to include `shareUrl?: string` while using `product.reviews` directly.

- [ ] **Step 1: Write failing adapter tests**

Cover native share, clipboard fallback, cancellation, and failure:

```ts
await expect(shareProduct(payload, { share: vi.fn().mockResolvedValue(undefined) })).resolves.toBe("shared");
await expect(shareProduct(payload, { writeText: vi.fn().mockResolvedValue(undefined) })).resolves.toBe("copied");
await expect(shareProduct(payload, { share: vi.fn().mockRejectedValue(new DOMException("cancelled", "AbortError")) })).resolves.toBe("cancelled");
await expect(shareProduct(payload, {})).resolves.toBe("unavailable");
```

- [ ] **Step 2: Run and verify the adapter test fails**

Run: `pnpm vitest run src/features/marketplace/lib/__tests__/share-product.test.ts`

Expected: FAIL because the adapter is missing.

- [ ] **Step 3: Implement the typed capability adapter**

Use injected capabilities in tests and browser defaults in production. Attempt `share` first. Treat only an `AbortError` as `cancelled`; if native Share fails for another reason, try `writeText`. Return `unavailable` only after no available path succeeds.

- [ ] **Step 4: Write failing ProductActions tests**

Assert:

```ts
expect(screen.getByRole("button", { name: "Save iPhone 17" })).toHaveAttribute("aria-pressed", "false");
await user.click(screen.getByRole("button", { name: "Save iPhone 17" }));
expect(screen.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("status")).toHaveTextContent("Saved to your products");
```

Mock `shareProduct` to return each outcome and assert “Share sheet opened”, “Product link copied”, no message for cancellation, and “Sharing is unavailable on this device” respectively.

- [ ] **Step 5: Implement ProductActions and summary composition**

Render Heart and Share2 icons inside 44-pixel circular buttons. Set `aria-pressed` on Save, compute the canonical URL from `shareUrl ?? window.location.href`, and provide the payload:

```ts
{
  title: productName,
  text: `View ${productName} with 0% interest EMI options on 1Fi Marketplace.`,
  url: canonicalUrl,
}
```

In `ProductSummary`, place the action row beside the brand and add:

```tsx
<a className="inline-flex min-h-11 items-center gap-2" href="#product-reviews">
  <span aria-hidden="true">★</span>
  <span>{product.reviews.average.toFixed(1)} · {product.reviews.totalCount} reviews</span>
</a>
```

- [ ] **Step 6: Run adapter, action and summary tests**

Run: `pnpm vitest run src/features/marketplace/lib/__tests__/share-product.test.ts src/features/marketplace/components/__tests__/product-actions.test.tsx src/features/marketplace/components/__tests__/product-summary.test.tsx`

Expected: PASS.

- [ ] **Step 7: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/lib src/features/marketplace/components/product-actions.tsx src/features/marketplace/components/product-summary.tsx src/features/marketplace/components/__tests__
git commit -m "feat: add marketplace share and save actions"
```

---

### Task 5: Add affordability and purchase-confidence cards

**Files:**
- Create: `src/features/marketplace/components/affordability-card.tsx`
- Create: `src/features/marketplace/components/purchase-confidence.tsx`
- Create: `src/features/marketplace/components/__tests__/affordability-card.test.tsx`
- Create: `src/features/marketplace/components/__tests__/purchase-confidence.test.tsx`

**Interfaces:**
- Consumes: `calculateEmiPlan`, `formatInr`, and `ProductCommerce`.
- Produces: `AffordabilityCard({ pricePaise, tenureMonths })`.
- Produces: `PurchaseConfidence({ commerce })`.

- [ ] **Step 1: Write failing affordability tests**

For `pricePaise={7_990_000}` and `tenureMonths={24}`, assert “Pay smarter with 1Fi”, “From ₹3,329.16/month”, “0% interest”, “Total payable ₹79,900”, and the disclosure button “How 1Fi financing works”. Click the disclosure and assert lender approval, lien marking, and market-value/LTV risk copy becomes visible.

- [ ] **Step 2: Verify the affordability test fails**

Run: `pnpm vitest run src/features/marketplace/components/__tests__/affordability-card.test.tsx`

Expected: FAIL because `AffordabilityCard` is missing.

- [ ] **Step 3: Implement the affordability card**

Compute `const plan = calculateEmiPlan(pricePaise, tenureMonths)`. Use a semantic section, exact formatted values, three fact rows, and a native `<details>` with `<summary>How 1Fi financing works</summary>`. State that selected eligible units may be lien-marked, the limit depends on lender approval and eligible holdings, and falling market value can require more collateral or partial repayment.

- [ ] **Step 4: Write and run the failing confidence test**

Render the fixture commerce value and assert all four labels and values plus this exact responsibility statement:

```text
The merchant handles product availability, delivery, quality, warranty, cancellations and refunds. 1Fi enables the financing journey.
```

Run: `pnpm vitest run src/features/marketplace/components/__tests__/purchase-confidence.test.tsx`

Expected: FAIL because `PurchaseConfidence` is missing.

- [ ] **Step 5: Implement PurchaseConfidence**

Use a labelled section and `<dl>` rows for Sold by, Estimated delivery, Warranty and Returns. Include a visible “Demo information” badge beside the heading and the exact responsibility statement from Step 4.

- [ ] **Step 6: Run both card tests**

Run: `pnpm vitest run src/features/marketplace/components/__tests__/affordability-card.test.tsx src/features/marketplace/components/__tests__/purchase-confidence.test.tsx`

Expected: PASS.

- [ ] **Step 7: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/components/affordability-card.tsx src/features/marketplace/components/purchase-confidence.tsx src/features/marketplace/components/__tests__
git commit -m "feat: explain marketplace affordability and fulfilment"
```

---

### Task 6: Add curated reviews and Helpful voting

**Files:**
- Create: `src/features/marketplace/components/rating-stars.tsx`
- Create: `src/features/marketplace/components/review-card.tsx`
- Create: `src/features/marketplace/components/product-reviews.tsx`
- Create: `src/features/marketplace/components/__tests__/product-reviews.test.tsx`

**Interfaces:**
- Consumes: `ProductReviewSummary`, `ProductReview`, `Rating`, and `useHelpfulReview(reviewId)`.
- Produces: `RatingStars({ rating }: { rating: number })` as `aria-hidden` decoration.
- Produces: `ReviewCard({ review, helpful, onToggleHelpful })`.
- Produces: `ProductReviews({ reviews })` with heading ID `product-reviews`.

- [ ] **Step 1: Write failing review tests**

Render the iPhone review summary and assert:

```ts
expect(screen.getByRole("heading", { name: "Customer reviews" })).toHaveAttribute("id", "product-reviews");
expect(screen.getByText("4.6 out of 5")).toBeVisible();
expect(screen.getByText("128 verified ratings · 3 reviews shown")).toBeVisible();
expect(screen.getAllByText("Verified purchase")).toHaveLength(3);
```

Click the first “Helpful (24)” button and expect `aria-pressed="true"` plus label “Helpful (25)”. Click again and expect “Helpful (24)”. Assert the state is persisted under `1fi.marketplace.helpful-reviews.v1`.

- [ ] **Step 2: Verify the review tests fail**

Run: `pnpm vitest run src/features/marketplace/components/__tests__/product-reviews.test.tsx`

Expected: FAIL because the review components are missing.

- [ ] **Step 3: Implement rating distribution and cards**

Iterate `[5, 4, 3, 2, 1] as const`. Each row reads “5 stars”, exposes the seeded count, and renders a progress bar whose percentage is `count / totalCount * 100`. Keep stars decorative and render visible text “4.6 out of 5”.

For each review, render semantic article content, an ISO `<time dateTime={review.date}>`, `Verified purchase`, and a 44-pixel Helpful button. The display count is `review.helpfulCount + (helpful ? 1 : 0)`.

- [ ] **Step 4: Wire per-review persistence in ProductReviews**

Move a small `PersistedReviewCard` child into `product-reviews.tsx`; it calls `useHelpfulReview(review.id)` and passes state to the presentational `ReviewCard`. If `persistenceAvailable` becomes false after voting, surface one polite message: “Your vote is active for this visit but could not be saved.”

- [ ] **Step 5: Run review and persistence tests**

Run: `pnpm vitest run src/features/marketplace/components/__tests__/product-reviews.test.tsx src/features/marketplace/hooks/__tests__/use-persisted-toggle.test.tsx`

Expected: PASS.

- [ ] **Step 6: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/components/rating-stars.tsx src/features/marketplace/components/review-card.tsx src/features/marketplace/components/product-reviews.tsx src/features/marketplace/components/__tests__/product-reviews.test.tsx
git commit -m "feat: add verified marketplace review insights"
```

---

### Task 7: Compose related products and the complete detail experience

**Files:**
- Create: `src/features/marketplace/components/related-products.tsx`
- Create: `src/features/marketplace/components/__tests__/related-products.test.tsx`
- Modify: `src/features/marketplace/components/product-experience.tsx`
- Modify: `src/features/marketplace/components/__tests__/product-experience.test.tsx`

**Interfaces:**
- Consumes: `ProductSummary[]`, components from Tasks 4–6, and expanded `ProductDetailResponse` from Task 2.
- Produces: `RelatedProducts({ products })`.
- Changes: `ProductExperience({ product, relatedProducts })` and `ProductDetailContent` pass `product.data.related`.

- [ ] **Step 1: Write failing RelatedProducts tests**

Render three summaries and assert a heading “You may also like”, three product links, visible starting price and monthly EMI, and no section when the input is empty.

- [ ] **Step 2: Verify the component test fails**

Run: `pnpm vitest run src/features/marketplace/components/__tests__/related-products.test.tsx`

Expected: FAIL because `RelatedProducts` is missing.

- [ ] **Step 3: Implement horizontal related-product cards**

Use a `<section aria-labelledby="related-products-heading">`, horizontal overflow, snap alignment, and cards at approximately 76% of the mobile content width. Reuse `formatInr`; link each card to `/shop/marketplace/${product.id}` and render image fallback behaviour consistent with `ProductCard`.

- [ ] **Step 4: Extend ProductExperience tests before composition**

Assert the rendered iPhone details include sections in document order:

```ts
const headings = screen.getAllByRole("heading").map((heading) => heading.textContent);
expect(headings).toEqual(expect.arrayContaining([
  "iPhone 17",
  "Pay smarter with 1Fi",
  "Highlights",
  "Purchase confidence",
  "Customer reviews",
  "You may also like",
]));
```

Select the 256 GB Black variant and assert the affordability card shows `Total payable ₹89,900`. Use the rating link and assert `href="#product-reviews"`. Continue to EMI selection and assert the pre-existing heading appears.

- [ ] **Step 5: Compose the approved section order**

Update `ProductExperience` to accept `relatedProducts: ProductSummary[] = []`. Derive:

```ts
const displayedPricePaise = selectedVariant?.pricePaise ?? Math.min(
  ...product.variants.filter(({ stockStatus }) => stockStatus === "in_stock").map(({ pricePaise }) => pricePaise),
);
const longestTenure = Math.max(...product.eligibleTenures);
```

Render ProductSummary, AffordabilityCard, VariantSelector, ProductFeatures, PurchaseConfidence, ProductReviews and RelatedProducts in the specification order. Keep `StickyActionBar` last and preserve existing selection and EMI-stage state.

Update `ProductDetailContent` success rendering to:

```tsx
<ProductExperience
  product={product.data.data}
  relatedProducts={product.data.related}
/>
```

- [ ] **Step 6: Run all product component tests**

Run: `pnpm vitest run src/features/marketplace/components/__tests__`

Expected: PASS, including the existing variant-selection, back-navigation, order-flow, loading and recovery tests.

- [ ] **Step 7: Record the checkpoint if Git is available**

```bash
git add src/features/marketplace/components
git commit -m "feat: compose trust-first product details"
```

---

### Task 8: Verify the complete browser flow, accessibility and documentation

**Files:**
- Modify: `tests/e2e/marketplace.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `README.md`
- Regenerate through tests: `docs/screenshots/product-details.png`

**Interfaces:**
- Consumes: complete product experience from Tasks 1–7.
- Produces: browser-level regression and submission evidence.

- [ ] **Step 1: Add failing browser behaviour checks**

Add one mobile test that:

1. Opens `/shop/marketplace/iphone-17`.
2. Saves iPhone 17 and verifies `aria-pressed="true"`.
3. Reloads and verifies the saved state remains true.
4. Mocks `navigator.share`, selects Share, and verifies it receives the product name and current URL.
5. Activates the rating anchor and verifies the URL fragment contains `#product-reviews`.
6. Toggles “Helpful (24)” and verifies “Helpful (25)”.
7. Selects 128 GB and Black, continues through a 12-month EMI and reaches “Plan selected!”.

- [ ] **Step 2: Run the new mobile test and verify the red state**

Run: `pnpm playwright test --project=mobile-chrome -g "supports trust-first product decisions"`

Expected: FAIL before the new selectors and interactions are present.

- [ ] **Step 3: Add expanded accessibility coverage**

On the product page assert no serious or critical axe violations before and after opening the financing disclosure. Check Share, Save and the first Helpful control by keyboard and assert their visible focus state via Playwright focus assertions.

- [ ] **Step 4: Run the full verification matrix**

Run each command and require exit code 0:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
```

Expected: all unit/integration tests, TypeScript, ESLint, production build, mobile/desktop browser flows and axe checks pass.

- [ ] **Step 5: Refresh the product-detail evidence**

Run: `UPDATE_SCREENSHOTS=1 pnpm playwright test --project=mobile-chrome -g "captures the assignment walkthrough"`

Expected: `docs/screenshots/product-details.png` shows Share, Save, the rating summary and the 1Fi affordability card while the existing catalogue, EMI and confirmation captures remain valid.

- [ ] **Step 6: Update README scope truthfully**

Extend Implemented Flow with Share, locally saved products, transparent affordability guidance, curated demonstration reviews with local Helpful voting, purchase-confidence facts and deterministic related products. Extend Assumptions and Scope Boundaries to say these features use local fixture/browser state and do not represent real user activity or lender/merchant decisions.

- [ ] **Step 7: Run a final source and artefact audit**

Run:

```bash
rg -n "Demo information|0% interest|lien|lender approval|Verified purchase|Sharing is unavailable" src README.md
rg -n "T""BD|FIX""ME|console\.log|any\b" src tests README.md
```

Expected: required transparency copy is present; no placeholders, debug logging, or newly introduced explicit `any` types are present.

- [ ] **Step 8: Record the final checkpoint if Git is available**

```bash
git add tests/e2e README.md docs/screenshots src
git commit -m "test: verify trust-first marketplace experience"
```
