import { test, expect } from "@playwright/test";

test.describe("Game detail", () => {
  test("opens a game and shows its scores and personalization", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("heading", { name: "Stardew Valley" }).first().click();
    await expect(page).toHaveURL(/\/game\/stardew-valley$/);

    // Objective scores.
    await expect(page.getByText("Design Risk Score")).toBeVisible();
    await expect(page.getByText("Joy Index")).toBeVisible();

    // The "why" breakdown and the personal layer.
    await expect(page.getByRole("heading", { name: "Why this score" })).toBeVisible();
    await expect(page.getByText("For you")).toBeVisible();
  });
});
