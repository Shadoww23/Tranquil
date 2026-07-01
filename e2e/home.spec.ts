import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("loads the demo library with its key sections", async ({ page }) => {
    await page.goto("/");

    // Demo mode banner (no Steam library connected in a fresh context).
    await expect(page.getByText("Demo mode")).toBeVisible();

    // Personalized recommendations section.
    await expect(page.getByRole("heading", { name: "Recommended for you" })).toBeVisible();

    // Headline stats (these labels also appear in the health summary, so scope
    // to the first match).
    await expect(page.getByText("Avg Design Risk Score").first()).toBeVisible();
    await expect(page.getByText("Avg Joy Index").first()).toBeVisible();

    // The library itself.
    await expect(page.getByRole("heading", { name: "Your Library" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Stardew Valley" }).first()).toBeVisible();
  });
});
