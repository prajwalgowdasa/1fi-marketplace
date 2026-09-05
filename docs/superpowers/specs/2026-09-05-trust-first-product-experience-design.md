# Trust-First Product Experience Design

**Date:** 2026-09-05  
**Status:** Approved for implementation

## Purpose

Strengthen the 1Fi Marketplace product-detail experience with decision-support features that reflect 1Fi's positioning: simple and transparent borrowing, zero-interest EMI options, and the ability to keep eligible mutual-fund units invested while selected units are lien-marked.

The work remains an independent frontend demonstration. It must not imply access to a real customer account, purchase limit, merchant inventory, verified order history, lender decision, or production 1Fi service.

## Product Principles

1. **Affordability before commerce gimmicks.** Help customers understand monthly cost and financing responsibilities before encouraging checkout.
2. **Trust through precise language.** Separate the merchant's product obligations from 1Fi's financing role and make lender approval and collateral risk visible.
3. **Progressive disclosure.** Keep the primary product decision compact while allowing users to inspect financing, fulfilment, and review details.
4. **No fabricated personalisation.** Saved state and helpful votes may persist locally; eligibility and limits must remain explicitly illustrative or unavailable.
5. **Preserve the checkout path.** The existing Product → EMI plans → Confirmation sequence and one-step back navigation remain unchanged.

## Scope

### Included

- Share a product through the Web Share API with a clipboard fallback.
- Save or unsave a product with local persistence.
- Product rating summary and curated read-only verified-purchase reviews.
- Helpful voting on reviews with local persistence and reversible state.
- A 1Fi affordability card based on real product price and eligible tenure data.
- Merchant, delivery, warranty, returns, and responsibility information.
- Related products selected deterministically from the local catalogue.
- Accessible status feedback, unsupported-browser fallbacks, validation, and tests.

### Excluded

- Review submission, accounts, authentication, moderation, or server persistence.
- Live purchase-limit or mutual-fund portfolio access.
- Cart, inventory reservation, payment, loan sanction, pledge creation, or fulfilment.
- Investment-return projections or claims that future fund returns offset purchase cost.
- A general recommendation engine, social comments, or product comparison.

## Experience Design

### Product action row

The product summary gains two 44-pixel icon controls:

- **Save product:** toggles a filled/outlined heart. An `aria-live` message announces “Saved to your products” or “Removed from saved products.”
- **Share product:** attempts `navigator.share` with product name, a concise 1Fi Marketplace message, and the canonical current URL. If native sharing is unavailable, the URL is copied. Success, cancellation, copy failure, and unsupported states are handled without interrupting checkout.

The aggregate rating appears beneath the product name as a button-like anchor linking to the Reviews section. It displays the average to one decimal place and total review count without implying the current user is verified.

### Affordability card

A compact card titled **Pay smarter with 1Fi** appears after the price and before variant selection. Before a variant is selected it uses the lowest in-stock price and longest eligible tenure. After selection it recalculates from that variant.

It displays:

- “From ₹X/month” for the displayed tenure.
- “0% interest” and “Total payable ₹Y.”
- Three concise facts: eligible units stay invested; selected units may be lien-marked; approval depends on eligible holdings and lender policy.
- An expandable “How 1Fi financing works” disclosure covering market-value/LTV risk, monthly repayment, and lender approval.

All values use the existing paise-based EMI calculation. No savings or investment-growth figure is shown.

### Purchase confidence card

A section titled **Purchase confidence** presents four labelled rows:

- Sold by
- Estimated delivery
- Warranty
- Returns

Supporting copy states that the merchant handles product description, availability, delivery, quality, warranty, cancellation, and refunds; 1Fi enables the financing journey. The card is informational and contains no dead links.

### Reviews

The Reviews section includes:

- Average rating and five-star visual representation.
- Rating distribution rendered as labelled progress bars.
- Total review count.
- Three curated review cards, each with reviewer first name and surname initial, rating, date label, title, body, “Verified purchase” badge, and a Helpful button.

Helpful voting is a reversible per-review toggle. The displayed count equals the seeded count plus one when selected. This state persists in browser storage and does not claim server synchronisation.

Review text will discuss product ownership only, not 1Fi loan approval or financial performance. Curated records are local fixture data and are labelled verified solely within this demonstration dataset.

### Related products

The final content section shows up to three products from the same category, excluding the current product. Ordering follows the catalogue fixture order, making output deterministic. Cards show the existing image, brand, name, price and starting EMI and navigate to the selected product.

On narrow screens the cards use a horizontally scrollable, labelled region with visible card boundaries. The fixed checkout action remains visually separate and takes precedence.

## Information Architecture

The product-detail order becomes:

1. Shared flow header
2. Product gallery
3. Product name, rating, Share and Save
4. Description and price
5. Pay smarter with 1Fi
6. Variant selection
7. Highlights
8. Purchase confidence
9. Reviews
10. Related products
11. Existing sticky “View EMI plans” action

The EMI-selection and confirmation screens are unchanged except for any shared type compatibility required by the expanded product schema.

