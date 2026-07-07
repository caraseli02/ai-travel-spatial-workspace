import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("keeps the Inbox place action readable inside the sidebar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const inboxPanel = page.locator("aside");
  await expect(inboxPanel.getByRole("heading", { name: "Inbox" })).toBeVisible();

  const placeAction = inboxPanel.getByRole("button", { name: /^Place on canvas$/i }).first();
  await expect(placeAction).toBeVisible();
  await expect(inboxPanel.getByText("Ready to organize").first()).toBeVisible();

  const panelBounds = await inboxPanel.boundingBox();
  const actionBounds = await placeAction.boundingBox();

  expect(panelBounds).not.toBeNull();
  expect(actionBounds).not.toBeNull();
  expect(actionBounds!.x).toBeGreaterThanOrEqual(panelBounds!.x);
  expect(actionBounds!.x + actionBounds!.width).toBeLessThanOrEqual(
    panelBounds!.x + panelBounds!.width,
  );
});

test("keeps desktop Kanban add controls clear of floating Workspace overlays", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const addCardControl = page.getByRole("button", { name: "Add card" }).last();
  await addCardControl.scrollIntoViewIfNeeded();
  await expect(addCardControl).toBeVisible();

  const addCardBounds = await addCardControl.boundingBox();
  const aiPromptBounds = await page.getByPlaceholder(/Ask AI:/).locator("xpath=ancestor::form[1]").boundingBox();
  const miniMapBounds = await page
    .getByRole("button", { name: /Open map/i })
    .locator("xpath=ancestor::*[contains(@class, 'group/card')][1]")
    .boundingBox();

  expect(addCardBounds).not.toBeNull();
  expect(aiPromptBounds).not.toBeNull();
  expect(miniMapBounds).not.toBeNull();
  expect(rectsOverlap(addCardBounds!, aiPromptBounds!)).toBe(false);
  expect(rectsOverlap(addCardBounds!, miniMapBounds!)).toBe(false);
});

test("reserves desktop vertical clearance above the floating AI prompt", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const firstAddCardControl = page.getByRole("button", { name: "Add card" }).first();
  await expect(firstAddCardControl).toBeVisible();

  const kanbanViewportBounds = await firstAddCardControl
    .locator("xpath=ancestor::div[contains(@class, 'overflow-x-auto')][1]")
    .boundingBox();
  const aiPromptBounds = await page.getByPlaceholder(/Ask AI:/).locator("xpath=ancestor::form[1]").boundingBox();

  expect(kanbanViewportBounds).not.toBeNull();
  expect(aiPromptBounds).not.toBeNull();
  expect(kanbanViewportBounds!.y + kanbanViewportBounds!.height).toBeLessThanOrEqual(aiPromptBounds!.y - 8);
});

test("reserves mobile vertical clearance above the floating AI prompt", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trips/demo-kyoto");

  const firstAddCardControl = page.getByRole("button", { name: "Add card" }).first();
  await expect(firstAddCardControl).toBeVisible();

  const kanbanViewportBounds = await firstAddCardControl
    .locator("xpath=ancestor::div[contains(@class, 'overflow-x-auto')][1]")
    .boundingBox();
  const aiPromptBounds = await page
    .getByPlaceholder(/Ask AI about this trip/i)
    .locator("xpath=ancestor::form[1]")
    .boundingBox();

  expect(kanbanViewportBounds).not.toBeNull();
  expect(aiPromptBounds).not.toBeNull();
  expect(kanbanViewportBounds!.y + kanbanViewportBounds!.height).toBeLessThanOrEqual(aiPromptBounds!.y - 8);
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
