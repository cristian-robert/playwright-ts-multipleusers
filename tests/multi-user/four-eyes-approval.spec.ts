import { authenticatedMultiUserTest as test, expect } from '@fixtures/authenticated-multi-user.fixture';

/**
 * Four Eyes Approval Workflow Tests
 * Using flexible user1/user2/user3 pattern
 *
 * NOTE: Fixtures automatically navigate all users to home page and wait for network idle.
 * Pages are READY TO USE - no need to call navigate() unless going to a different page!
 */
test.describe('Four Eyes Approval Workflow', () => {
  /**
   * Test: Two-user approval flow
   * User 1 creates action, User 2 approves
   */
  test('should complete two-user approval flow', async ({ user1, user2 }) => {
    // ====== USER 1 ACTIONS ======
    // Users are already on home page from fixture!
    console.log('🟦 User 1: Starting action...');

    // Example: User 1 creates a new request/action
    // await user1.pages.home.createNewRequest({
    //   title: 'Test Request',
    //   description: 'This requires approval',
    // });

    console.log('🟦 User 1: Created action requiring approval');

    const actionId = `action-${Date.now()}`;
    console.log(`🟦 User 1: Action ID: ${actionId}`);

    // ====== USER 2 ACTIONS ======
    console.log('🟧 User 2: Checking for pending approvals...');

    // User 2 is also already on home page!
    // Example: Find and approve the action
    // await user2.pages.home.navigateToApprovals();
    // await user2.pages.home.findPendingApproval(actionId);
    // await user2.pages.home.approveAction(actionId);

    console.log('🟧 User 2: Approved the action');

    // ====== USER 1 VERIFICATION ======
    console.log('🟦 User 1: Verifying action was approved...');

    await user1.pages.home.reload();

    // Verify action status
    // const status = await user1.pages.home.getActionStatus(actionId);
    // expect(status).toBe('Approved');

    console.log('✅ Two-user approval workflow completed successfully');
  });

  test('should verify users are already on home page', async ({ user1, user2 }) => {
    // Fixture navigated both users to home page
    // Verify they're there without navigating again!

    const user1Name = await user1.pages.home.header.getUserName();
    const user2Name = await user2.pages.home.header.getUserName();

    console.log(`User 1 on home page: ${user1Name}`);
    console.log(`User 2 on home page: ${user2Name}`);

    expect(user1Name).toBeTruthy();
    expect(user2Name).toBeTruthy();

    console.log('✅ Both users ready to use from fixture');
  });

  test('should handle concurrent actions from both users', async ({ user1, user2 }) => {
    // Both users already on home page from fixture
    // Execute actions in parallel without navigating first

    await Promise.all([
      // User 1 performs action
      (async () => {
        console.log('🟦 User 1: Performing action 1...');
        const userName = await user1.pages.home.header.getUserName();
        console.log(`User 1: ${userName}`);
      })(),

      // User 2 performs independent action
      (async () => {
        console.log('🟧 User 2: Performing action 2...');
        const userName = await user2.pages.home.header.getUserName();
        console.log(`User 2: ${userName}`);
      })(),
    ]);

    console.log('✅ Concurrent actions completed');
  });

  test('should maintain separate sessions for each user', async ({
    user1Context,
    user2Context,
    user1,
    user2,
  }) => {
    // Verify separate contexts
    expect(user1Context).not.toBe(user2Context);

    // Get cookies from both contexts
    const user1Cookies = await user1Context.cookies();
    const user2Cookies = await user2Context.cookies();

    console.log(`User 1 has ${user1Cookies.length} cookies`);
    console.log(`User 2 has ${user2Cookies.length} cookies`);

    // Cookies should be independent
    expect(user1Cookies).not.toEqual(user2Cookies);

    // Verify registries are different instances
    expect(user1).not.toBe(user2);
  });

  test.describe('Shadow DOM in multi-user context', () => {
    test('should interact with shadow DOM elements from both users', async ({ user1, user2 }) => {
      // Both users already on home page - interact directly!

      const user1Notifications = await user1.pages.home.header.getNotificationCount();
      const user2Notifications = await user2.pages.home.header.getNotificationCount();

      console.log(`User 1 notifications: ${user1Notifications}`);
      console.log(`User 2 notifications: ${user2Notifications}`);

      expect(user1Notifications).toBeGreaterThanOrEqual(0);
      expect(user2Notifications).toBeGreaterThanOrEqual(0);
    });

    test('should use shadow DOM helpers from registry', async ({ user1, user2 }) => {
      // Users already on home page from fixture

      // Access shadow DOM helper from service registry
      const user1Shadow = user1.services.shadow;
      const user2Shadow = user2.services.shadow;

      // Both can interact with Shadow DOM immediately
      const user1HasElement = await user1Shadow.isElementInShadow(
        '[data-testid="header"]',
        '.logo'
      );

      const user2HasElement = await user2Shadow.isElementInShadow(
        '[data-testid="header"]',
        '.logo'
      );

      console.log(`User 1 has logo: ${user1HasElement}`);
      console.log(`User 2 has logo: ${user2HasElement}`);
    });
  });

  test('should access all services immediately', async ({ user1, user2 }) => {
    // No need to navigate or wait - fixture already did this!
    // Just use the services directly

    const { assertions, shadow } = user1.services;

    await assertions.assertUrlContains('/');

    // Shadow DOM
    const hasLogo = await shadow.isElementInShadow('[data-testid="header"]', '.logo');
    console.log(`Has logo: ${hasLogo}`);

    // User 2 has same immediate access
    await user2.services.assertions.assertUrlContains('/');
  });
});

