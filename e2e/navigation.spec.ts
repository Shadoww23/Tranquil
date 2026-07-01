import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navigates to the Patterns page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Patterns", exact: true }).first().click();
    await expect(page).toHaveURL(/\/patterns$/);
    await expect(page.getByRole("heading", { name: "Design Pattern Registry" })).toBeVisible();
  });

  test("navigates to the Platforms page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Platforms", exact: true }).first().click();
    await expect(page).toHaveURL(/\/platforms$/);
    await expect(page.getByRole("heading", { name: "Platform Breakdown" })).toBeVisible();
  });

  test("navigates to the Session page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Session", exact: true }).first().click();
    await expect(page).toHaveURL(/\/session$/);
    await expect(page.getByRole("heading", { name: "Focus Timer" })).toBeVisible();
  });
});
