import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  expect: {
    timeout: 15_000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,
  globalTimeout: 10 * 60_000,

  /* Configure projects for major browsers */
  projects: [
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "firefox-small-viewport",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { height: 844, width: 390 },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list"]],
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  testDir: "./tests",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",
    headless: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    viewport: { height: 720, width: 1280 },
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? "npm run start-e2e"
      : "npx cross-env E2E=true VITE_IS_E2E=true npm run build && npm run start-e2e",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    timeout: 240_000,
    url: "http://localhost:3000",
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
});
