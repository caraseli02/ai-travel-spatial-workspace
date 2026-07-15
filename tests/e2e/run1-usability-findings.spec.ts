import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("keeps the Inbox action compact in the narrow workspace header", async ({ page }) => {
  await page.setViewportSize({ width: 746, height: 844 });
  await page.goto("/trips/demo-kyoto");

  const inboxAction = page.getByRole("button", {
    name: /(open|close) inbox, \d+ items to organize/i,
  });
  await expect(inboxAction).toBeVisible();
  await expect(inboxAction.getByText("Inbox", { exact: true })).toBeHidden();

  const bounds = await inboxAction.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(746);
});

test("keeps Inbox source and capture time from colliding", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const inboxPanel = page.locator("aside");
  const redditItem = inboxPanel.locator("div.group").filter({
    has: page.getByText("Reddit r/JapanTravel", { exact: true }),
  });
  const source = redditItem.getByText("Reddit r/JapanTravel", { exact: true });
  const captureTime = redditItem.getByText("5 hours ago", { exact: true });

  await expect(source).toBeVisible();
  await expect(captureTime).toBeVisible();

  const sourceBounds = await source.boundingBox();
  const captureTimeBounds = await captureTime.boundingBox();
  expect(sourceBounds).not.toBeNull();
  expect(captureTimeBounds).not.toBeNull();
  expect(sourceBounds!.x + sourceBounds!.width).toBeLessThanOrEqual(captureTimeBounds!.x - 8);
});

test("keeps the Add Day dialog above the AI prompt with its footer inside", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");
  await page.getByTitle("Add Custom Day").click();

  const dialog = page.locator('[data-slot="dialog-content"]');
  const overlay = page.locator('[data-slot="dialog-overlay"]');
  const footer = page.locator('[data-slot="dialog-footer"]');
  const aiPrompt = page.getByPlaceholder(/Ask AI:/).locator("xpath=ancestor::form[1]");

  await expect(dialog).toBeVisible();
  const overlayZ = await overlay.evaluate((element) => Number(getComputedStyle(element).zIndex));
  const promptZ = await aiPrompt.evaluate((element) => Number(getComputedStyle(element.parentElement!).zIndex));
  expect(overlayZ).toBeGreaterThan(promptZ);

  const dialogBounds = await dialog.boundingBox();
  const footerBounds = await footer.boundingBox();
  expect(dialogBounds).not.toBeNull();
  expect(footerBounds).not.toBeNull();
  expect(footerBounds!.x).toBeGreaterThanOrEqual(dialogBounds!.x - 1);
  expect(footerBounds!.x + footerBounds!.width).toBeLessThanOrEqual(
    dialogBounds!.x + dialogBounds!.width + 1,
  );
  expect(footerBounds!.y + footerBounds!.height).toBeLessThanOrEqual(
    dialogBounds!.y + dialogBounds!.height + 1,
  );
});

test("keeps placement feedback clear of the Card Detail Panel", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const inboxPanel = page.locator("aside");
  await inboxPanel.getByRole("button", { name: /^Place on canvas$/i }).first().click();

  const feedback = page.getByRole("status");
  const detailPanel = page.locator('[data-slot="sheet-content"]');
  await expect(feedback).toBeVisible();
  await expect(detailPanel).toBeVisible();

  const feedbackBounds = await feedback.boundingBox();
  const detailBounds = await detailPanel.boundingBox();
  expect(feedbackBounds).not.toBeNull();
  expect(detailBounds).not.toBeNull();
  expect(rectsOverlap(feedbackBounds!, detailBounds!)).toBe(false);
});

test("keeps placement feedback above the mobile Card Detail Panel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trips/demo-kyoto");
  await page.getByRole("button", { name: "Open inbox, 4 items to organize" }).click();

  const inboxPanel = page.locator("aside");
  await inboxPanel.getByRole("button", { name: /^Place on canvas$/i }).first().click();

  const feedback = page.getByRole("status");
  const detailPanel = page.locator('[data-slot="sheet-content"]');
  await expect(feedback).toBeVisible();
  await expect(detailPanel).toBeVisible();

  const feedbackZ = await feedback.evaluate((element) =>
    Number(getComputedStyle(element.parentElement!).zIndex),
  );
  const detailZ = await detailPanel.evaluate((element) => Number(getComputedStyle(element).zIndex));
  expect(feedbackZ).toBeGreaterThan(detailZ);
});

function rectsOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}
