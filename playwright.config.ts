import { defineConfig, devices } from "@playwright/test";

import env from "./lib/env";

const isCI = Boolean(env.CI);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["html", { outputFolder: "./tests/reports" }]],
  use: {
    baseURL: "http://localhost:6008",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "pnpm run storybook",
    url: "http://localhost:6008",
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
