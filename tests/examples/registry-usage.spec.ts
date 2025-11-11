import { authenticatedMultiUserTest as test, expect } from '@fixtures/authenticated-multi-user.fixture';

/**
 * Registry Usage Examples - Single User
 * Demonstrates how to use registry from authenticated fixture
 *
 * NOTE: Fixture automatically navigates user1 to home page and authenticates.
 * Registry is READY TO USE via user1!
 */
test.describe('Registry Usage - Single User', () => {
  test('should use registry for pages and services', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!
    // user1 IS the registry - no need to create it!

    // ============================================================
    // ACCESS PAGES via user1.pages
    // ============================================================
    // No need to import and instantiate HomePage manually
    // The registry handles initialization and caching

    // All pages are cached - subsequent calls return same instance
    const userName = await user1.pages.home.header.getUserName();
    console.log(`User: ${userName}`);

    // ============================================================
    // ACCESS SERVICES via user1.services
    // ============================================================
    // Shadow DOM helper
    const notificationCount = await user1.services.shadow.getTextFromShadow(
      '[data-testid="notifications"]',
      '.badge'
    ).catch(() => '0');
    console.log(`Notifications: ${notificationCount}`);

    // Wait helpers (page already loaded, but can use for other operations)
    await user1.services.waits.waitForNetworkIdle();

    // Custom assertions
    await user1.services.assertions.assertUrlContains('/');

    // ============================================================
    // CHECK CACHE
    // ============================================================
    const cacheStats = user1.getCacheStats();
    console.log('Cache stats:', cacheStats);

    expect(cacheStats.pages).toContain('home');
  });

  test('should destructure services from registry', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // DESTRUCTURE for clean code
    // ============================================================
    const { home } = user1.pages;
    const { waits, assertions, shadow } = user1.services;

    // Use destructured services (already on home page!)
    await assertions.assertUrlContains('/');

    // Shadow DOM interaction
    const hasElement = await shadow.isElementInShadow(
      '[data-testid="header"]',
      '.logo'
    );
    console.log(`Logo in shadow DOM: ${hasElement}`);
  });

  test('should access API client via registry', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // API CLIENT ACCESS
    // ============================================================
    const { userApi } = user1.services;

    try {
      // Create test user via API
      const users = await userApi.getAllUsers(1, 10);
      console.log(`Found ${users.total} users`);
    } catch (error) {
      console.warn('API not configured, skipping');
      test.skip();
    }
  });

  test('should pass registry to helper functions', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // PASS REGISTRY TO FUNCTIONS
    // ============================================================
    await performUserFlow(user1);

    // Helper function that receives registry
    async function performUserFlow(registry: typeof user1) {
      const { home } = registry.pages;

      // Already on home page from fixture!
      // Do complex operations with access to all pages and services
      const categories = await home.categoriesSection.getAllCategories();
      console.log(`Found ${categories.length} categories`);
    }
  });

  test('should use registry with page fragments', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // FRAGMENTS via PAGES
    // ============================================================
    const { home } = user1.pages;

    // Already on home page! Access fragments through page objects
    await home.header.clickLogo();
    await home.categoriesSection.waitForVisible();

    const categoryCount = await home.categoriesSection.getCategoryCount();
    expect(categoryCount).toBeGreaterThanOrEqual(0);

    // Services for advanced operations
    await user1.services.waits.waitForNetworkIdle();
  });

  test('should clear registry cache between operations', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // CACHE MANAGEMENT
    // ============================================================

    // Already on home page - check current cache
    const stats1 = user1.getCacheStats();
    console.log('Initial cache (home page already loaded):', stats1);
    expect(stats1.pages).toContain('home');

    // Clear cache
    user1.clearAll();
    const stats2 = user1.getCacheStats();
    console.log('After clear:', stats2);
    expect(stats2.total).toBe(0);

    // Access home page again - creates new instance
    const userName = await user1.pages.home.header.getUserName();
    const stats3 = user1.getCacheStats();
    console.log('After re-access:', stats3);

    expect(stats3.total).toBeGreaterThan(0);
  });
});

/**
 * Advanced Registry Patterns
 */
test.describe('Advanced Registry Usage', () => {
  test('should use generic getPage method', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // DYNAMIC PAGE ACCESS
    // ============================================================
    // For pages not yet added to registry getter

    // This is useful when you have custom pages
    // const customPage = user1.pages.getPage('custom', () => new CustomPage(page));
    // await customPage.navigate();

    // Example with HomePage
    const dynamicHome = user1.pages.getPage('dynamicHome', () => {
      return user1.pages.home;
    });

    // Already on home page from fixture, just verify we can access it
    const userName = await dynamicHome.header.getUserName();
    console.log(`User: ${userName}`);
  });

  test('should use generic getService method', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // DYNAMIC SERVICE ACCESS
    // ============================================================
    // Custom service registration

    interface Logger {
      log: (message: string) => void;
    }

    const logger = user1.services.getService<Logger>('logger', () => ({
      log: (msg) => console.log(`[TEST] ${msg}`),
    }));

    logger.log('Custom service working!');

    // Verify it's cached
    const sameLogger = user1.services.getService<Logger>('logger', () => ({
      log: (msg) => console.log(`This won't be called`),
    }));

    expect(logger).toBe(sameLogger);
  });

  test('should combine registry with custom logic', async ({ user1 }) => {
    // User already on home page and authenticated from fixture!

    // ============================================================
    // CUSTOM WORKFLOW BUILDER
    // ============================================================
    class WorkflowExecutor {
      constructor(private registry: typeof user1) {}

      async executeLoginWorkflow() {
        const { home } = this.registry.pages;
        const { assertions } = this.registry.services;

        // Already on home page from fixture!
        await assertions.assertUrlContains('/');

        return 'Login workflow completed';
      }

      async executeSearchWorkflow(query: string) {
        const { home } = this.registry.pages;
        const { waits } = this.registry.services;

        await home.search(query);
        await waits.waitForNetworkIdle();

        return 'Search workflow completed';
      }
    }

    const executor = new WorkflowExecutor(user1);
    const result = await executor.executeLoginWorkflow();
    console.log(result);

    expect(result).toContain('completed');
  });
});
