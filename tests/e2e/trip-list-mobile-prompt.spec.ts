import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("trip list prompt bar does not overlap trip cards on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trips");

  const viewDetails = page.getByRole("button", { name: "View Details" }).last();
  await expect(page.getByRole("heading", { name: "Paris Romance" })).toBeVisible();
  await viewDetails.scrollIntoViewIfNeeded();

  const cardFooterBox = await viewDetails.boundingBox();
  const promptBarBox = await page.getByTestId("trip-prompt-bar").boundingBox();

  expect(cardFooterBox).not.toBeNull();
  expect(promptBarBox).not.toBeNull();
  expect(cardFooterBox!.y + cardFooterBox!.height).toBeLessThanOrEqual(promptBarBox!.y);
});
