import { expect, test } from "@playwright/test";

test.describe("PianoPlayground Storybook - Keyboard Hints", () => {
  test.setTimeout(60000);
  test("should display keyboard hints inside keys when enabled", async ({ page }) => {
    // Open the dedicated story with hints enabled
    await page.goto("/?path=/story/components-pianoplayground--with-keyboard-hints");
    await page.waitForLoadState("networkidle");

    const iframe = page.frameLocator("iframe[title=\"storybook-preview-iframe\"]");
    await iframe.locator(".piano-playground").waitFor({ timeout: 30000 });
    await iframe.locator(".visual-piano").waitFor({ timeout: 30000 });

    // Expect at least one kbd hint to be visible within the visual piano
    const hint = iframe.locator(".visual-piano .white-key kbd, .visual-piano .black-key kbd");
    await expect(hint.first()).toBeVisible({ timeout: 30000 });

    // Visual snapshot for WithKeyboardHints story
    await expect(iframe.locator(".visual-piano")).toHaveScreenshot("with-keyboard-hints.png");
  });
});
