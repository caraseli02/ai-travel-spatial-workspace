import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("creates a Connection via a Linking Session", async ({ page }) => {
  await page.goto("/trips/demo-kyoto");
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();

  const initialConnectionCount = await page.evaluate(() => {
    const trips = JSON.parse(localStorage.getItem("wayfarer_trips") ?? "[]");
    const demo = trips.find((trip: { id: string }) => trip.id === "demo-kyoto");
    return demo.connections.length;
  });

  await page.getByRole("button").filter({ hasText: "Pack light!" }).click();
  await page.getByRole("button", { name: "Link with another card" }).click();

  const linkModeBanner = page.getByText("Link Mode: Click another card on the canvas to connect them");
  await expect(linkModeBanner).toBeVisible();

  await page.getByRole("button").filter({ hasText: "🍵 Matcha kit-kats" }).click();
  await expect(linkModeBanner).toBeHidden();

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const trips = JSON.parse(localStorage.getItem("wayfarer_trips") ?? "[]");
        const demo = trips.find((trip: { id: string }) => trip.id === "demo-kyoto");
        return demo.connections.length;
      });
    })
    .toBe(initialConnectionCount + 1);
});

test("submits an AI Prompt and shows the planner reply", async ({ page }) => {
  await page.goto("/trips/demo-kyoto");
  await expect(page.getByRole("heading", { name: "7 Days in Kyoto" })).toBeVisible();

  const promptInput = page.getByPlaceholder(/paste a link or note to save|Ask AI about this trip/i);
  await promptInput.fill("Plan Day 8");
  await promptInput.press("Enter");

  await expect(page.getByPlaceholder("AI is thinking...")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("AI reply added", { timeout: 5000 });
  await expect(page.getByRole("heading", { name: "AI Planner Reply" })).toBeVisible();
});

test("keeps the AI prompt bar available in Map view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/trips/demo-kyoto");

  await page.getByRole("button", { name: "Map view" }).first().click();
  await expect(page.getByPlaceholder(/paste a link or note to save|Ask AI about this trip/i)).toBeVisible();
});
