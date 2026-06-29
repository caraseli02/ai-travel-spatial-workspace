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
