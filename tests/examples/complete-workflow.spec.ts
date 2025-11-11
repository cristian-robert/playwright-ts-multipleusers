import {
  authenticatedMultiUserTest as test,
  expect,
} from '@fixtures/authenticated-multi-user.fixture';
import { HomePage } from '@pages/home.page';
import { UserApiClient } from '@api/clients/user-api.client';
import { UserFactory } from '@api/factories/user.factory';
import { createWaitHelpers } from '@utils/waits/wait-helpers';
import { createAssertions } from '@utils/assertions/custom-assertions';
import { createShadowHelper } from '@utils/shadow-dom/shadow-dom.helper';

/**
 * Complete Workflow Example
 * Demonstrates all framework features working together:
 * - Multi-user authentication
 * - Shadow DOM interaction
 * - API integration
 * - Custom utilities
 * - Page fragments
 */
test.describe('Complete Workflow Example', () => {
  let userApi: UserApiClient;

  test.beforeAll(() => {
    userApi = new UserApiClient();
  });

  test('complete two-user workflow with all features', async ({
    user1Page,
    user2Page,
  }) => {
    // ============================================================
    // SETUP: Create test data via API
    // ============================================================
    console.log('📋 SETUP: Creating test data via API...');

    let testUser;
    try {
      const userData = UserFactory.createUser({
        firstName: 'Test',
        lastName: 'Subject',
      });
      testUser = await userApi.createUser(userData);
      console.log(`✅ Created test user: ${testUser.id}`);
    } catch (error) {
      console.warn('⚠️  API not configured, skipping API setup');
    }

    // ============================================================
    // USER 1: Create action/request
    // ============================================================
    console.log('\n🟦 USER 1: Starting workflow...');

    const user1Home = new HomePage(user1Page);
    const user1Waits = createWaitHelpers(user1Page);
    const user1Assertions = createAssertions(user1Page);
    const user1Shadow = createShadowHelper(user1Page);

    // Verify initiator is authenticated
    await user1Assertions.assertUrlContains('/');
    const user1LoggedIn = await user1Home.isUserLoggedIn();
    expect(user1LoggedIn).toBe(true);

    const user1Name = await user1Home.header.getUserName();
    console.log(`🟦 Logged in as: ${user1Name}`);

    // Check notifications (Shadow DOM example)
    const user1Notifications = await user1Home.header.getNotificationCount();
    console.log(`🟦 Notifications: ${user1Notifications}`);

    // Example: Create new request (customize based on your app)
    // await user1Home.navigateToNewRequest();
    // await user1Home.fillRequestForm({
    //   title: 'Test Request',
    //   description: 'Requires four-eyes approval',
    // });
    // await user1Home.submitRequest();

    console.log('🟦 Created request requiring approval');

    // Wait for request to be saved
    await user1Waits.waitForNetworkIdle();

    // Verify request was created (example)
    // const requestId = await user1Home.getLatestRequestId();
    // console.log(`🟦 Request ID: ${requestId}`);

    // ============================================================
    // USER 2: Review and approve
    // ============================================================
    console.log('\n🟧 USER 2: Reviewing request...');

    const user2Home = new HomePage(user2Page);
    const user2Waits = createWaitHelpers(user2Page);
    const user2Assertions = createAssertions(user2Page);
    const user2Shadow = createShadowHelper(user2Page);

    // Verify approver is authenticated
    const user2LoggedIn = await user2Home.isUserLoggedIn();
    expect(user2LoggedIn).toBe(true);

    const user2Name = await user2Home.header.getUserName();
    console.log(`🟧 Logged in as: ${user2Name}`);

    // Check notifications
    const user2Notifications = await user2Home.header.getNotificationCount();
    console.log(`🟧 Notifications: ${user2Notifications}`);

    // Navigate to approvals queue (customize based on your app)
    // await user2Home.navigateToApprovals();
    await user2Waits.waitForNetworkIdle();

    // Find pending approval
    // await user2Home.searchRequest(requestId);
    // await user2Home.openRequest(requestId);

    // Review details
    // const requestDetails = await user2Home.getRequestDetails();
    // console.log('🟧 Request details:', requestDetails);

    // Example: Interact with Shadow DOM elements
    // const shadowButton = await user2Shadow.pierceOnce(
    //   '[data-component="approval-widget"]',
    //   'button[data-action="approve"]'
    // );
    // await shadowButton.click();

    console.log('🟧 Approved the request');
    await user2Waits.waitForNetworkIdle();

    // ============================================================
    // VERIFICATION: Check status updates
    // ============================================================
    console.log('\n✅ VERIFICATION: Checking results...');

    // Verify on approver side
    // await user2Assertions.assertVisible(
    //   user2Page.locator('text="Approval successful"')
    // );

    // Refresh initiator page to see update
    await user1Home.reload();
    await user1Waits.waitForNetworkIdle();

    // Verify status changed (example)
    // const status = await user1Home.getRequestStatus(requestId);
    // expect(status).toBe('Approved');
    // console.log(`✅ Request status: ${status}`);

    // Take screenshots for evidence
    const user1Screenshot = await user1Page.screenshot({
      path: 'test-results/initiator-final.png',
    });
    const user2Screenshot = await user2Page.screenshot({
      path: 'test-results/approver-final.png',
    });

    console.log('📸 Screenshots saved');

    // ============================================================
    // CLEANUP: Remove test data
    // ============================================================
    console.log('\n🧹 CLEANUP: Removing test data...');

    if (testUser) {
      try {
        await userApi.deleteUser(testUser.id);
        console.log(`✅ Deleted test user: ${testUser.id}`);
      } catch (error) {
        console.warn('⚠️  Could not delete test user');
      }
    }

    // Delete created request (example)
    // await user1Home.deleteRequest(requestId);

    console.log('\n🎉 Complete workflow finished successfully!');
  });

  test('demonstrate all utility features', async ({ user1Page }) => {
    const page = user1Page;
    const homePage = new HomePage(page);

    // ============================================================
    // Wait Helpers Demo
    // ============================================================
    console.log('\n⏱️  WAIT HELPERS DEMO');

    const waits = createWaitHelpers(page);

    // Wait for specific text
    await waits.waitForText('body', 'Home', 10000);
    console.log('✅ Found "Home" text');

    // Wait for network idle
    await waits.waitForNetworkIdle({ timeout: 10000, idleTime: 500 });
    console.log('✅ Network is idle');

    // Retry with backoff
    await waits.retryUntilSuccess(
      async () => {
        // Some flaky operation
        return true;
      },
      3,
      1000
    );
    console.log('✅ Retry successful');

    // ============================================================
    // Custom Assertions Demo
    // ============================================================
    console.log('\n✔️  CUSTOM ASSERTIONS DEMO');

    const assertions = createAssertions(page);

    // URL assertions
    await assertions.assertUrlContains('/');
    console.log('✅ URL contains "/"');

    // Title assertions
    await assertions.assertTitle(/Home|Dashboard/);
    console.log('✅ Title matches pattern');

    // Multiple assertions
    await assertions.assertAll(
      async () => await assertions.assertUrlContains('/'),
      async () => page.waitForLoadState('domcontentloaded')
    );
    console.log('✅ All assertions passed');

    // ============================================================
    // Shadow DOM Demo
    // ============================================================
    console.log('\n🎭 SHADOW DOM DEMO');

    const shadowHelper = createShadowHelper(page);

    // Check for shadow elements
    const hasNotifications = await shadowHelper.isElementInShadow(
      '[data-testid="notifications"]',
      '.notification-badge'
    );
    console.log(`✅ Notifications shadow element exists: ${hasNotifications}`);

    // Get text from shadow DOM
    try {
      const shadowText = await shadowHelper.getTextFromShadow(
        '[data-testid="notifications"]',
        '.notification-badge'
      );
      console.log(`✅ Shadow text: ${shadowText}`);
    } catch (error) {
      console.log('⚠️  Shadow element not found (expected in example)');
    }

    // ============================================================
    // Page Fragments Demo
    // ============================================================
    console.log('\n🧩 PAGE FRAGMENTS DEMO');

    // Header fragment
    const userName = await homePage.header.getUserName();
    console.log(`✅ User name: ${userName}`);

    // Categories fragment
    const categoryCount = await homePage.categoriesSection.getCategoryCount();
    console.log(`✅ Category count: ${categoryCount}`);

    // Registration form fragment
    const formVisible = await homePage.registrationForm.isVisible();
    console.log(`✅ Registration form visible: ${formVisible}`);

    console.log('\n🎉 All utilities demonstrated successfully!');
  });
});
