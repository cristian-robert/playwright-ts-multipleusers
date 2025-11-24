import { test as base, Browser, BrowserContext, Page } from "@playwright/test";
import { config } from "@config/env.config";
import {
  AppRegistry,
  MultiUserRegistry,
  createAppRegistry,
  createMultiUserRegistry,
} from "../registries";
import { createMicrosoftAuthHelper } from "@utils/auth/microsoft-sso.helper";
import * as path from "path";
/**
 * Authenticated Multi-User Context
 * Provides 1-3 authenticated users with flexible destructuring
 *
 * IMPORTANT: All users are automatically:
 * - Navigated to the home page (config.baseUrl)
 * - Authenticated via Microsoft SSO (if Login button present)
 * - Waiting for network idle
 * - Ready to use immediately
 *
 * Authentication Logic:
 * 1. Navigate to config.baseUrl
 * 2. Check if Login button is displayed
 * 3. If displayed → click it → Microsoft SSO auth
 * 4. If not displayed → already logged in, continue
 *
 * Pages are READY TO USE - no need to call navigate() or login()!
 */
export interface AuthenticatedMultiUserContext {
  // Browser instance (shared)
  browser: Browser;

  // User 1
  user1Context: BrowserContext;
  user1Page: Page;
  user1Registry: AppRegistry;
  user1: AppRegistry; // Alias for easy destructuring

  // User 2
  user2Context: BrowserContext;
  user2Page: Page;
  user2Registry: AppRegistry;
  user2: AppRegistry; // Alias

  // User 3
  user3Context: BrowserContext;
  user3Page: Page;
  user3Registry: AppRegistry;
  user3: AppRegistry; // Alias

  // Combined multi-user registry
  registry: MultiUserRegistry;
}
const AUTH_DIR = path.join(process.cwd(), "playwright/.auth");

/**
 * Authenticated Multi-User Fixture
 * Direct fixture without extending multi-user.fixture
 */
