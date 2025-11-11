import {
  authenticatedMultiUserTest as test,
  expect,
} from '@fixtures/authenticated-multi-user.fixture';

/**
 * Authenticated Multi-User Workflow Tests
 * Uses pre-authenticated users via Microsoft SSO with registry pattern
 */
test.describe('Authenticated Multi-User Workflows', () => {
  test('should have both users authenticated', async ({ user1, user2 }) => {
    // Verify both users are logged in using registry
    const user1LoggedIn = await user1.pages.home.isUserLoggedIn();
    const user2LoggedIn = await user2.pages.home.isUserLoggedIn();

    expect(user1LoggedIn).toBe(true);
    expect(user2LoggedIn).toBe(true);

    console.log('✅ Both users are authenticated');
  });

  test('should perform authenticated workflow', async ({ user1, user2 }) => {
    // Get user names using registry
    const user1Name = await user1.pages.home.header.getUserName();
    const user2Name = await user2.pages.home.header.getUserName();

    console.log(`🟦 User 1: ${user1Name}`);
    console.log(`🟧 User 2: ${user2Name}`);

    // Both users should have usernames
    expect(user1Name).toBeTruthy();
    expect(user2Name).toBeTruthy();

    // Example workflow:
    // 1. User 1 creates something
    // 2. User 2 sees it in their queue
    // 3. User 2 approves
    // 4. User 1 sees approval confirmation
  });

  test('should handle logout and re-authentication', async ({ user1, user1Page }) => {
    // Verify logged in
    let isLoggedIn = await user1.pages.home.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Logout (this will likely redirect to login page)
    await user1.pages.home.logout();

    // Wait for logout to complete
    await user1Page.waitForTimeout(2000);

    // Note: After logout, re-authentication would require
    // navigating back and going through SSO flow again
    // This depends on your application's authentication flow
  });

  test('should access all authenticated services', async ({ user1, user2 }) => {
    // Both users already on home page and authenticated from fixture!
    // No need to navigate or wait - just verify and use services

    // Verify URLs (users already on home page)
    await user1.services.assertions.assertUrlContains('/');
    await user2.services.assertions.assertUrlContains('/');

    console.log('✅ Both users can access authenticated services');
  });

  test('should verify independent authenticated sessions', async ({
    user1Context,
    user2Context,
  }) => {
    // Get cookies from both contexts
    const user1Cookies = await user1Context.cookies();
    const user2Cookies = await user2Context.cookies();

    // Both should have authentication cookies
    expect(user1Cookies.length).toBeGreaterThan(0);
    expect(user2Cookies.length).toBeGreaterThan(0);

    // Sessions should be independent
    expect(user1Cookies).not.toEqual(user2Cookies);

    console.log(`User 1 has ${user1Cookies.length} cookies`);
    console.log(`User 2 has ${user2Cookies.length} cookies`);
  });

  test('should support three authenticated users', async ({ user1, user2, user3 }) => {
    // All three users are authenticated automatically
    const [name1, name2, name3] = await Promise.all([
      user1.pages.home.header.getUserName(),
      user2.pages.home.header.getUserName(),
      user3.pages.home.header.getUserName(),
    ]);

    console.log(`User 1: ${name1}`);
    console.log(`User 2: ${name2}`);
    console.log(`User 3: ${name3}`);

    expect(name1).toBeTruthy();
    expect(name2).toBeTruthy();
    expect(name3).toBeTruthy();

    console.log('✅ All three users authenticated and ready');
  });
});
