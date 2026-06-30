import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("trip list exposes accessible names for chat toggle and new trip card on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trips");

  const chatButton = page.getByRole("button", { name: "Open chat history" });
  await expect(chatButton).toBeVisible();

  await chatButton.click();
  await expect(page.getByRole("button", { name: "Close chat history" })).toBeVisible();

  const newTripCard = page.getByRole("button", { name: "Create a new trip" });
  await expect(newTripCard).toBeVisible();
  await newTripCard.focus();
  await expect(newTripCard).toBeFocused();
});

test("trip list mobile filters show overflow affordance without a filter glyph", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trips");

  const filterRegion = page.getByRole("region", { name: "Trip status filters" });
  await expect(filterRegion).toBeVisible();

  await expect(page.getByTestId("trip-list-filter-scroll-hint")).toBeVisible();
  await expect(page.getByRole("button", { name: "Filter" })).toHaveCount(0);
  await expect(filterRegion.getByRole("tab", { name: /All/ })).toBeVisible();
});

test("trip list desktop zero-result filters span the remaining grid space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await page.goto("/trips");

  await page.getByRole("tab", { name: /Completed/ }).click();

  const newTripCard = page.getByRole("button", { name: "Create a new trip" });
  const emptyState = page.getByTestId("trip-list-filter-empty-state");

  await expect(newTripCard).toBeVisible();
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toContainText("No completed trips");

  const newTripBox = await newTripCard.boundingBox();
  const emptyStateBox = await emptyState.boundingBox();

  expect(newTripBox).not.toBeNull();
  expect(emptyStateBox).not.toBeNull();
  expect(emptyStateBox!.width).toBeGreaterThan(newTripBox!.width * 1.5);
});