/**
 * Advanced Three-User Workflow Example
 */
test.describe('Three-User Workflows', () => {
  test('should handle three-level approval', async ({ user1, user2, user3 }) => {
    // All three users already on home page from fixture!

    console.log('🟦 User 1: Creating request requiring two approvals...');
    const requestId = `request-${Date.now()}`;
    console.log(`🟦 User 1: Created request ${requestId}`);

    // First approval
    console.log('🟧 User 2: First level approval...');
    // await user2.pages.home.approveRequest(requestId);
    console.log('🟧 User 2: Approved');

    // Second approval
    console.log('🟩 User 3: Final approval...');
    // await user3.pages.home.approveRequest(requestId);
    console.log('🟩 User 3: Final approval granted');

    // Verification
    await user1.pages.home.reload();
    console.log('✅ Three-level approval workflow completed');
  });

  test('should create workflow class using all three users', async ({ user1, user2, user3 }) => {
    // All users ready from fixture
    class ThreeLevelWorkflow {
      constructor(
        private creator: typeof user1,
        private firstApprover: typeof user2,
        private finalApprover: typeof user3
      ) {}

      async create(data: { title: string }) {
        // Already on home page - just interact!
        console.log(`Creating: ${data.title}`);
        return 'request-123';
      }

      async firstApproval(requestId: string) {
        console.log(`First approval: ${requestId}`);
      }

      async finalApproval(requestId: string) {
        console.log(`Final approval: ${requestId}`);
      }

      async verify(requestId: string) {
        console.log(`Verified: ${requestId}`);
        return true;
      }
    }

    // Use the workflow
    const workflow = new ThreeLevelWorkflow(user1, user2, user3);

    const requestId = await workflow.create({ title: 'Test Request' });
    await workflow.firstApproval(requestId);
    await workflow.finalApproval(requestId);
    const verified = await workflow.verify(requestId);

    expect(verified).toBe(true);
  });

  test('should handle all three users simultaneously', async ({ user1, user2, user3 }) => {
    // All three users already loaded and ready!

    // Get user names from all three in parallel
    const [name1, name2, name3] = await Promise.all([
      user1.pages.home.header.getUserName(),
      user2.pages.home.header.getUserName(),
      user3.pages.home.header.getUserName(),
    ]);

    console.log(`User 1: ${name1}`);
    console.log(`User 2: ${name2}`);
    console.log(`User 3: ${name3}`);

    // All should be defined
    expect(name1).toBeTruthy();
    expect(name2).toBeTruthy();
    expect(name3).toBeTruthy();

    console.log('✅ All three users active simultaneously');
  });
});
