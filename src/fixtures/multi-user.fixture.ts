import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { config } from '@config/env.config';
import { AppRegistry, MultiUserRegistry, createAppRegistry, createMultiUserRegistry } from '../registries';

/**
 * Multi-User Test Context
 * Supports 1-3 users with flexible destructuring
 *
 * IMPORTANT: All users are automatically:
 * - Navigated to the home page (config.baseUrl)
 * - Waiting for network idle
 * - Ready to use immediately
 *
 * Usage:
 * - 1 user:  test('...', async ({ user1 }) => {})
 * - 2 users: test('...', async ({ user1, user2 }) => {})
 * - 3 users: test('...', async ({ user1, user2, user3 }) => {})
 * - Registry: test('...', async ({ registry }) => {})
 *
 * Pages are READY TO USE - no need to call navigate() unless going to a different page!
 */
export interface MultiUserContext {
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
  user2: AppRegistry; // Alias for easy destructuring

  // User 3
  user3Context: BrowserContext;
  user3Page: Page;
  user3Registry: AppRegistry;
  user3: AppRegistry; // Alias for easy destructuring

  // Combined multi-user registry
  registry: MultiUserRegistry;
}

/**
 * Multi-User Fixture Configuration
 * Creates up to 3 independent browser contexts with separate sessions
 */
export const multiUserTest = base.extend<MultiUserContext>({
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
   * Creates an incognito context for the first user
   */
  user1Context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York',
      storageState: undefined, // Start fresh
    });

    await use(context);
    await context.close();
  },

  /**
   * User 1 Page
   * Automatically navigates to home page and waits for load
   */
  user1Page: async ({ user1Context }, use) => {
    const page = await user1Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

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
   * Creates a separate incognito context for the second user
   */
  user2Context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York',
      storageState: undefined,
    });

    await use(context);
    await context.close();
  },

  /**
   * User 2 Page
   * Automatically navigates to home page and waits for load
   */
  user2Page: async ({ user2Context }, use) => {
    const page = await user2Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

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
   * Creates a separate incognito context for the third user
   */
  user3Context: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      permissions: ['clipboard-read', 'clipboard-write'],
      locale: 'en-US',
      timezoneId: 'America/New_York',
      storageState: undefined,
    });

    await use(context);
    await context.close();
  },

  /**
   * User 3 Page
   * Automatically navigates to home page and waits for load
   */
  user3Page: async ({ user3Context }, use) => {
    const page = await user3Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

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
export { expect } from '@playwright/test';
