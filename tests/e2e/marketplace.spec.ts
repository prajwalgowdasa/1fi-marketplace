import { expect, test, type Page } from "@playwright/test";

const marketplaceUrl = "/shop?tab=marketplace";
const screenshotDirectory = "docs/screenshots";

async function captureSubmissionScreenshot(page: Page, filename: string) {
  await page.locator("nextjs-portal").evaluateAll((portals) => portals.forEach((portal) => portal.remove()));
  const screenshot = await page.screenshot();
  expect(screenshot.byteLength).toBeGreaterThan(0);
  if (process.env.UPDATE_SCREENSHOTS === "1") {
    await page.screenshot({ path: `${screenshotDirectory}/${filename}` });
  }
}

async function openIphoneConfiguration(page: Page) {
  await page.goto(marketplaceUrl);
  await expect(page.getByRole("link", { name: /iPhone 17/i })).toBeVisible();
  await page.getByRole("link", { name: /iPhone 17/i }).click();
  await page.locator("label").filter({ hasText: /^128 GB$/ }).click();
  await page.locator("label").filter({ hasText: /^Black$/ }).click();
}

test("user completes the 1Fi Marketplace mock flow", async ({ page }) => {
  await openIphoneConfiguration(page);
  await page.getByRole("button", { name: "View EMI plans" }).click();
  await page.getByRole("radio", { name: /12 months/ }).check();
  await page.getByRole("button", { name: /Proceed with ₹6,658.33 per month/ }).click();
  await expect(page).toHaveURL(/\/shop\/marketplace\/confirmation\?/);
  await expect(page.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to product details" })).toHaveAttribute(
    "href",
    "/shop/marketplace/iphone-17",
  );
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Mock Marketplace request created")).toBeVisible();
});

test("supports trust-first product decisions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "This regression covers the mobile product-decision flow.");

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload: ShareData) => {
        (
          window as typeof window & { __sharedProduct?: { title: string | undefined; url: string | undefined } }
        ).__sharedProduct = { title: payload.title, url: payload.url };
      },
    });
  });
  await page.goto("/shop/marketplace/iphone-17");
  const saveProduct = page.getByRole("button", { name: "Save iPhone 17" });
  await saveProduct.click();
  await expect(page.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.getByRole("button", { name: "Remove iPhone 17 from saved products" })).toHaveAttribute("aria-pressed", "true");

  const currentUrl = page.url();
  await page.getByRole("button", { name: "Share iPhone 17" }).click();
  await expect.poll(() => page.evaluate(() => (
    window as typeof window & { __sharedProduct?: { title: string | undefined; url: string | undefined } }
  ).__sharedProduct)).toEqual({ title: "iPhone 17", url: currentUrl });

  await page.getByRole("link", { name: "4.6 · 128 reviews" }).click();
  await expect(page).toHaveURL(/#product-reviews$/);
  await expect(page.getByRole("heading", { name: "Customer reviews" })).toBeFocused();

  const firstHelpful = page.getByRole("button", { name: /^Helpful/ }).first();
  await expect(firstHelpful).toHaveText("Helpful (24)");
  await firstHelpful.click();
  await expect(firstHelpful).toHaveText("Helpful (25)");

  await page.locator("label").filter({ hasText: /^128 GB$/ }).click();
  await page.locator("label").filter({ hasText: /^Black$/ }).click();
  await page.getByRole("button", { name: "View EMI plans" }).click();
  await page.getByRole("radio", { name: /12 months/ }).check();
  await page.getByRole("button", { name: /Proceed with ₹6,658.33 per month/ }).click();
  await expect(page.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
});

test("copies the product link when native Share is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as typeof window & { __copiedProductUrl?: string }).__copiedProductUrl = text;
        },
      },
    });
  });
  await page.goto("/shop/marketplace/iphone-17");
  const currentUrl = page.url();

  await page.getByRole("button", { name: "Share iPhone 17" }).click();

  await expect(page.getByRole("status")).toHaveText("Product link copied");
  await expect.poll(() => page.evaluate(() => (
    window as typeof window & { __copiedProductUrl?: string }
  ).__copiedProductUrl)).toBe(currentUrl);
});

