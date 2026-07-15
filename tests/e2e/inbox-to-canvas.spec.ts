import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("pastes Trip Material into the inbox, processes it, and shows a Canvas Card", async ({
  page,
}) => {
  const inboxContent = "E2E inbox paste: matcha workshop in Uji";

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();

  const inboxPanel = page.locator("aside");
  await expect(inboxPanel.getByRole("heading", { name: "Inbox" })).toBeVisible();
  await expect(inboxPanel.getByTestId("inbox-capture-input")).toHaveCount(0);

  const promptInput = page.getByPlaceholder(/paste a link or note to save/i);
  await promptInput.fill(inboxContent);
  await page.getByRole("button", { name: "Send AI prompt" }).click();

  const inboxItemCard = inboxPanel.locator("div.group").filter({ hasText: inboxContent });
  await expect(inboxItemCard).toBeVisible();

  await inboxItemCard.getByRole("button", { name: /Place on canvas/i }).click();

  await expect(
    page.locator("main").getByText(inboxContent, { exact: true }).first(),
  ).toBeVisible();
  await expect(inboxPanel.getByText("Organized")).toBeVisible();
});