export const authenticatedMultiUserTest =
  base.extend<AuthenticatedMultiUserContext>({
    /**
     * Shared browser instance
     */
    browser: async ({ playwright, browserName }, use) => {
      const browser = await playwright[browserName].launch({
        headless: config.headless,
        slowMo: config.slowMo,
      });
      await use(browser);
      await browser.close();
    },

    // ========== USER 1 ==========
    /**
     * User 1 Browser Context
     */
    user1Context: async ({ browser }, use) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        permissions: ["clipboard-read", "clipboard-write"],
        locale: "en-US",
        timezoneId: "America/New_York",
        storageState: path.join(AUTH_DIR, "user1.json"),
      });

      await use(context);
      await context.close();
    },
    /**
     * User 1 Page with automatic authentication
     */
    user1Page: async ({ user1Context }, use) => {
      const page = await user1Context.newPage();

      // Navigate to home page
      await page.goto(config.baseUrl);
      await page.waitForLoadState("networkidle");

      // Check if Login button is displayed
      const loginButton = page
        .locator('button:has-text("Login"), a:has-text("Login")')
        .first();
      const isLoginButtonVisible = await loginButton
        .isVisible()
        .catch(() => false);

      if (isLoginButtonVisible) {
        // User not logged in - need to authenticate
        console.log("🔐 User 1: Login button detected, authenticating...");

        if (config.user1.email && config.user1.password) {
          // Click login button to go to Microsoft SSO
          await loginButton.click();
          await page.waitForLoadState("networkidle");

          // Perform Microsoft SSO login
          const authHelper = createMicrosoftAuthHelper(page);
          await authHelper.login({
            email: config.user1.email,
            password: config.user1.password,
          });

          console.log("✅ User 1 authenticated successfully");
        } else {
          console.warn(
            "⚠️  User 1 credentials not configured. Cannot authenticate."
          );
        }
      } else {
        // User already logged in
        console.log("✅ User 1: Already logged in (no Login button)");
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState("networkidle");

      await use(page);
      await page.close();
    },

    /**
     * User 1 Registry
     */
    user1Registry: async ({ user1Page }, use) => {
      const registry = createAppRegistry(user1Page);
      await use(registry);
      registry.clearAll();
    },

    /**
     * User 1 Alias (for easy destructuring)
     */
    user1: async ({ user1Registry }, use) => {
      await use(user1Registry);
    },

    // ========== USER 2 ==========
    /**
     * User 2 Browser Context
     */
    user2Context: async ({ browser }, use) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        permissions: ["clipboard-read", "clipboard-write"],
        locale: "en-US",
        timezoneId: "America/New_York",
        storageState: path.join(AUTH_DIR, "user2.json"),
      });

      await use(context);
      await context.close();
    },

    /**
     * User 2 Page with automatic authentication
     */
    user2Page: async ({ user2Context }, use) => {
      const page = await user2Context.newPage();

      // Navigate to home page
      await page.goto(config.baseUrl);
      await page.waitForLoadState("networkidle");

      // Check if Login button is displayed
      const loginButton = page
        .locator('button:has-text("Login"), a:has-text("Login")')
        .first();
      const isLoginButtonVisible = await loginButton
        .isVisible()
        .catch(() => false);

      if (isLoginButtonVisible) {
        // User not logged in - need to authenticate
        console.log("🔐 User 2: Login button detected, authenticating...");

        if (config.user2.email && config.user2.password) {
          // Click login button to go to Microsoft SSO
          await loginButton.click();
          await page.waitForLoadState("networkidle");

          // Perform Microsoft SSO login
          const authHelper = createMicrosoftAuthHelper(page);
          await authHelper.login({
            email: config.user2.email,
            password: config.user2.password,
          });

          console.log("✅ User 2 authenticated successfully");
        } else {
          console.warn(
            "⚠️  User 2 credentials not configured. Cannot authenticate."
          );
        }
      } else {
        // User already logged in
        console.log("✅ User 2: Already logged in (no Login button)");
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState("networkidle");

      await use(page);
      await page.close();
    },

    /**
     * User 2 Registry
     */
    user2Registry: async ({ user2Page }, use) => {
      const registry = createAppRegistry(user2Page);
      await use(registry);
      registry.clearAll();
    },

    /**
     * User 2 Alias (for easy destructuring)
     */
    user2: async ({ user2Registry }, use) => {
      await use(user2Registry);
    },

    // ========== USER 3 ==========
    /**
     * User 3 Browser Context
     */
    user3Context: async ({ browser }, use) => {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
        permissions: ["clipboard-read", "clipboard-write"],
        locale: "en-US",
        timezoneId: "America/New_York",
        storageState: path.join(AUTH_DIR, "user3.json"),
      });

      await use(context);
      await context.close();
    },

    /**
     * User 3 Page with automatic authentication
     */
    user3Page: async ({ user3Context }, use) => {
      const page = await user3Context.newPage();

      // Navigate to home page
      await page.goto(config.baseUrl);
      await page.waitForLoadState("networkidle");

      // Check if Login button is displayed
      const loginButton = page
        .locator('button:has-text("Login"), a:has-text("Login")')
        .first();
      const isLoginButtonVisible = await loginButton
        .isVisible()
        .catch(() => false);

      if (isLoginButtonVisible) {
        // User not logged in - need to authenticate
        console.log("🔐 User 3: Login button detected, authenticating...");

        if (config.user3.email && config.user3.password) {
          // Click login button to go to Microsoft SSO
          await loginButton.click();
          await page.waitForLoadState("networkidle");

          // Perform Microsoft SSO login
          const authHelper = createMicrosoftAuthHelper(page);
          await authHelper.login({
            email: config.user3.email,
            password: config.user3.password,
          });

          console.log("✅ User 3 authenticated successfully");
        } else {
          console.warn(
            "⚠️  User 3 credentials not configured. Cannot authenticate."
          );
        }
      } else {
        // User already logged in
        console.log("✅ User 3: Already logged in (no Login button)");
      }

      // Wait for page to be fully loaded
      await page.waitForLoadState("networkidle");

      await use(page);
      await page.close();
    },

    /**
     * User 3 Registry
     */
    user3Registry: async ({ user3Page }, use) => {
      const registry = createAppRegistry(user3Page);
      await use(registry);
      registry.clearAll();
    },

    /**
     * User 3 Alias (for easy destructuring)
     */
    user3: async ({ user3Registry }, use) => {
      await use(user3Registry);
    },

    // ========== COMBINED REGISTRY ==========
    /**
     * Combined Multi-User Registry
     * Provides unified access to all three user registries
     */
    registry: async ({ user1Page, user2Page, user3Page }, use) => {
      const registry = createMultiUserRegistry(user1Page, user2Page, user3Page);
      await use(registry);
      registry.clearAll();
    },
  });

/**
 * Export the test and expect objects
 */
export { expect } from "@playwright/test";

/**
 * Export as default test for convenience
 */
export const test = authenticatedMultiUserTest;
