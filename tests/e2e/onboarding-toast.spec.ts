import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("onboarding toast appears once for a new traveler and stays dismissed after reload", async ({
  page,
}) => {
  await page.goto("/trips/demo-kyoto?onboarding=1");

  await expect(page.getByText("Quick tip 1/3")).toBeVisible();

  await page.getByRole("button", { name: "Next tip" }).click();
  await page.getByRole("button", { name: "Next tip" }).click();
  await page.getByRole("button", { name: "Acknowledge and close onboarding tips" }).click();

  await expect(page.getByText("Quick tip 3/3")).toHaveCount(0);

  await page.reload();

  await expect(page.getByText("Quick tip 1/3")).toHaveCount(0);
});
