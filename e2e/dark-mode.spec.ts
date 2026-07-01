import { test, expect } from "@playwright/test";

test.describe("Dark mode", () => {
  test("toggles and persists across a reload", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");

    // Starts light.
    await expect(html).not.toHaveClass(/dark/);

    // Toggle to dark.
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(html).toHaveClass(/dark/);

    // The blocking theme script should keep it dark after a reload.
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});
