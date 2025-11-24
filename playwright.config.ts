import { defineConfig, devices } from "@playwright/test";
import { config } from "./src/config/env.config";

/**
 * Playwright Test Configuration
 * Professional setup with comprehensive options
 */
export default defineConfig({
  // Test directory
  testDir: "./tests",
  globalSetup: require.resolve("./tests/global-setup.ts"),

  // Test file patterns
  testMatch: "**/*.spec.ts",

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Parallel execution
  workers: process.env.CI ? 2 : config.workers,

  // Fully parallel execution
  fullyParallel: true,

  // Reporter configuration
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    ["list"],
  ],

  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: config.baseUrl,

    // Browser options
    headless: config.headless,
    slowMo: config.slowMo,

    // Collect trace on failure
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Timeout for actions
    actionTimeout: 15 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,

    // Viewport
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Accept downloads
    acceptDownloads: true,

    // Locale
    locale: "en-US",

    // Timezone
    timezoneId: "America/New_York",

    // Permissions
    permissions: ["clipboard-read", "clipboard-write"],

    // Extra HTTP headers
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  // Test output directory
  outputDir: "test-results/",

  // Configure projects for different browsers
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    // Mobile viewports
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
      },
    },

    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
      },
    },

    // Tablet viewports
    {
      name: "tablet",
      use: {
        ...devices["iPad Pro"],
      },
    },
  ],

  // Global setup/teardown
  // globalSetup: require.resolve('./tests/global-setup.ts'),
  // globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // Web server configuration (if needed)
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  //   timeout: 120 * 1000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
