import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("saves Trip Material to the inbox and recovers it after reload", async ({ page }) => {
  const sourceUrl = "https://example.com/opaque-path-xyz123";

  await page.goto("/trips/demo-kyoto");
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();

  const inboxPanel = page.locator("aside");
  await expect(inboxPanel.getByRole("heading", { name: "Inbox" })).toBeVisible();
  await expect(inboxPanel.getByText("Saved capture")).toBeVisible();

  await inboxPanel.getByRole("textbox").fill(sourceUrl);
  await inboxPanel.getByRole("button", { name: "Submit inbox item" }).click();

  const inboxItemCard = inboxPanel.locator("div.group").filter({ hasText: "example.com" });
  await expect(inboxItemCard).toBeVisible();
  await expect(inboxItemCard.getByRole("link", { name: "Open original source" })).toHaveAttribute(
    "href",
    sourceUrl,
  );

  await page.waitForTimeout(600);
  await page.reload();

  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();
  const reloadedInbox = page.locator("aside");
  const recoveredItem = reloadedInbox.locator("div.group").filter({ hasText: "example.com" });
  await expect(recoveredItem).toBeVisible();
  await expect(recoveredItem.getByRole("link", { name: "Open original source" })).toHaveAttribute(
    "href",
    sourceUrl,
  );
});