## Data Model

`Product` gains:

- `commerce`: seller, delivery estimate, warranty, returns summary.
- `reviews`: aggregate average, total count, five-entry distribution, and three review records.

New domain types:

- `ProductCommerce`
- `ProductReview`
- `ProductReviewSummary`
- `Rating` constrained to integers 1–5 for individual reviews.

The existing `ProductSummary` remains lightweight. Related products are derived from catalogue summaries rather than embedding duplicated products.

The Zod response schema must validate commerce and review data, including non-negative counts, valid rating ranges, ISO-compatible identifiers, and a distribution total that does not exceed the aggregate count. Cross-field distribution checks belong in schema refinement or a focused domain validator.

## Component Boundaries

- `ProductActions`: coordinates Share and Save controls and status messages.
- `useSavedProduct`: SSR-safe local-persistence adapter with functional updates and storage failure handling.
- `shareProduct`: browser-capability adapter returning a typed outcome rather than throwing UI-specific errors.
- `AffordabilityCard`: pure rendering and disclosure state based on product, price, and tenure.
- `PurchaseConfidence`: pure rendering of commerce terms and responsibility copy.
- `ProductReviews`: aggregate presentation and review-list composition.
- `ReviewCard`: owns no persistence; receives helpful state and callback.
- `useHelpfulReview`: SSR-safe reversible per-review local-persistence adapter.
- `RelatedProducts`: receives already-derived summaries and renders navigation cards.
- `getRelatedProducts`: pure domain function for deterministic filtering and limiting.

`ProductExperience` composes these units and remains responsible for variant selection and progression to EMI plans. Browser capabilities and persistence stay outside domain calculations.

## State and Persistence

Local storage keys are versioned:

- `1fi.marketplace.saved-products.v1`
- `1fi.marketplace.helpful-reviews.v1`

Values are JSON arrays of string identifiers. Reads validate shape and ignore malformed data. Writes are wrapped so privacy mode, quota errors, or disabled storage do not crash the page. In-memory interaction still works when persistence fails, accompanied by a non-blocking status message.

Saved and helpful state is hydrated only after mount to prevent server/client markup mismatches. Controls remain operable during and after hydration.

## Error and Fallback Behaviour

- Native share success: announce that the share sheet opened.
- User cancels native share: no error message.
- Native share unavailable: copy the canonical URL and announce success.
- Clipboard unavailable or rejected: announce “Sharing is unavailable on this device.”
- Storage malformed or unreadable: use an empty set.
- Storage write rejected: preserve current in-memory state and announce that the choice could not be saved for the next visit.
- Missing review or commerce data: rejected at API validation rather than partially rendered.
- No related products: omit the section entirely.

## Accessibility

- Share, Save and Helpful controls have stable accessible names and 44-pixel minimum targets.
- Save exposes `aria-pressed`; Helpful exposes `aria-pressed` and includes the updated count visually.
- Star graphics are hidden from assistive technology; a text equivalent communicates the rating.
- Rating-distribution bars expose textual labels and values.
- The review summary target uses a real fragment link and the Reviews heading is focusable after navigation where needed.
- Status feedback uses a polite live region; errors that block sharing remain non-modal.
- Horizontal related-product scrolling does not trap keyboard focus.
- Reduced-motion preferences continue to be respected.

## Testing Strategy

### Domain and schema tests

- Related-product selection excludes the current product, respects category and limit, and is deterministic.
- Expanded product fixtures pass schema validation.
- Invalid ratings, negative counts, and invalid distributions fail validation.
- Affordability values match existing paise-safe EMI calculations.

### Component and hook tests

- Save toggles, restores valid persisted state, and tolerates malformed or unavailable storage.
- Native Share is preferred when available.
- Clipboard fallback is used when Share is unavailable.
- Share cancellation is silent; actual failure is announced.
- Helpful votes toggle exactly once and persist independently per review.
- Rating summary links to Reviews and all review semantics are accessible.
- Affordability card updates when a different priced variant is selected.
- Related cards omit the current product and navigate correctly.

### End-to-end tests

- Save a product, reload, and observe saved state.
- Share through a mocked native path and through a clipboard fallback.
- Navigate from rating summary to Reviews and toggle Helpful.
- Continue through variant selection and EMI checkout after using the new features.
- Run axe checks on the expanded product page at mobile and desktop viewports.

## Acceptance Criteria

1. The product page exposes usable Share and Save controls without requiring sign-in.
2. Save and Helpful state survive reload when local storage is available.
3. Share has working native and clipboard paths and never blocks checkout.
4. Financing copy communicates 0% interest, total payable, lien implications, lender approval, and market-value risk without making investment-return promises.
5. Merchant and 1Fi responsibilities are clearly distinguished.
6. Reviews are explicitly curated, read-only fixtures with useful aggregate information.
7. Related products exclude the current product and preserve existing navigation conventions.
8. Existing Marketplace → Product → EMI → Confirmation behaviour remains functional.
9. Unit, integration, type, lint, mobile browser, and accessibility checks pass.
