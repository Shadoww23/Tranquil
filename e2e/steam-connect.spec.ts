import { test, expect } from "@playwright/test";

test.describe("Steam connect", () => {
  test("opens the wizard with both sign-in options", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Connect Steam" }).click();

    const dialog = page.getByRole("dialog", { name: "Connect Steam" });
    await expect(dialog).toBeVisible();

    // Tier 1 (default) and the Tier 2 fallback are both offered.
    await expect(dialog.getByRole("link", { name: /Sign in through Steam/ })).toBeVisible();
    await expect(dialog.getByText("Advanced: use your own API key instead")).toBeVisible();
  });
});
