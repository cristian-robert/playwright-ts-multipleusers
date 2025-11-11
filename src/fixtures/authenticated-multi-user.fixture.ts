import { test as base } from '@playwright/test';
import { multiUserTest, MultiUserContext } from './multi-user.fixture';
import { createMicrosoftAuthHelper } from '@utils/auth/microsoft-sso.helper';
import { config } from '@config/env.config';

/**
 * Authenticated Multi-User Context
 * Extends MultiUserContext with automatic authentication for all 3 users
 *
 * IMPORTANT: All users are automatically:
 * - Navigated to the home page (config.baseUrl)
 * - Authenticated via Microsoft SSO
 * - Waiting for network idle
 * - Ready to use immediately
 *
 * Pages are READY TO USE - no need to call navigate() or login()!
 * Just start interacting with the page elements.
 */
export interface AuthenticatedMultiUserContext extends MultiUserContext {
  // All users are automatically authenticated before tests
  // All registries (pages, services) are available and ready to use
}

/**
 * Authenticated Multi-User Fixture
 * Automatically logs in all three users using Microsoft SSO before each test
 */
export const authenticatedMultiUserTest = multiUserTest.extend<AuthenticatedMultiUserContext>({
  /**
   * Override user1Page to add automatic authentication
   */
  user1Page: async ({ user1Context }, use) => {
    const page = await user1Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Perform Microsoft SSO login
    if (config.user1.email && config.user1.password) {
      const authHelper = createMicrosoftAuthHelper(page);

      // Check if already logged in (e.g., from saved session)
      const isLoggedIn = await authHelper.isLoggedIn();

      if (!isLoggedIn) {
        console.log('🔐 Logging in User 1...');
        await authHelper.login({
          email: config.user1.email,
          password: config.user1.password,
        });
      } else {
        console.log('✅ User 1 already logged in');
      }
    } else {
      console.warn('⚠️  User 1 credentials not configured. Skipping authentication.');
    }

    // Wait for page to be fully loaded after authentication
    await page.waitForLoadState('networkidle');

    await use(page);
    await page.close();
  },

  /**
   * Override user2Page to add automatic authentication
   */
  user2Page: async ({ user2Context }, use) => {
    const page = await user2Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Perform Microsoft SSO login
    if (config.user2.email && config.user2.password) {
      const authHelper = createMicrosoftAuthHelper(page);

      // Check if already logged in
      const isLoggedIn = await authHelper.isLoggedIn();

      if (!isLoggedIn) {
        console.log('🔐 Logging in User 2...');
        await authHelper.login({
          email: config.user2.email,
          password: config.user2.password,
        });
      } else {
        console.log('✅ User 2 already logged in');
      }
    } else {
      console.warn('⚠️  User 2 credentials not configured. Skipping authentication.');
    }

    // Wait for page to be fully loaded after authentication
    await page.waitForLoadState('networkidle');

    await use(page);
    await page.close();
  },

  /**
   * Override user3Page to add automatic authentication
   */
  user3Page: async ({ user3Context }, use) => {
    const page = await user3Context.newPage();

    // Navigate to home page
    await page.goto(config.baseUrl);

    // Perform Microsoft SSO login
    if (config.user3.email && config.user3.password) {
      const authHelper = createMicrosoftAuthHelper(page);

      // Check if already logged in
      const isLoggedIn = await authHelper.isLoggedIn();

      if (!isLoggedIn) {
        console.log('🔐 Logging in User 3...');
        await authHelper.login({
          email: config.user3.email,
          password: config.user3.password,
        });
      } else {
        console.log('✅ User 3 already logged in');
      }
    } else {
      console.warn('⚠️  User 3 credentials not configured. Skipping authentication.');
    }

    // Wait for page to be fully loaded after authentication
    await page.waitForLoadState('networkidle');

    await use(page);
    await page.close();
  },
});

/**
 * Export the test and expect objects
 */
export { expect } from '@playwright/test';
