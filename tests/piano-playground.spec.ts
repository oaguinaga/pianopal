import { expect, test } from "@playwright/test";

test.describe("PianoPlayground Component", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the playground page
    await page.goto("/playground");
  });

  test("should render correctly", async ({ page }) => {
    // Check that the main components are visible
    await expect(page.locator(".piano-playground")).toBeVisible();
    await expect(page.locator(".visual-piano")).toBeVisible();

    // Check that the keyboard guide is visible by default
    await expect(page.locator(".keyboard-guide")).toBeVisible();

    // Check that the focus instructions are visible initially
    await expect(page.locator(".focus-instructions")).toBeVisible();
  });

  test("should respond to keyboard input", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Wait for focus instructions to disappear
    await expect(page.locator(".focus-instructions")).not.toBeVisible();

    // Press a key and check if the corresponding note is activated
    await page.keyboard.press("a");

    // Check that the note is active (C4 should be highlighted)
    await expect(page.locator(".white-key.active-key")).toBeVisible();

    // Release the key and check if the note is deactivated
    await page.keyboard.up("a");
    await expect(page.locator(".white-key.active-key")).not.toBeVisible();
  });

  test("should handle multiple simultaneous key presses (polyphony)", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Press multiple keys for a chord (C major: C, E, G)
    await page.keyboard.down("a"); // C4
    await page.keyboard.down("d"); // E4
    await page.keyboard.down("g"); // G4

    // Check if all notes are activated
    await expect(page.locator(".white-key.active-key")).toHaveCount(3);

    // Release keys one by one
    await page.keyboard.up("a");
    await expect(page.locator(".white-key.active-key")).toHaveCount(2);

    await page.keyboard.up("d");
    await expect(page.locator(".white-key.active-key")).toHaveCount(1);

    await page.keyboard.up("g");
    await expect(page.locator(".white-key.active-key")).not.toBeVisible();
  });

  test("should handle black key input", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Press a black key (C#)
    await page.keyboard.press("w");

    // Check that the black key is active
    await expect(page.locator(".black-key.active-key")).toBeVisible();

    // Release the key
    await page.keyboard.up("w");
    await expect(page.locator(".black-key.active-key")).not.toBeVisible();
  });

  test("should clear all notes when focus is lost", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Press multiple keys
    await page.keyboard.down("a");
    await page.keyboard.down("d");
    await page.keyboard.down("g");

    // Verify notes are active
    await expect(page.locator(".active-key")).toHaveCount(3);

    // Click elsewhere to lose focus
    await page.locator("body").click({ position: { x: 10, y: 10 } });

    // Check if all notes are deactivated
    await expect(page.locator(".active-key")).not.toBeVisible();

    // Check that focus instructions are visible again
    await expect(page.locator(".focus-instructions")).toBeVisible();
  });

  test("should handle octave shifting", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Check initial octave shift value
    await expect(page.locator("text=Octave Shift: 0")).toBeVisible();

    // Click the "Higher Octave" button
    await page.locator("button:has-text('Higher Octave')").click();

    // Check that octave shift increased
    await expect(page.locator("text=Octave Shift: +1")).toBeVisible();

    // Click the "Lower Octave" button
    await page.locator("button:has-text('Lower Octave')").click();

    // Check that octave shift decreased
    await expect(page.locator("text=Octave Shift: 0")).toBeVisible();
  });

  test("should respect octave shift limits", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Try to shift up 4 times (should be limited to 3)
    for (let i = 0; i < 4; i++) {
      await page.locator("button:has-text('Higher Octave')").click();
    }

    // Check that it's limited to +3
    await expect(page.locator("text=Octave Shift: +3")).toBeVisible();
    await expect(page.locator("button:has-text('Higher Octave')")).toBeDisabled();

    // Try to shift down 7 times (should be limited to -3)
    for (let i = 0; i < 7; i++) {
      await page.locator("button:has-text('Lower Octave')").click();
    }

    // Check that it's limited to -3
    await expect(page.locator("text=Octave Shift: -3")).toBeVisible();
    await expect(page.locator("button:has-text('Lower Octave')")).toBeDisabled();
  });

  test("should update keyboard guide based on octave shift", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Check initial mapping (A should map to C4)
    await expect(page.locator(".key-map-item:has-text('A') .note")).toContainText("C4");

    // Shift octave up
    await page.locator("button:has-text('Higher Octave')").click();

    // Check that mapping updated (A should now map to C5)
    await expect(page.locator(".key-map-item:has-text('A') .note")).toContainText("C5");
  });

  test("should handle configuration changes", async ({ page }) => {
    // Change octave range to 1
    await page.locator("select").first().selectOption("1");

    // Check that the piano updates
    await expect(page.locator(".octave-container")).toHaveCount(1);

    // Change start octave to 4
    await page.locator("select").nth(1).selectOption("4");

    // Check that the keyboard guide updates
    await expect(page.locator(".key-map-item:has-text('A') .note")).toContainText("C4");

    // Toggle keyboard guide
    await page.locator("input[type='checkbox']").first().uncheck();

    // Check that keyboard guide is hidden
    await expect(page.locator(".keyboard-guide")).not.toBeVisible();
  });

  test("should handle rapid key presses without stuck notes", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Rapidly press and release a key multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("a");
      await page.keyboard.up("a");
    }

    // Check that no notes are stuck
    await expect(page.locator(".active-key")).not.toBeVisible();
  });

  test("should handle key repeat events properly", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Hold down a key (simulating key repeat)
    await page.keyboard.down("a");

    // Simulate key repeat by pressing the same key again
    await page.keyboard.press("a");

    // Check that only one note is active (not duplicated)
    await expect(page.locator(".active-key")).toHaveCount(1);

    // Release the key
    await page.keyboard.up("a");
    await expect(page.locator(".active-key")).not.toBeVisible();
  });

  test("should work with different label styles", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Change label style to "letter"
    await page.locator("select").nth(2).selectOption("letter");

    // Check that letter labels are visible
    await expect(page.locator(".white-key .text-xs")).toBeVisible();

    // Change label style to "do-re-mi"
    await page.locator("select").nth(2).selectOption("do-re-mi");

    // Check that Do-Re-Mi labels are visible
    await expect(page.locator(".white-key .text-xs")).toBeVisible();

    // Change label style to "none"
    await page.locator("select").nth(2).selectOption("none");

    // Check that no labels are visible
    await expect(page.locator(".white-key .text-xs")).not.toBeVisible();
  });

  test("should handle color mode changes", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Press a key to activate it
    await page.keyboard.press("a");

    // Check that the note is active with per-note colors
    await expect(page.locator(".white-key.active-key")).toBeVisible();

    // Change to mono color mode
    await page.locator("select").nth(3).selectOption("mono");

    // Check that the note is still active but with mono colors
    await expect(page.locator(".white-key.active-key")).toBeVisible();

    // Release the key
    await page.keyboard.up("a");
  });

  test("should be accessible with keyboard navigation", async ({ page }) => {
    // Navigate to the piano using Tab
    await page.keyboard.press("Tab");

    // Check that the piano is focused
    await expect(page.locator(".piano-playground")).toBeFocused();

    // Press Space to activate a note
    await page.keyboard.press("Space");

    // Check that a note is active
    await expect(page.locator(".active-key")).toBeVisible();

    // Press Space again to deactivate
    await page.keyboard.press("Space");

    // Check that no notes are active
    await expect(page.locator(".active-key")).not.toBeVisible();
  });

  test("should handle edge cases gracefully", async ({ page }) => {
    // Focus the piano
    await page.locator(".piano-playground").click();

    // Press unmapped keys (should not cause errors)
    await page.keyboard.press("q");
    await page.keyboard.press("r");
    await page.keyboard.press("i");

    // Check that no notes are activated
    await expect(page.locator(".active-key")).not.toBeVisible();

    // Press modifier keys (should not cause errors)
    await page.keyboard.press("Shift");
    await page.keyboard.press("Control");
    await page.keyboard.press("Alt");

    // Check that no notes are activated
    await expect(page.locator(".active-key")).not.toBeVisible();
  });
});
