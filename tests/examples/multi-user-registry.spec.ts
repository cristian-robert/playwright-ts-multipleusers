import { multiUserTest as test, expect } from '@fixtures/multi-user.fixture';

/**
 * Registry Usage Examples - Multi User
 * Demonstrates how to use registries in multi-user scenarios
 *
 * NOTE: Fixtures automatically navigate all users to home page and wait for network idle.
 * Pages are READY TO USE - no need to call navigate() unless going to a different page!
 */
test.describe('Multi-User Registry Usage', () => {
  /**
   * OPTION 1: Use combined registry
   * Access multiple users through a single registry object
   */
  test('should use combined registry', async ({ registry }) => {
    // ============================================================
    // UNIFIED ACCESS via registry.user1, registry.user2, registry.user3
    // ============================================================

    // Users are already on home page from fixture!
    // Just interact with page elements directly

    // User 1 actions
    const user1Name = await registry.user1.pages.home.header.getUserName();
    console.log(`🟦 User 1: ${user1Name}`);

    // User 2 actions
    const user2Name = await registry.user2.pages.home.header.getUserName();
    console.log(`🟧 User 2: ${user2Name}`);

    // Check cache stats for both
    const stats = registry.getCacheStats();
    console.log('User 1 cache:', stats.user1);
    console.log('User 2 cache:', stats.user2);
  });

  /**
   * OPTION 2: Use individual registries
   * More explicit, good for complex workflows
   */
  test('should use individual registries', async ({
    user1Registry,
    user2Registry
  }) => {
    // ============================================================
    // SEPARATE REGISTRIES
    // ============================================================

    // Users already on home page from fixture!
    // Each registry is independent and ready to use

    const user1Home = user1Registry.pages.home;
    const user2Home = user2Registry.pages.home;

    // Interact directly with pages (no navigate needed)
    const user1Name = await user1Home.header.getUserName();
    const user2Name = await user2Home.header.getUserName();

    console.log(`User 1: ${user1Name}`);
    console.log(`User 2: ${user2Name}`);
  });

  /**
   * OPTION 3: Destructure from combined registry
   * Clean and readable for most use cases
   */
  test('should destructure from combined registry', async ({ registry }) => {
    // ============================================================
    // DESTRUCTURING PATTERN (RECOMMENDED)
    // ============================================================

    // Destructure for clean code
    const {
      user1: { pages: user1Pages, services: user1Services },
      user2: { pages: user2Pages, services: user2Services }
    } = registry;

    // Users already on home page! Just interact directly
    const userName1 = await user1Pages.home.header.getUserName();
    const userName2 = await user2Pages.home.header.getUserName();

    console.log(`User 1: ${userName1}`);
    console.log(`User 2: ${userName2}`);

    // Services are ready to use
    await user1Services.assertions.assertUrlContains('/');
    await user2Services.assertions.assertUrlContains('/');
  });

  /**
   * OPTION 4: Destructure individual registries
   * Best for complex workflows with lots of operations
   */
  test('should destructure individual registries', async ({
    user1Registry,
    user2Registry
  }) => {
    // ============================================================
    // FULL DESTRUCTURING (CLEANEST)
    // ============================================================

    const { pages: user1Pages, services: user1Services } = user1Registry;
    const { pages: user2Pages, services: user2Services } = user2Registry;

    // Users already on home page - interact directly!
    const user1Categories = await user1Pages.home.categoriesSection.getAllCategories();
    const user2Categories = await user2Pages.home.categoriesSection.getAllCategories();

    console.log(`User 1 sees ${user1Categories.length} categories`);
    console.log(`User 2 sees ${user2Categories.length} categories`);

    // Services ready to use
    await user1Services.assertions.assertUrlContains('/');
    await user2Services.assertions.assertUrlContains('/');
  });
});

/**
 * Two-User Workflows with Registries
 */
