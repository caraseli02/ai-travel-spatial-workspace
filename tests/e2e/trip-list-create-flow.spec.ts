import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("creates a trip from the Trip List create dialog and keeps it after reload", async ({ page }) => {
  await page.goto("/trips");

  await page.getByRole("button", { name: "New trip", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "New Trip" })).toBeVisible();

  await page.getByPlaceholder("e.g., 7 Days in Kyoto").fill("Seville Art Escape");
  await page.getByPlaceholder("e.g., Kyoto, Japan").fill("Seville, Spain");
  await page.getByRole("button", { name: /^Create Trip$/i }).click();

  await expect(page).toHaveURL(/\/trips\/trip_/);
  await expect(page.getByRole("heading", { name: "Seville Art Escape" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Seville Art Escape" })).toBeVisible();

  await page.getByRole("button", { name: /Back to trips/i }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: "Seville Art Escape" })).toBeVisible();
});

test("creates a trip from a Trip List prompt and opens it from the list", async ({ page }) => {
  await page.goto("/trips");

  const promptInput = page.getByPlaceholder("Describe your dream trip...");
  await promptInput.fill("Plan a 4-day trip to Tokyo for 2 people");
  await promptInput.press("Enter");

  await expect(page.getByText(/I've created a trip to/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trip to Tokyo" })).toBeVisible();

  await page.getByRole("button", { name: /Open trip workspace for Trip to Tokyo/i }).click();

  await expect(page).toHaveURL(/\/trips\/trip_/);
  await expect(page.getByRole("heading", { name: "Trip to Tokyo" })).toBeVisible();
});
