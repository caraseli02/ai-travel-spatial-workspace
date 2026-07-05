import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("scrolls the desktop kanban board to a selected offscreen day chip", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  const kanbanScroller = page.locator("div.overflow-x-auto.overflow-y-hidden").first();
  await expect(kanbanScroller).toBeVisible();

  const initialScrollLeft = await kanbanScroller.evaluate((element) => element.scrollLeft);
  expect(initialScrollLeft).toBe(0);

  await page.getByRole("button", { name: "Day 7", exact: true }).click();

  const daySevenColumn = page.getByRole("region", { name: /Day 7/i });
  await expect(daySevenColumn).toBeVisible();

  await expect
    .poll(async () => {
      const [columnBox, scrollerBox] = await Promise.all([
        daySevenColumn.boundingBox(),
        kanbanScroller.boundingBox(),
      ]);
      if (!columnBox || !scrollerBox) return false;

      return (
        columnBox.x >= scrollerBox.x - 4 &&
        columnBox.x + columnBox.width <= scrollerBox.x + scrollerBox.width + 4
      );
    })
    .toBe(true);

  const finalScrollLeft = await kanbanScroller.evaluate((element) => element.scrollLeft);
  expect(finalScrollLeft).toBeGreaterThan(0);
});