test("filters the catalog and recovers from an empty search", async ({ page }) => {
  await page.goto(marketplaceUrl);
  const search = page.getByRole("searchbox", { name: "Search Marketplace" });
  await search.fill("Pixel");
  await expect(page).toHaveURL(/q=Pixel/);
  await expect(page.getByRole("link", { name: /Pixel 10/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /iPhone 17/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Laptops" }).click();
  await expect(page).toHaveURL(/category=laptops/);
  await expect(page.getByRole("link", { name: /Pixel 10/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();

  await search.fill("not-a-product");
  await expect(page).toHaveURL(/q=not-a-product/);
  await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(marketplaceUrl);
  await expect(page.getByRole("link", { name: /iPhone 17/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
});

test("keeps category pills scrollable without showing a scrollbar", async ({ page }) => {
  await page.goto(marketplaceUrl);
  const categories = page.getByRole("group", { name: "Product categories" });

  await expect(categories).toHaveCSS("overflow-x", "auto");
  await expect.poll(() => categories.evaluate((element) => ({
    standard: window.getComputedStyle(element).scrollbarWidth,
    webkit: window.getComputedStyle(element, "::-webkit-scrollbar").display,
  }))).toEqual({ standard: "none", webkit: "none" });
});

test("recovers from a missing product", async ({ page }) => {
  await page.goto("/shop/marketplace/not-a-product");
  await expect(page.getByRole("heading", { name: "Product not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toHaveAttribute("href", marketplaceUrl);
});

test("supports keyboard navigation for Shop tabs and EMI choices", async ({ page }) => {
  await page.goto(marketplaceUrl);
  const marketplaceTab = page.getByRole("tab", { name: "1Fi Marketplace" });
  await marketplaceTab.focus();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "Top Brands" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Top Brands" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(marketplaceTab).toBeFocused();
  await expect(marketplaceTab).toHaveAttribute("aria-selected", "true");

  await openIphoneConfiguration(page);
  await page.getByRole("button", { name: "View EMI plans" }).click();
  const sixMonths = page.getByRole("radio", { name: /6 months/ });
  await sixMonths.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /12 months/ })).toBeChecked();
});

test("captures the assignment walkthrough at the mobile submission viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chrome", "Submission captures use the 390 by 844 mobile project.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/orders", async (route) => route.fulfill({
    contentType: "application/json",
    status: 201,
    body: JSON.stringify({ data: { referenceId: "1FI-A1B2C3D4", productId: "iphone-17", variantId: "iphone-17-128-black", plan: { tenureMonths: 12, regularInstallmentPaise: 665833, finalInstallmentPaise: 665837, interestRatePercent: 0, totalPayablePaise: 7990000 } } }),
  }));

  await page.goto(marketplaceUrl);
  await expect(page.getByRole("link", { name: /iPhone 17/i })).toBeVisible();
  await captureSubmissionScreenshot(page, "marketplace.png");

  await page.getByRole("link", { name: /iPhone 17/i }).click();
  await page.locator("label").filter({ hasText: /^128 GB$/ }).click();
  await page.locator("label").filter({ hasText: /^Black$/ }).click();
  const shareAction = page.getByRole("button", { name: "Share iPhone 17" });
  await shareAction.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
  await expect(shareAction).toBeInViewport();
  await expect(page.getByRole("button", { name: "Save iPhone 17" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "4.6 · 128 reviews" })).toBeInViewport();
  await expect(page.getByRole("heading", { name: "Pay smarter with 1Fi" })).toBeInViewport();
  await captureSubmissionScreenshot(page, "product-details.png");

  await page.getByRole("button", { name: "View EMI plans" }).click();
  await page.getByRole("radio", { name: /12 months/ }).check();
  await captureSubmissionScreenshot(page, "emi-selection.png");

  await page.getByRole("button", { name: /Proceed with ₹6,658.33 per month/ }).click();
  await expect(page.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 96));
  await captureSubmissionScreenshot(page, "confirmation.png");
});
