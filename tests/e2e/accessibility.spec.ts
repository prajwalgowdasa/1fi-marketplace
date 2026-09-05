import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousOrCriticalViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter(({ impact }) => impact === "serious" || impact === "critical");
  expect(blockingViolations).toEqual([]);
}

test("Marketplace has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/shop?tab=marketplace");
  await expect(page.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});

test("product details and EMI selection have no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/shop/marketplace/iphone-17");
  await page.locator("label").filter({ hasText: /^128 GB$/ }).click();
  await page.locator("label").filter({ hasText: /^Black$/ }).click();
  await expectNoSeriousOrCriticalViolations(page);

  await page.getByRole("button", { name: "View EMI plans" }).click();
  await expect(page.getByRole("heading", { name: "Choose your EMI plan" })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});

test("confirmation has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/shop/marketplace/confirmation?referenceId=1FI-A1B2C3D4&productId=iphone-17&variantId=iphone-17-128-black&tenureMonths=12");
  await expect(page.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});
