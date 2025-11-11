# Playwright TypeScript Professional Framework

Enterprise-grade Playwright TypeScript test automation framework featuring multi-user workflows, Shadow DOM support, and comprehensive backend integration.

## Features

- **Multi-User Testing**: Dual browser instances for four-eyes approval workflows
- **Shadow DOM Support**: Comprehensive utilities for Shadow DOM interaction
- **Page Fragment Pattern**: Modular, reusable page object components
- **Backend Integration**: REST API clients with data factories
- **Microsoft SSO**: Automated authentication without 2FA
- **TypeScript**: Full type safety and IntelliSense support
- **Custom Fixtures**: Extensible test fixtures for complex scenarios
- **Advanced Utilities**: Custom waits, assertions, and debugging helpers

## Architecture

```
playwright-ts-framework/
├── src/
│   ├── pages/              # Page Objects
│   │   ├── base/           # Base classes (BasePage, BaseFragment)
│   │   ├── fragments/      # Reusable page fragments
│   │   └── *.page.ts       # Specific page objects
│   ├── fixtures/           # Custom Playwright fixtures
│   │   ├── multi-user.fixture.ts
│   │   └── authenticated-multi-user.fixture.ts
│   ├── api/                # Backend API integration
│   │   ├── clients/        # API clients
│   │   ├── models/         # Data models
│   │   └── factories/      # Test data factories
│   ├── utils/              # Utilities
│   │   ├── shadow-dom/     # Shadow DOM helpers
│   │   ├── auth/           # Authentication helpers
│   │   ├── waits/          # Custom wait strategies
│   │   └── assertions/     # Custom assertions
│   └── config/             # Configuration
├── tests/                  # Test files
│   ├── e2e/                # End-to-end tests
│   ├── multi-user/         # Multi-user workflow tests
│   ├── api/                # API tests
│   └── hybrid/             # Combined API + UI tests
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone or setup the project**:
   ```bash
   cd playwright-ts-multipleusers
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - Application URLs
   - Test user credentials (Microsoft SSO)
   - API keys and secrets

### Configuration

#### Environment Variables (.env)

```bash
# Application URLs
BASE_URL=https://your-app.com
API_BASE_URL=https://api.your-app.com

# Test User Credentials
USER_ONE_EMAIL=testuser1@yourdomain.com
USER_ONE_PASSWORD=SecurePassword123!
USER_TWO_EMAIL=testuser2@yourdomain.com
USER_TWO_PASSWORD=SecurePassword123!

# API Authentication
API_KEY=your-api-key
API_SECRET=your-api-secret

# Test Settings
ENV=dev
HEADLESS=true
WORKERS=4
```

## Usage

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:multi-user
npm run test:api

# Run in headed mode
npm run test:headed

# Run with UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

### Test Reports

```bash
# Open HTML report
npm run report

# View trace
npm run trace
```

## Framework Patterns

### 1. Page Fragment Pattern

Break down complex pages into reusable fragments:

```typescript
// fragments/header.fragment.ts
export class HeaderFragment extends BaseFragment {
  constructor(page: Page) {
    super(page, page.locator('header'));
  }

  async clickLogo() {
    await this.getLocator('[data-testid="logo"]').click();
  }
}

// pages/home.page.ts
export class HomePage extends BasePage {
  public header: HeaderFragment;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderFragment(page);
  }
}

// test usage
const homePage = new HomePage(page);
await homePage.header.clickLogo();
```

### 2. Multi-User Testing

Test four-eyes approval workflows with dual browser instances:

```typescript
import { multiUserTest as test } from '@fixtures/multi-user.fixture';

test('four-eyes approval', async ({ initiatorPage, approverPage }) => {
  // Initiator creates action
  const initiatorHome = new HomePage(initiatorPage);
  await initiatorHome.createAction();

  // Approver approves
  const approverHome = new HomePage(approverPage);
  await approverHome.approveAction();
});
```

### 3. Authenticated Multi-User

Automatic Microsoft SSO authentication:

```typescript
import { authenticatedMultiUserTest as test } from '@fixtures/authenticated-multi-user.fixture';

test('authenticated workflow', async ({ initiatorPage, approverPage }) => {
  // Both users are already authenticated via Microsoft SSO
  const initiatorHome = new HomePage(initiatorPage);
  const approverHome = new HomePage(approverPage);

  // Users are ready to interact with the application
});
```

### 4. Shadow DOM Interaction

Comprehensive Shadow DOM support:

```typescript
import { createShadowHelper } from '@utils/shadow-dom/shadow-dom.helper';

const shadowHelper = createShadowHelper(page);

// Pierce single shadow root
await shadowHelper.clickInShadow('my-component', 'button');

// Pierce nested shadow roots
const locator = shadowHelper.pierceNested([
  'component-a',
  'component-b',
  'button'
]);
await locator.click();

// Get text from shadow DOM
const text = await shadowHelper.getTextFromShadow(
  'my-component',
  '.text-element'
);
```

### 5. Backend API Integration

Use API for test data setup and verification:

```typescript
import { UserApiClient } from '@api/clients/user-api.client';
import { UserFactory } from '@api/factories/user.factory';

test('hybrid test', async ({ page }) => {
  const userApi = new UserApiClient();

  // Setup: Create user via API
  const userData = UserFactory.createUser();
  const user = await userApi.createUser(userData);

  // Test: Verify in UI
  const homePage = new HomePage(page);
  await homePage.searchUser(user.email);

  // Cleanup: Delete via API
  await userApi.deleteUser(user.id);
});
```

