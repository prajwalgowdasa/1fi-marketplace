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
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => undefined,
    });
  });
  await page.goto("/shop/marketplace/iphone-17");
  await expectNoSeriousOrCriticalViolations(page);

  const financingDisclosure = page.locator("details").filter({ hasText: "How 1Fi financing works" });
  await financingDisclosure.locator("summary").click();
  await expect(financingDisclosure).toHaveAttribute("open", "");
  await expectNoSeriousOrCriticalViolations(page);

  const saveProduct = page.getByRole("button", { name: /(?:Save|Remove) iPhone 17/ });
  await saveProduct.focus();
  await expect(saveProduct).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(saveProduct).toHaveAttribute("aria-pressed", "true");

  const shareProduct = page.getByRole("button", { name: "Share iPhone 17" });
  await shareProduct.focus();
  await expect(shareProduct).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Share sheet opened");

  const firstHelpful = page.getByRole("button", { name: /^Helpful/ }).first();
  await expect(firstHelpful).toHaveText("Helpful (24)");
  await firstHelpful.focus();
  await expect(firstHelpful).toBeFocused();
  await page.keyboard.press("Space");
  await expect(firstHelpful).toHaveText("Helpful (25)");

  await page.locator("label").filter({ hasText: /^128 GB$/ }).click();
  await page.locator("label").filter({ hasText: /^Black$/ }).click();

  await page.getByRole("button", { name: "View EMI plans" }).click();
  await expect(page.getByRole("heading", { name: "Choose your EMI plan" })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});

test("confirmation has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/shop/marketplace/confirmation?referenceId=1FI-A1B2C3D4&productId=iphone-17&variantId=iphone-17-128-black&tenureMonths=12");
  await expect(page.getByRole("heading", { name: "Plan selected!" })).toBeVisible();
  await expectNoSeriousOrCriticalViolations(page);
});
