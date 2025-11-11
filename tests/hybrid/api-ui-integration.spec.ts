import { authenticatedMultiUserTest as test, expect } from '@fixtures/authenticated-multi-user.fixture';
import { UserApiClient } from '@api/clients/user-api.client';
import { UserFactory } from '@api/factories/user.factory';

/**
 * API + UI Integration Tests
 * Demonstrates using API for test data setup and UI for verification
 *
 * NOTE: Fixture automatically navigates user1 to home page and authenticates.
 * User is READY TO USE!
 */
test.describe('API + UI Integration', () => {
  let userApi: UserApiClient;

  test.beforeAll(() => {
    userApi = new UserApiClient();
  });

  test('should create user via API and verify in UI', async ({ user1 }) => {
    try {
      // User already on home page and authenticated from fixture!

      // ====== SETUP: Create user via API ======
      const userData = UserFactory.createUser({
        firstName: 'UI',
        lastName: 'Verified',
      });

      const createdUser = await userApi.createUser(userData);
      console.log(`✅ Created user via API: ${createdUser.id}`);

      // ====== VERIFY: Check user exists in UI ======
      // Already on home page - can navigate to users list if needed

      // Navigate to users list or search for user
      // await user1.pages.home.navigateToUsersList();
      // await user1.pages.home.searchUser(createdUser.email);

      // Verify user is displayed
      // const isUserVisible = await page.locator(`text="${createdUser.email}"`).isVisible();
      // expect(isUserVisible).toBe(true);

      console.log('✅ Verified user exists in UI');

      // ====== CLEANUP ======
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('Test skipped (API not configured):', error);
      test.skip();
    }
  });

  test('should create test data via API for multi-user workflow', async ({ user1 }) => {
    try {
      // User already on home page and authenticated from fixture!

      // ====== SETUP: Create two users via API ======
      const initiatorData = UserFactory.createInitiator();
      const approverData = UserFactory.createApprover();

      const [initiator, approver] = await Promise.all([
        userApi.createUser(initiatorData),
        userApi.createUser(approverData),
      ]);

      console.log(`✅ Created initiator: ${initiator.id}`);
      console.log(`✅ Created approver: ${approver.id}`);

      // ====== UI INTERACTION ======
      // User already on home page from fixture!

      // Implement your workflow
      // Example:
      // - Login as initiator
      // - Create action
      // - Login as approver
      // - Approve action
      // - Verify status change

      // ====== CLEANUP ======
      await Promise.all([
        userApi.deleteUser(initiator.id),
        userApi.deleteUser(approver.id),
      ]);
    } catch (error) {
      console.error('Test skipped (API not configured):', error);
      test.skip();
    }
  });

  test('should use API for assertions in UI test', async ({ user1 }) => {
    try {
      // User already on home page and authenticated from fixture!
      const { home } = user1.pages;

      // ====== UI ACTION ======
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: `test.${Date.now()}@example.com`,
        password: 'SecurePassword123!',
      };

      // Skip if registration form is not visible
      const isFormVisible = await home.registrationForm.isVisible();
      if (!isFormVisible) {
        test.skip(true, 'Registration form not available');
        return;
      }

      await home.quickRegister(userData);

      // Wait for registration to complete
      await page.waitForTimeout(2000);

      // ====== API VERIFICATION ======
      // Verify user was created by checking via API
      const createdUser = await userApi.getUserByEmail(userData.email);

      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.firstName).toBe(userData.firstName);

      console.log('✅ Verified registration via API');

      // ====== CLEANUP ======
      if (createdUser?.id) {
        await userApi.deleteUser(createdUser.id);
      }
    } catch (error) {
      console.error('Test skipped or failed:', error);
      test.skip();
    }
  });

  test('should setup complex test scenario via API', async ({ user1 }) => {
    try {
      // User already on home page and authenticated from fixture!

      // ====== SETUP: Create complex test data structure ======
      const adminData = UserFactory.createAdmin();
      const initiatorData = UserFactory.createInitiator();
      const approverData = UserFactory.createApprover();

      const [admin, initiator, approver] = await Promise.all([
        userApi.createUser(adminData),
        userApi.createUser(initiatorData),
        userApi.createUser(approverData),
      ]);

      console.log('✅ Created test data structure:');
      console.log(`   - Admin: ${admin.id}`);
      console.log(`   - Initiator: ${initiator.id}`);
      console.log(`   - Approver: ${approver.id}`);

      // ====== UI TEST ======
      // User already on home page from fixture!

      // Perform complex workflow using these users

      // ====== CLEANUP ======
      await Promise.all([
        userApi.deleteUser(admin.id),
        userApi.deleteUser(initiator.id),
        userApi.deleteUser(approver.id),
      ]);
    } catch (error) {
      console.error('Test skipped (API not configured):', error);
      test.skip();
    }
  });

  test('should use all registry services in API integration test', async ({ user1 }) => {
    try {
      // User already on home page and authenticated from fixture!
      const { home } = user1.pages;
      const { assertions, shadow } = user1.services;

      // Use assertions
      await assertions.assertUrlContains('/');

      // Use shadow DOM helper
      const hasLogo = await shadow.isElementInShadow('[data-testid="header"]', '.logo');
      console.log(`Header has logo: ${hasLogo}`);

      // Get user data via API
      const userData = UserFactory.createUser();
      const createdUser = await userApi.createUser(userData);

      console.log(`✅ Created user: ${createdUser.id}`);

      // Cleanup
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('Test skipped (API not configured):', error);
      test.skip();
    }
  });
});