### 6. Custom Wait Strategies

Advanced waiting utilities:

```typescript
import { createWaitHelpers } from '@utils/waits/wait-helpers';

const waits = createWaitHelpers(page);

// Wait for specific text
await waits.waitForText('body', 'Welcome', 10000);

// Wait for element count
await waits.waitForElementCount('.item', 5);

// Wait for API response
const data = await waits.waitForApiResponse('/api/users');

// Retry with backoff
await waits.retryUntilSuccess(
  async () => await someAction(),
  maxRetries: 3,
  delayMs: 1000
);
```

### 7. Custom Assertions

Extended assertion methods:

```typescript
import { createAssertions } from '@utils/assertions/custom-assertions';

const assertions = createAssertions(page);

// Assert URL
await assertions.assertUrlContains('/dashboard');

// Assert element count
await assertions.assertCount(page.locator('.item'), 5);

// Assert API response
await assertions.assertResponseStatus('/api/users', 200);

// Multiple assertions
await assertions.assertAll(
  async () => await assertions.assertVisible(element1),
  async () => await assertions.assertEnabled(element2),
  async () => await assertions.assertCount(items, 3)
);
```

## Advanced Features

### Microsoft SSO Authentication

The framework includes automated Microsoft SSO login:

```typescript
import { createMicrosoftAuthHelper } from '@utils/auth/microsoft-sso.helper';

const authHelper = createMicrosoftAuthHelper(page);

await authHelper.login({
  email: 'user@domain.com',
  password: 'password123'
});
```

**Selectors automatically handled**:
- Email input detection
- Password input detection
- "Next" button
- "Sign in" button
- "Stay signed in?" prompt

### Data Factories

Generate realistic test data:

```typescript
import { UserFactory } from '@api/factories/user.factory';

// Create single user
const user = UserFactory.createUser();

// Create specific role
const initiator = UserFactory.createInitiator();
const approver = UserFactory.createApprover();

// Create multiple users
const users = UserFactory.createUsers(10);

// Custom data
const customUser = UserFactory.createUser({
  email: 'specific@email.com',
  role: UserRole.ADMIN
});
```

### Shadow DOM Builder

Fluent API for complex Shadow DOM paths:

```typescript
import { createShadowBuilder } from '@utils/shadow-dom/shadow-dom.helper';

const builder = createShadowBuilder(page);

const locator = builder
  .shadow('component-a')
  .shadow('component-b')
  .shadow('component-c')
  .build();

await locator.click();
```

## Best Practices

### 1. Page Object Organization

- **One page class per page**: HomePage, LoginPage, DashboardPage
- **Extract reusable fragments**: Header, Footer, Navigation
- **Inherit from BasePage**: Leverage common functionality
- **Use TypeScript paths**: `@pages/*`, `@utils/*`, `@api/*`

### 2. Test Structure

```typescript
test.describe('Feature Name', () => {
  let page: Page;
  let homePage: HomePage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('should do something', async () => {
    // Arrange
    const testData = UserFactory.createUser();

    // Act
    await homePage.performAction(testData);

    // Assert
    expect(await homePage.getResult()).toBe('expected');
  });
});
```

### 3. Shadow DOM Strategy

1. **Use utilities first**: Leverage `ShadowDomHelper`
2. **Playwright's built-in**: Use `>>>` selector when possible
3. **Fallback to evaluate**: Only when needed
4. **Page fragments**: Encapsulate shadow DOM logic in fragments

### 4. Multi-User Tests

- Use clear variable naming: `initiatorPage`, `approverPage`
- Log actions: Console log each user's actions
- Separate contexts: Verify session isolation
- Sequential when needed: Use `await` for dependent actions

### 5. API Integration

- **Setup via API**: Create test data efficiently
- **Verify via UI**: Test user-facing behavior
- **Assert via API**: Validate backend state
- **Cleanup via API**: Fast and reliable teardown

## Troubleshooting

### Common Issues

**Issue**: Microsoft SSO selectors not found
```typescript
// Solution: Update selectors in microsoft-sso.helper.ts
// Add your application-specific selectors
```

**Issue**: Shadow DOM elements not accessible
```typescript
// Solution: Use evaluate for deep shadow DOM
await shadowHelper.evaluateInShadow(
  'host-selector',
  'inner-selector',
  (el) => el.click()
);
```

**Issue**: Multi-user session interference
```typescript
// Solution: Verify incognito mode in fixture
// Each context should be completely isolated
```

**Issue**: API tests failing
```typescript
// Solution: Configure API_BASE_URL and authentication
// Or skip API tests if backend is not available
```

### Debug Mode

```bash
# Run with Playwright Inspector
npm run test:debug

# Generate trace
npm test -- --trace on

# View trace
npm run trace
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          USER_ONE_EMAIL: ${{ secrets.USER_ONE_EMAIL }}
          USER_ONE_PASSWORD: ${{ secrets.USER_ONE_PASSWORD }}
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Use conventional commits

## License

MIT

## Support

For issues and questions:
- Check the documentation
- Review example tests
- Inspect trace files
- Enable debug mode