test.describe('Two-User Workflow with Registries', () => {
  test('should complete two-user workflow using registries', async ({ registry }) => {
    // ============================================================
    // REALISTIC TWO-USER WORKFLOW
    // ============================================================

    // Users already on home page from fixture!
    const user1 = registry.user1;
    const user2 = registry.user2;

    // ====== USER 1: Create request ======
    console.log('🟦 USER 1: Creating request...');

    // Example: Create request (customize for your app)
    // await user1.pages.home.createRequest({
    //   title: 'New Request',
    //   description: 'Requires approval',
    // });

    const user1Name = await user1.pages.home.header.getUserName();
    console.log(`🟦 User 1: ${user1Name}`);

    // ====== USER 2: Review and approve ======
    console.log('🟧 USER 2: Reviewing request...');

    const user2Name = await user2.pages.home.header.getUserName();
    console.log(`🟧 User 2: ${user2Name}`);

    // Example: Find and approve request
    // await user2.pages.home.navigateToApprovals();
    // await user2.pages.home.approveRequest(requestId);

    // ====== VERIFICATION ======
    await user1.services.assertions.assertUrlContains('/');
    await user2.services.assertions.assertUrlContains('/');

    console.log('✅ Two-user workflow completed');
  });

  test('should use Shadow DOM helpers in multi-user context', async ({
    user1Registry,
    user2Registry
  }) => {
    // ============================================================
    // SHADOW DOM in MULTI-USER
    // ============================================================

    // Users already on home page from fixture!
    const { pages: user1Pages, services: user1Services } = user1Registry;
    const { pages: user2Pages, services: user2Services } = user2Registry;

    // Both users can interact with Shadow DOM immediately
    const user1Notifications = await user1Services.shadow.getTextFromShadow(
      '[data-testid="notifications"]',
      '.badge'
    ).catch(() => '0');

    const user2Notifications = await user2Services.shadow.getTextFromShadow(
      '[data-testid="notifications"]',
      '.badge'
    ).catch(() => '0');

    console.log(`User 1 notifications: ${user1Notifications}`);
    console.log(`User 2 notifications: ${user2Notifications}`);
  });

  test('should use API client from registry', async ({ registry }) => {
    // ============================================================
    // API CLIENT ACCESS
    // ============================================================

    // API client is available in services
    const { userApi } = registry.user1.services;

    try {
      // All users can use the same API client
      // (It's stateless, just HTTP calls)
      const users = await userApi.getAllUsers();
      console.log(`Found ${users.total} users`);
    } catch (error) {
      console.warn('API not configured');
      test.skip();
    }
  });

  test('should pass registries to helper functions', async ({ registry }) => {
    // ============================================================
    // HELPER FUNCTIONS with REGISTRIES
    // ============================================================

    // Define workflow functions that receive registries
    async function user1CreatesRequest(user1: typeof registry.user1) {
      const { pages, services } = user1;

      // Already on home page from fixture!
      console.log('🟦 User 1: Request created');
      return 'request-123';
    }

    async function user2ApprovesRequest(
      user2: typeof registry.user2,
      requestId: string
    ) {
      const { pages, services } = user2;

      // Already on home page from fixture!
      console.log(`🟧 User 2: Approved ${requestId}`);
    }

    // Execute workflow
    const requestId = await user1CreatesRequest(registry.user1);
    await user2ApprovesRequest(registry.user2, requestId);
  });
});

/**
 * Advanced Multi-User Patterns
 */
test.describe('Advanced Multi-User Registry Patterns', () => {
  test('should create workflow class with registries', async ({ registry }) => {
    // ============================================================
    // WORKFLOW CLASS PATTERN
    // ============================================================

    class TwoUserWorkflow {
      constructor(
        private user1: typeof registry.user1,
        private user2: typeof registry.user2
      ) {}

      async createRequest(data: { title: string; description: string }) {
        const { pages, services } = this.user1;

        // Already on home page from fixture!
        // Create request logic here
        console.log(`🟦 User 1: Creating request: ${data.title}`);

        return 'request-id-123';
      }

      async approveRequest(requestId: string) {
        const { pages, services } = this.user2;

        // Already on home page from fixture!
        // Approval logic here
        console.log(`🟧 User 2: Approving request: ${requestId}`);
      }

      async verifyApproval(requestId: string) {
        const { services } = this.user1;

        // Verification logic
        console.log(`✅ Verified: ${requestId}`);
        return true;
      }
    }

    // Use the workflow
    const workflow = new TwoUserWorkflow(registry.user1, registry.user2);

    const requestId = await workflow.createRequest({
      title: 'Test Request',
      description: 'Test Description',
    });

    await workflow.approveRequest(requestId);
    const verified = await workflow.verifyApproval(requestId);

    expect(verified).toBe(true);
  });

  test('should check cache for multiple users', async ({ registry }) => {
    // ============================================================
    // CACHE MANAGEMENT
    // ============================================================

    // Users already on home page from fixture!
    // Pages are already cached

    // Check what's cached
    const stats = registry.getCacheStats();

    console.log('User 1 cache:', stats.user1);
    console.log('User 2 cache:', stats.user2);

    expect(stats.user1.pages).toContain('home');
    expect(stats.user2.pages).toContain('home');

    // Clear all caches
    registry.clearAll();

    const afterClear = registry.getCacheStats();
    expect(afterClear.user1.total).toBe(0);
    expect(afterClear.user2.total).toBe(0);
  });

  test('should pass entire registry to complex functions', async ({ registry }) => {
    // ============================================================
    // PASS FULL REGISTRY
    // ============================================================

    // Function that needs access to multiple users
    async function executeTwoUserWorkflow(reg: typeof registry) {
      // Users already on home page!
      // Access both users directly
      const user1Name = await reg.user1.pages.home.header.getUserName();
      const user2Name = await reg.user2.pages.home.header.getUserName();

      console.log(`User 1: ${user1Name}`);
      console.log(`User 2: ${user2Name}`);

      return 'Workflow complete';
    }

    const result = await executeTwoUserWorkflow(registry);
    expect(result).toBe('Workflow complete');
  });
});
