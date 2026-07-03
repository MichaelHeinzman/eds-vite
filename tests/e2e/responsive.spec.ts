import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/docs", "/blocks", "/github"];

for (const route of publicRoutes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("mobile navigation is operable", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile-only navigation behavior");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Primary Navigation" }).getByRole("link", { name: "Docs" })).toBeVisible();
});

test("checkout explains the unavailable backend action", async ({ page }) => {
  await page.goto("/cart");
  const checkout = page.getByRole("button", { name: "Proceed to checkout" });
  if (await checkout.isVisible()) {
    await checkout.click();
    await expect(page.getByRole("status")).toContainText("Checkout is not connected");
  }
});
