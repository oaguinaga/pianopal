import { expect, test } from "@playwright/test";

test.describe("VisualPiano Component", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Storybook page with our piano component
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should render default piano with correct layout", async ({ page }) => {
    // Navigate to the Default story
    await page.click("text=VisualPiano");
    await page.click("text=Default");

    // Wait for the component to render
    await page.waitForSelector(".visual-piano");

    // Check that white keys are visible
    const whiteKeys = page.locator(".white-key");
    await expect(whiteKeys).toHaveCount(14); // 2 octaves * 7 white keys

    // Check that black keys are visible
    const blackKeys = page.locator(".black-key");
    await expect(blackKeys).toHaveCount(10); // 2 octaves * 5 black keys

    // Take a screenshot for visual comparison
    await expect(page.locator(".visual-piano")).toHaveScreenshot("default-piano.png");
  });

  test("should properly highlight notes in HighlightedSharpNotes story", async ({ page }) => {
    // Navigate to the HighlightedSharpNotes story
    await page.click("text=VisualPiano");
    await page.click("text=Highlighted Sharp Notes");

    await page.waitForSelector(".visual-piano");

    // Check that C# is highlighted with the correct color
    const cSharpKey = page.locator("button").filter({ hasText: "C#1" }).first();
    await expect(cSharpKey).toHaveClass(/bg-blue-/);

    // Check that F# is highlighted with the correct color
    const fSharpKey = page.locator("button").filter({ hasText: "F#1" }).first();
    await expect(fSharpKey).toHaveClass(/bg-emerald-/);

    // Take screenshot to verify colors
    await expect(page.locator(".visual-piano")).toHaveScreenshot("highlighted-sharp-notes.png");
  });

  test("should properly highlight notes in HighlightedNaturalNotes story", async ({ page }) => {
    // Navigate to the HighlightedNaturalNotes story
    await page.click("text=VisualPiano");
    await page.click("text=Highlighted Natural Notes");

    await page.waitForSelector(".visual-piano");

    // Check that D, G, B are highlighted with correct colors
    const dKey = page.locator("button").filter({ hasText: "D1" }).first();
    await expect(dKey).toHaveClass(/bg-purple-/);

    const gKey = page.locator("button").filter({ hasText: "G1" }).first();
    await expect(gKey).toHaveClass(/bg-red-/);

    const bKey = page.locator("button").filter({ hasText: "B1" }).first();
    await expect(bKey).toHaveClass(/bg-yellow-/);

    // Take screenshot to verify colors
    await expect(page.locator(".visual-piano")).toHaveScreenshot("highlighted-natural-notes.png");
  });

  test("should show active states when keys are clicked", async ({ page }) => {
    // Navigate to the Default story
    await page.click("text=VisualPiano");
    await page.click("text=Default");

    await page.waitForSelector(".visual-piano");

    // Click on C key and verify it shows active state
    const cKey = page.locator(".white-key").first();

    // Take screenshot before click
    await expect(page.locator(".visual-piano")).toHaveScreenshot("before-click.png");

    // Click and hold the key
    await cKey.dispatchEvent("mousedown");

    // Verify the key has active styling
    await expect(cKey).toHaveClass(/active-key/);

    // Take screenshot during active state
    await expect(page.locator(".visual-piano")).toHaveScreenshot("during-click.png");

    // Release the key
    await cKey.dispatchEvent("mouseup");

    // Take screenshot after release
    await expect(page.locator(".visual-piano")).toHaveScreenshot("after-click.png");
  });

  test("should maintain black key alignment during window resize", async ({ page }) => {
    // Navigate to the BlackKeyAlignment story
    await page.click("text=VisualPiano");
    await page.click("text=Black Key Alignment");

    await page.waitForSelector(".visual-piano");

    // Take screenshot at default size
    await expect(page.locator(".visual-piano")).toHaveScreenshot("alignment-desktop.png");

    // Resize to tablet width
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(500); // Wait for resize

    // Check that black keys are still properly positioned
    const cSharpKey = page.locator(".black-key").first();
    const whiteKeys = page.locator(".white-key");

    // Get positions
    const cSharpBox = await cSharpKey.boundingBox();
    const cKeyBox = await whiteKeys.nth(0).boundingBox();
    const dKeyBox = await whiteKeys.nth(1).boundingBox();

    // Verify C# is positioned between C and D
    expect(cSharpBox?.x).toBeGreaterThan(cKeyBox?.x || 0);
    expect(cSharpBox?.x).toBeLessThan((dKeyBox?.x || 0) + (dKeyBox?.width || 0));

    // Take screenshot at tablet size
    await expect(page.locator(".visual-piano")).toHaveScreenshot("alignment-tablet.png");

    // Resize to mobile width
    await page.setViewportSize({ width: 375, height: 600 });
    await page.waitForTimeout(500); // Wait for resize

    // Take screenshot at mobile size
    await expect(page.locator(".visual-piano")).toHaveScreenshot("alignment-mobile.png");
  });

  test("should render single octave correctly (C key visibility)", async ({ page }) => {
    // Navigate to the SingleOctave story
    await page.click("text=VisualPiano");
    await page.click("text=Single Octave");

    await page.waitForSelector(".visual-piano");

    // Check that all 7 white keys are visible
    const whiteKeys = page.locator(".white-key");
    await expect(whiteKeys).toHaveCount(7);

    // Check that the first key (C) is fully visible
    const cKey = whiteKeys.first();
    const cKeyBox = await cKey.boundingBox();
    const containerBox = await page.locator(".piano-container").boundingBox();

    // Verify C key is not cut off (left edge should be within container)
    expect(cKeyBox?.x).toBeGreaterThanOrEqual(containerBox?.x || 0);

    // Take screenshot to verify visibility
    await expect(page.locator(".visual-piano")).toHaveScreenshot("single-octave.png");
  });

  test("should render seven octaves correctly (B key visibility)", async ({ page }) => {
    // Navigate to the SevenOctaves story
    await page.click("text=VisualPiano");
    await page.click("text=Seven Octaves");

    await page.waitForSelector(".visual-piano");

    // Check that all 49 white keys are present (7 octaves * 7 keys)
    const whiteKeys = page.locator(".white-key");
    await expect(whiteKeys).toHaveCount(49);

    // Scroll to the end to check the last B key
    await page.locator(".visual-piano").evaluate((el: HTMLElement) => {
      el.scrollLeft = 10000;
    });

    // Check that the last key (B) is fully visible
    const lastKey = whiteKeys.last();
    const lastKeyBox = await lastKey.boundingBox();
    const containerBox = await page.locator(".piano-container").boundingBox();

    // Verify last key is not cut off (right edge should be within container bounds)
    expect((lastKeyBox?.x || 0) + (lastKeyBox?.width || 0))
      .toBeLessThanOrEqual((containerBox?.x || 0) + (containerBox?.width || 0));

    // Take screenshot of the full piano
    await expect(page.locator(".visual-piano")).toHaveScreenshot("seven-octaves.png");
  });

  test("should support both color modes correctly", async ({ page }) => {
    // Test per-note color mode
    await page.click("text=VisualPiano");
    await page.click("text=Per Note Color Mode");

    await page.waitForSelector(".visual-piano");

    // Check that different notes have different colors
    const cKey = page.locator("button").filter({ hasText: "C1" }).first();
    const dSharpKey = page.locator("button").filter({ hasText: "D#1" }).first();
    const fSharpKey = page.locator("button").filter({ hasText: "F#1" }).first();

    // Each should have different color classes
    await expect(cKey).toHaveClass(/bg-blue-/);
    await expect(dSharpKey).toHaveClass(/bg-purple-/);
    await expect(fSharpKey).toHaveClass(/bg-emerald-/);

    await expect(page.locator(".visual-piano")).toHaveScreenshot("per-note-colors.png");

    // Test mono color mode
    await page.click("text=Mono Color Mode");
    await page.waitForSelector(".visual-piano");

    // All highlighted keys should have the same color (indigo)
    const allHighlightedKeys = page.locator(".highlighted-key");
    for (let i = 0; i < await allHighlightedKeys.count(); i++) {
      await expect(allHighlightedKeys.nth(i)).toHaveClass(/bg-indigo-/);
    }

    await expect(page.locator(".visual-piano")).toHaveScreenshot("mono-colors.png");
  });

  test("should handle dark theme correctly", async ({ page }) => {
    // Navigate to dark theme story
    await page.click("text=VisualPiano");
    await page.click("text=Dark Theme");

    await page.waitForSelector(".visual-piano");

    // Verify dark theme is applied
    await expect(page.locator(".visual-piano")).toHaveAttribute("data-theme", "dark");

    // Take screenshot to verify dark theme appearance
    await expect(page.locator(".visual-piano")).toHaveScreenshot("dark-theme.png");
  });

  test("should display labels correctly", async ({ page }) => {
    // Test letter labels
    await page.click("text=VisualPiano");
    await page.click("text=With Letter Labels");

    await page.waitForSelector(".visual-piano");

    // Check that labels are visible
    await expect(page.locator("text=C1")).toBeVisible();
    await expect(page.locator("text=D1")).toBeVisible();
    await expect(page.locator("text=C#1")).toBeVisible();

    await expect(page.locator(".visual-piano")).toHaveScreenshot("letter-labels.png");

    // Test do-re-mi labels
    await page.click("text=With Do Re Mi Labels");
    await page.waitForSelector(".visual-piano");

    // Check that do-re-mi labels are visible
    await expect(page.locator("text=Do1")).toBeVisible();
    await expect(page.locator("text=Re1")).toBeVisible();
    await expect(page.locator("text=Do#1")).toBeVisible();

    await expect(page.locator(".visual-piano")).toHaveScreenshot("do-re-mi-labels.png");
  });
});
