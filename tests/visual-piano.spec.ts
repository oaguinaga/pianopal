import { expect, test } from "@playwright/test";

test.describe("VisualPiano Component - Core Functionality", () => {
  test("should render default piano via direct story URL", async ({ page }) => {
    // Navigate directly to the Default story
    await page.goto("/?path=/story/components-visualpiano--default");
    await page.waitForLoadState("networkidle");

    // Wait for the component to render in the iframe
    const iframe = page.frameLocator("iframe[title=\"storybook-preview-iframe\"]");
    await iframe.locator(".visual-piano").waitFor({ timeout: 10000 });

    // Check that white keys are visible
    const whiteKeys = iframe.locator(".white-key");
    await expect(whiteKeys).toHaveCount(14); // 2 octaves * 7 white keys

    // Check that black keys are visible
    const blackKeys = iframe.locator(".black-key");
    await expect(blackKeys).toHaveCount(10); // 2 octaves * 5 black keys

    // Take a screenshot for visual comparison
    await expect(iframe.locator(".visual-piano")).toHaveScreenshot("default-piano.png");
  });

  test("should display flat notation correctly", async ({ page }) => {
    // Navigate to the flat notation verification story
    await page.goto("/?path=/story/components-visualpiano--color-verification-flat");
    await page.waitForLoadState("networkidle");

    const iframe = page.frameLocator("iframe[title=\"storybook-preview-iframe\"]");
    await iframe.locator(".visual-piano").waitFor({ timeout: 10000 });

    // Check that Db label is displayed (not C#)
    await expect(iframe.locator("text=Db1")).toBeVisible();

    // Check that the key has purple color (not blue)
    const dbKey = iframe.locator("button").filter({ hasText: "Db1" }).first();
    await expect(dbKey).toHaveClass(/bg-purple-400/);

    await expect(iframe.locator(".visual-piano")).toHaveScreenshot("flat-notation-verification.png");
  });

  test("should apply mono color mode correctly", async ({ page }) => {
    // Navigate to the mono color verification story
    await page.goto("/?path=/story/components-visualpiano--color-verification-mono");
    await page.waitForLoadState("networkidle");

    const iframe = page.frameLocator("iframe[title=\"storybook-preview-iframe\"]");
    await iframe.locator(".visual-piano").waitFor({ timeout: 10000 });

    // Check that highlighted keys use indigo colors
    const whiteKeys = iframe.locator(".highlighted-key.white-key");
    if (await whiteKeys.count() > 0) {
      await expect(whiteKeys.first()).toHaveClass(/bg-indigo-200/);
    }

    const blackKeys = iframe.locator(".highlighted-key.black-key");
    if (await blackKeys.count() > 0) {
      await expect(blackKeys.first()).toHaveClass(/bg-indigo-400/);
    }

    await expect(iframe.locator(".visual-piano")).toHaveScreenshot("mono-color-verification.png");
  });
});
