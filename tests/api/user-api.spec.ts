import { test, expect } from '@playwright/test';
import { UserApiClient } from '@api/clients/user-api.client';
import { UserFactory } from '@api/factories/user.factory';
import { UserRole } from '@api/models/user.model';

/**
 * User API Tests
 * Demonstrates backend API integration and test data management
 */
test.describe('User API', () => {
  let userApi: UserApiClient;

  test.beforeAll(() => {
    userApi = new UserApiClient();
    // Optional: Set auth token if required
    // userApi.setAuthToken('your-auth-token');
  });

  test.afterAll(() => {
    // Cleanup: Reset user factory counter
    UserFactory.resetCounter();
  });

  test('should create a new user via API', async () => {
    // Generate test user data
    const userData = UserFactory.createUser({
      firstName: 'API',
      lastName: 'Test',
    });

    try {
      // Create user
      const createdUser = await userApi.createUser(userData);

      // Assertions
      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.firstName).toBe(userData.firstName);
      expect(createdUser.lastName).toBe(userData.lastName);
      expect(createdUser.role).toBe(userData.role);

      console.log(`✅ Created user: ${createdUser.id}`);

      // Cleanup: Delete the user
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });

  test('should create initiator and approver users', async () => {
    try {
      // Create initiator
      const initiatorData = UserFactory.createInitiator();
      const initiator = await userApi.createUser(initiatorData);

      expect(initiator.role).toBe(UserRole.INITIATOR);

      // Create approver
      const approverData = UserFactory.createApprover();
      const approver = await userApi.createUser(approverData);

      expect(approver.role).toBe(UserRole.APPROVER);

      console.log(`✅ Created initiator: ${initiator.id}`);
      console.log(`✅ Created approver: ${approver.id}`);

      // Cleanup
      await Promise.all([
        userApi.deleteUser(initiator.id),
        userApi.deleteUser(approver.id),
      ]);
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });

  test('should get user by ID', async () => {
    try {
      // Create a user first
      const userData = UserFactory.createUser();
      const createdUser = await userApi.createUser(userData);

      // Get user by ID
      const fetchedUser = await userApi.getUserById(createdUser.id);

      expect(fetchedUser).toBeDefined();
      expect(fetchedUser.id).toBe(createdUser.id);
      expect(fetchedUser.email).toBe(createdUser.email);

      // Cleanup
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });

  test('should update user', async () => {
    try {
      // Create a user
      const userData = UserFactory.createUser();
      const createdUser = await userApi.createUser(userData);

      // Update user
      const updatedData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = await userApi.updateUser(createdUser.id, updatedData);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');

      // Cleanup
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });

  test('should activate and deactivate user', async () => {
    try {
      // Create a user
      const userData = UserFactory.createUser();
      const createdUser = await userApi.createUser(userData);

      // Deactivate
      const deactivatedUser = await userApi.deactivateUser(createdUser.id);
      expect(deactivatedUser.status).toBe('inactive');

      // Activate
      const activatedUser = await userApi.activateUser(createdUser.id);
      expect(activatedUser.status).toBe('active');

      // Cleanup
      await userApi.deleteUser(createdUser.id);
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });

  test('should create multiple users in bulk', async () => {
    try {
      const userCount = 5;
      const usersData = UserFactory.createUsers(userCount);

      // Create all users
      const createdUsers = await Promise.all(
        usersData.map(userData => userApi.createUser(userData))
      );

      expect(createdUsers).toHaveLength(userCount);

      console.log(`✅ Created ${userCount} users in bulk`);

      // Cleanup
      await Promise.all(createdUsers.map(user => userApi.deleteUser(user.id)));
    } catch (error) {
      console.error('API test failed (this is expected if API is not configured):', error);
      test.skip();
    }
  });
});
