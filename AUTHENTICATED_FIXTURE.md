# Authenticated Multi-User Fixture Guide ✅

**Date**: 2025-11-11
**Status**: Active - Single fixture for all tests

---

## Overview

The framework now uses a **single authenticated fixture** that handles all multi-user testing scenarios. This fixture provides 1-3 authenticated users with flexible destructuring.

## Architecture

### Single Fixture Approach

- **File**: `src/fixtures/authenticated-multi-user.fixture.ts`
- **Removed**: `multi-user.fixture.ts` (no longer needed)
- **Direct**: No longer extends another fixture - self-contained

### What You Get

When using `authenticatedMultiUserTest`, all users are automatically:

✅ **Navigated** to home page (`config.baseUrl`)
✅ **Authenticated** via Microsoft SSO (if Login button present)
✅ **Ready to use** - pages loaded, network idle
✅ **Registry available** - all pages and services accessible

---

## Authentication Logic

### Smart Login Detection

The fixture checks if authentication is needed by looking for the Login button:

```typescript
// 1. Navigate to home page
await page.goto(config.baseUrl);
await page.waitForLoadState('networkidle');

// 2. Check if Login button is displayed
const loginButton = page.locator('button:has-text("Login"), a:has-text("Login")').first();
const isLoginButtonVisible = await loginButton.isVisible().catch(() => false);

// 3. If visible → authenticate
if (isLoginButtonVisible) {
  await loginButton.click();  // Redirects to Microsoft SSO
  await authHelper.login({ email, password });
}

// 4. If not visible → already logged in, continue
```

### Benefits

✅ **No unnecessary authentication** - Skip if already logged in
✅ **Realistic flow** - Mimics actual user behavior
✅ **Faster tests** - Only authenticate when needed
✅ **Flexible** - Works with session persistence

---

## Usage

### Import the Fixture

```typescript
import { authenticatedMultiUserTest as test, expect } from '@fixtures/authenticated-multi-user.fixture';

// Or use shorthand
import { test, expect } from '@fixtures/authenticated-multi-user.fixture';
```

### Single User Test

```typescript
test('single user test', async ({ user1 }) => {
  // User already on home page and authenticated!
  const userName = await user1.pages.home.header.getUserName();
  console.log(`Logged in as: ${userName}`);
});
```

### Two User Test

```typescript
test('two user workflow', async ({ user1, user2 }) => {
  // Both users already on home page and authenticated!

  // User 1 creates something
  await user1.pages.home.createRequest({ title: 'Test' });

  // User 2 approves it
  await user2.pages.home.approveRequest('request-123');
});
```

### Three User Test

```typescript
test('three level approval', async ({ user1, user2, user3 }) => {
  // All three users ready!

  await user1.pages.home.createRequest({ title: 'Multi-level approval' });
  await user2.pages.home.firstApproval('request-123');
  await user3.pages.home.finalApproval('request-123');
});
```

---

## Configuration

### User Credentials

Set in `.env` file:

```bash
# User 1
USER1_EMAIL=user1@yourdomain.com
USER1_PASSWORD=SecurePassword123!

# User 2
USER2_EMAIL=user2@yourdomain.com
USER2_PASSWORD=SecurePassword123!

# User 3
USER3_EMAIL=user3@yourdomain.com
USER3_PASSWORD=SecurePassword123!
```

### Base URL

```bash
BASE_URL=https://your-app.com
```

---

## Key Rules

### ✅ DO

- **Use fixture directly** - Users are already authenticated and on home page
- **Destructure only needed users** - `{ user1 }` for single user tests
- **Access registry immediately** - `user1.pages.home`, `user1.services.waits`
- **Focus on test logic** - Fixture handles all setup

### ❌ DON'T

- **Call navigate() to home page** - Fixture already did this
- **Call login()** - Fixture already authenticated
- **Wait for initial load** - Fixture already waited for network idle
- **Create separate registries** - Use user1, user2, user3 directly

---

## Available Properties

Each user provides:

```typescript
{
  user1Context: BrowserContext,  // Browser context (incognito)
  user1Page: Page,                // Playwright Page object
  user1Registry: AppRegistry,     // Full registry
  user1: AppRegistry,             // Alias (same as user1Registry)

  // Same for user2 and user3

  registry: MultiUserRegistry     // Combined registry (all users)
}
```

---

## Example Test Structure

```typescript
import { test, expect } from '@fixtures/authenticated-multi-user.fixture';

test.describe('Feature Tests', () => {
  test('should work with single user', async ({ user1 }) => {
    // User already authenticated and on home page!
    const notifications = await user1.pages.home.header.getNotificationCount();
    expect(notifications).toBeGreaterThanOrEqual(0);
  });

  test('should work with multiple users', async ({ user1, user2 }) => {
    // Both users authenticated and ready!
    const name1 = await user1.pages.home.header.getUserName();
    const name2 = await user2.pages.home.header.getUserName();

    console.log(`User 1: ${name1}`);
    console.log(`User 2: ${name2}`);
  });
});
```

---

## Migration from Old Fixtures

### Before (Using multi-user.fixture)

```typescript
import { multiUserTest as test } from '@fixtures/multi-user.fixture';

test('my test', async ({ user1 }) => {
  await user1.pages.home.navigate();  // ❌ Redundant
  await user1.services.waits.waitForNetworkIdle();  // ❌ Redundant

  // Test logic...
});
```

### After (Using authenticated-multi-user.fixture)

```typescript
import { test } from '@fixtures/authenticated-multi-user.fixture';

test('my test', async ({ user1 }) => {
  // ✅ User already on home page and authenticated!

  // Test logic...
});
```

---

## Benefits

### 1. Single Source of Truth
- One fixture for all tests
- Consistent behavior
- Easier maintenance

### 2. Smart Authentication
- Only authenticates when needed
- Checks Login button presence
- Realistic user flow

### 3. Faster Tests
- No redundant navigation
- Skip auth if already logged in
- Network idle wait only once

### 4. Better DX
- Simple imports
- Flexible destructuring
- Clear responsibilities

---

## Summary

The framework now provides a single, powerful fixture that:

✅ **Simplifies** - One fixture for all scenarios
✅ **Authenticates** - Smart login detection
✅ **Optimizes** - No redundant operations
✅ **Scales** - 1-3 users as needed

All tests automatically get authenticated users ready to use!
