import { Page } from '@playwright/test';

/**
 * Microsoft SSO Authentication Configuration
 */
export interface MicrosoftAuthConfig {
  email: string;
  password: string;
  timeout?: number;
}

/**
 * Microsoft SSO Helper
 * Handles authentication flow for Microsoft SSO without 2FA/MFA
 */
export class MicrosoftSSOHelper {
  private page: Page;
  private readonly DEFAULT_TIMEOUT = 60000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Perform Microsoft SSO login
   * @param config - Authentication configuration
   */
  public async login(config: MicrosoftAuthConfig): Promise<void> {
    const timeout = config.timeout || this.DEFAULT_TIMEOUT;

    try {
      // Wait for Microsoft login page to load
      await this.waitForLoginPage(timeout);

      // Enter email
      await this.enterEmail(config.email, timeout);

      // Enter password
      await this.enterPassword(config.password, timeout);

      // Handle "Stay signed in?" prompt
      await this.handleStaySignedIn(timeout);

      // Wait for successful authentication
      await this.waitForAuthComplete(timeout);

      console.log(`✅ Microsoft SSO login successful for: ${config.email}`);
    } catch (error) {
      console.error(`❌ Microsoft SSO login failed for: ${config.email}`);
      throw error;
    }
  }

  /**
   * Wait for Microsoft login page to appear
   */
  private async waitForLoginPage(timeout: number): Promise<void> {
    await this.page.waitForSelector(
      'input[type="email"], input[name="loginfmt"]',
      { timeout, state: 'visible' }
    );
  }

  /**
   * Enter email address
   */
  private async enterEmail(email: string, timeout: number): Promise<void> {
    // Try multiple possible email input selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[name="loginfmt"]',
      'input[placeholder*="email" i]',
      '#i0116', // Microsoft's common email input ID
    ];

    for (const selector of emailSelectors) {
      try {
        const emailInput = this.page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 2000 })) {
          await emailInput.fill(email);

          // Click "Next" button
          await this.clickNext(timeout);
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error('Could not find email input field');
  }

  /**
   * Enter password
   */
  private async enterPassword(password: string, timeout: number): Promise<void> {
    // Wait for password page to load
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Try multiple possible password input selectors
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="passwd"]',
      'input[placeholder*="password" i]',
      '#i0118', // Microsoft's common password input ID
    ];

    for (const selector of passwordSelectors) {
      try {
        const passwordInput = this.page.locator(selector).first();
        if (await passwordInput.isVisible({ timeout: 5000 })) {
          await passwordInput.fill(password);

          // Click "Sign in" button
          await this.clickSignIn(timeout);
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error('Could not find password input field');
  }

  /**
   * Click "Next" button
   */
  private async clickNext(timeout: number): Promise<void> {
    const nextSelectors = [
      'input[type="submit"][value="Next"]',
      'button:has-text("Next")',
      '#idSIButton9', // Microsoft's common "Next" button ID
    ];

    for (const selector of nextSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error('Could not find "Next" button');
  }

  /**
   * Click "Sign in" button
   */
  private async clickSignIn(timeout: number): Promise<void> {
    const signInSelectors = [
      'input[type="submit"][value="Sign in"]',
      'button:has-text("Sign in")',
      '#idSIButton9', // Microsoft's common "Sign in" button ID
    ];

    for (const selector of signInSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          return;
        }
      } catch {
        continue;
      }
    }

    throw new Error('Could not find "Sign in" button');
  }

  /**
   * Handle "Stay signed in?" prompt
   */
  private async handleStaySignedIn(timeout: number): Promise<void> {
    try {
      // Wait for the prompt (it may not always appear)
      const yesButton = this.page.locator('input[type="submit"][value="Yes"], button:has-text("Yes")').first();
      const noButton = this.page.locator('input[type="submit"][value="No"], button:has-text("No")').first();

      if (await yesButton.isVisible({ timeout: 5000 })) {
        // Click "No" to avoid storing credentials
        if (await noButton.isVisible({ timeout: 1000 })) {
          await noButton.click();
        } else {
          await yesButton.click();
        }
      }
    } catch {
      // Prompt may not appear, continue
    }
  }

  /**
   * Wait for authentication to complete
   */
  private async waitForAuthComplete(timeout: number): Promise<void> {
    // Wait for navigation away from Microsoft login page
    await this.page.waitForURL(
      url => !url.includes('login.microsoftonline.com') && !url.includes('microsoft.com/auth'),
      { timeout }
    );

    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Check if user is already logged in
   */
  public async isLoggedIn(): Promise<boolean> {
    const currentUrl = this.page.url();
    return !currentUrl.includes('login.microsoftonline.com') &&
           !currentUrl.includes('microsoft.com/auth');
  }

  /**
   * Logout from Microsoft SSO
   */
  public async logout(): Promise<void> {
    // This is application-specific - override in your implementation
    console.warn('Logout method should be implemented based on your application');
  }
}

/**
 * Factory function to create MicrosoftSSOHelper instance
 */
export function createMicrosoftAuthHelper(page: Page): MicrosoftSSOHelper {
  return new MicrosoftSSOHelper(page);
}
