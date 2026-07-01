import { test, expect } from "@playwright/test";

test.describe("Library search & filter", () => {
  test("search narrows the library to matching games", async ({ page }) => {
    await page.goto("/");

    // Scope assertions to the library region so the recommendations section
    // (which isn't filtered) doesn't interfere.
    const library = page.getByRole("region", { name: "Game library" });
    await expect(library.getByRole("heading", { name: "Stardew Valley" })).toBeVisible();

    await page.getByLabel("Search games").fill("stardew");

    await expect(library.getByRole("heading", { name: "Stardew Valley" })).toBeVisible();
    await expect(library.getByRole("heading", { name: "Hades", exact: true })).toHaveCount(0);
  });

  test("the 'Flagged' verdict filter changes the results", async ({ page }) => {
    await page.goto("/");
    const library = page.getByRole("region", { name: "Game library" });

    // A clean single-player game is present by default.
    await expect(library.getByRole("heading", { name: "Hollow Knight" })).toBeVisible();

    await page.getByRole("button", { name: "Flagged", exact: true }).click();

    // Clean games drop out; only caution/red-flag titles remain.
    await expect(library.getByRole("heading", { name: "Hollow Knight" })).toHaveCount(0);
  });
});
