import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("landing page renders and routes into the demo workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Plan trips you can actually see/i })).toBeVisible();
  await page.getByRole("button", { name: /Start planning/i }).first().click();

  await expect(page).toHaveURL(/\/trips\/demo-kyoto$/);
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();
  await expect(page.getByText("Kyoto, Japan")).toBeVisible();
});

test("trip list seeds trips and opens the demo workspace", async ({ page }) => {
  await page.goto("/trips");

  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paris Romance" })).toBeVisible();

  await page.getByRole("button", { name: /Open trip workspace for 7 Days in Kyoto/i }).click();

  await expect(page).toHaveURL(/\/trips\/demo-kyoto$/);
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();
});

test("created Trip persists through localStorage and can be reopened", async ({ page }) => {
  await page.goto("/trips");

  await page.getByRole("button", { name: "New trip", exact: true }).click();
  await page.getByPlaceholder("e.g., 7 Days in Kyoto").fill("Lisbon Food Weekend");
  await page.getByPlaceholder("e.g., Kyoto, Japan").fill("Lisbon, Portugal");
  await page.getByRole("button", { name: /^Create Trip$/i }).click();

  await expect(page).toHaveURL(/\/trips\/trip_/);
  await expect(page.getByRole("heading", { name: "Lisbon Food Weekend" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Lisbon Food Weekend" })).toBeVisible();

  await page.getByRole("button", { name: /Back to trips/i }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: "Lisbon Food Weekend" })).toBeVisible();
});
