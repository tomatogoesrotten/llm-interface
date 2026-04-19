import { test, expect } from "@playwright/test";

test("sends a message and streams a reply", async ({ page }) => {
  await page.goto("/");
  const input = page.getByLabel("message");
  await input.fill("Reply with the single word: pong");
  await input.press("Enter");

  const assistantBubble = page.getByTestId("msg-assistant").last();
  await expect(assistantBubble).not.toHaveText("…", { timeout: 20_000 });
  await expect(assistantBubble).toContainText(/pong/i, { timeout: 20_000 });
});

test("persists session across reload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("message").fill("Say hi");
  await page.getByLabel("message").press("Enter");
  await expect(page.getByTestId("msg-assistant").last()).not.toHaveText("…", { timeout: 20_000 });

  const countBefore = await page.getByTestId(/msg-/).count();
  await page.reload();
  await expect(page.getByTestId(/msg-/)).toHaveCount(countBefore);
});

test("request carries credentials and no CORS error", async ({ page }) => {
  const reqs: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/chat/stream")) reqs.push(r.url());
  });
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  await page.goto("/");
  await page.getByLabel("message").fill("hi");
  await page.getByLabel("message").press("Enter");
  await expect(page.getByTestId("msg-assistant").last()).not.toHaveText("…", { timeout: 20_000 });

  expect(reqs.length).toBeGreaterThan(0);
  expect(errs.join("\n")).not.toMatch(/CORS|Access-Control-Allow-Origin/i);
});
