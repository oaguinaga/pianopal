import { afterAll, beforeAll } from "vitest";
import { configDefaults, defineConfig } from "vitest/config";

// Global test setup
beforeAll(() => {
  // Set up any global test environment
  console.log("🧪 Setting up Vitest test environment...");
});

afterAll(() => {
  // Clean up global test environment
  console.log("🧹 Cleaning up test environment...");
});

// Global test configuration
export default defineConfig({
  test: {
    // Inherit from main config
    ...configDefaults,

    // Global test setup
    globals: true,

    // Test environment
    environment: "jsdom",

    // Setup files
    setupFiles: ["./tests/unit/setup.ts"],

    // Test discovery
    include: [
      "tests/unit/**/*.{test,spec}.{js,ts}",
      "tests/**/*.{test,spec}.{js,ts}",
    ],

    // Exclude patterns
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/coverage/**",
      "**/.git/**",
      "**/*.d.ts",
      "**/*.config.*",
    ],
  },
});
