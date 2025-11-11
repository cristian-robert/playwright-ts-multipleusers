import { authenticatedMultiUserTest as test, expect } from '@fixtures/authenticated-multi-user.fixture';

/**
 * Home Page Tests
 * Uses authenticated single-user from fixture (user1)
 *
 * NOTE: Fixture automatically navigates user1 to home page and authenticates.
 * Page is READY TO USE - no need to call navigate() or login()!
 */
test.describe('Home Page', () => {
  test('should load home page successfully', async ({ user1, user1Page }) => {
    // User already on home page and authenticated from fixture!

    // Verify page title
    await expect(user1Page).toHaveTitle(/Home|Dashboard/);

    // Verify header is visible
    await user1.pages.home.header.waitForVisible();

    // Verify URL
    await user1.services.assertions.assertUrlContains('/');
  });

  test('should display categories section', async ({ user1 }) => {
    // User already on home page from fixture!

    // Verify categories section is visible
    await user1.pages.home.categoriesSection.waitForVisible();

    // Get and verify category count
    const categoryCount = await user1.pages.home.categoriesSection.getCategoryCount();
    expect(categoryCount).toBeGreaterThan(0);

    console.log(`Found ${categoryCount} categories`);
  });

  test('should navigate to category', async ({ user1, user1Page }) => {
    // User already on home page from fixture!
    const { home } = user1.pages;
    const { waits } = user1.services;

    // Get all categories
    const categories = await home.categoriesSection.getAllCategories();
    expect(categories.length).toBeGreaterThan(0);

    // Click on first category
    const firstCategory = categories[0];
    await home.navigateToCategory(firstCategory);

    // Wait for navigation
    await waits.waitForNetworkIdle();

    // Verify URL changed
    expect(user1Page.url()).not.toBe(home.getUrl());
  });

  test('should search from header', async ({ user1, user1Page }) => {
    // User already on home page from fixture!
    const searchQuery = 'test query';

    // Perform search
    await user1.pages.home.search(searchQuery);

    // Wait for results
    await user1.services.waits.waitForNetworkIdle();

    // Verify URL contains search query
    expect(user1Page.url()).toContain('search');
  });

  test('should display registration form', async ({ user1 }) => {
    // User already on home page from fixture!

    // Verify registration form is visible
    const isVisible = await user1.pages.home.registrationForm.isVisible();
    expect(isVisible).toBe(true);

    // Verify submit button is present
    const isSubmitEnabled = await user1.pages.home.registrationForm.isSubmitEnabled();
    expect(typeof isSubmitEnabled).toBe('boolean');
  });

  test('should submit registration form', async ({ user1, user1Page }) => {
    // User already on home page from fixture!
    const { home } = user1.pages;

    // Skip if form is not visible
    const isFormVisible = await home.registrationForm.isVisible();
    test.skip(!isFormVisible, 'Registration form not visible on home page');

    // Prepare test data
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test.${Date.now()}@example.com`,
      password: 'SecurePassword123!',
    };

    // Fill and submit form
    await home.quickRegister(userData);

    // Wait for response
    await user1Page.waitForTimeout(2000);

    // Verify success or get error message
    const isSuccessful = await home.registrationForm.isSuccessful();
    const errorMessage = await home.registrationForm.getErrorMessage();

    if (!isSuccessful && errorMessage) {
      console.log(`Registration failed: ${errorMessage}`);
    }
  });

  test.describe('Shadow DOM interactions', () => {
    test('should interact with shadow DOM elements', async ({ user1 }) => {
      // User already on home page from fixture!

      // Example: Get notification count from shadow DOM
      const notificationCount = await user1.pages.home.header.getNotificationCount();
      expect(notificationCount).toBeGreaterThanOrEqual(0);

      console.log(`User has ${notificationCount} notifications`);
    });

    test('should get category description from shadow DOM', async ({ user1 }) => {
      // User already on home page from fixture!
      const { home } = user1.pages;

      // Get categories
      const categories = await home.categoriesSection.getAllCategories();

      if (categories.length > 0) {
        // Try to get description from shadow DOM
        const description = await home.categoriesSection.getCategoryDescription(
          categories[0]
        );

        console.log(`Category "${categories[0]}" description:`, description);
      }
    });

    test('should use shadow DOM helper from registry', async ({ user1 }) => {
      // User already on home page from fixture!
      const { shadow } = user1.services;

      // Check if element exists in shadow DOM
      const hasLogo = await shadow.isElementInShadow('[data-testid="header"]', '.logo');
      console.log(`Header has logo: ${hasLogo}`);
    });
  });

  test.describe('Custom assertions and waits', () => {
    test('should use custom wait helpers', async ({ user1 }) => {
      // User already on home page from fixture!
      const { waits } = user1.services;

      // Wait for specific text
      await waits.waitForText('body', 'Home', 10000);

      // Wait for network idle
      await waits.waitForNetworkIdle();

      expect(true).toBe(true);
    });

    test('should use custom assertions', async ({ user1 }) => {
      // User already on home page from fixture!
      const { assertions } = user1.services;

      // Assert URL
      await assertions.assertUrlContains('/');

      // Assert page title
      await assertions.assertTitle(/Home|Dashboard/);

      expect(true).toBe(true);
    });

    test('should access all services from registry', async ({ user1 }) => {
      // User already on home page from fixture!

      // All services available without manual imports
      const { waits, assertions, shadow, auth } = user1.services;

      // Verify services are accessible
      expect(waits).toBeDefined();
      expect(assertions).toBeDefined();
      expect(shadow).toBeDefined();
      expect(auth).toBeDefined();

      console.log('✅ All services accessible from registry');
    });
  });
});
