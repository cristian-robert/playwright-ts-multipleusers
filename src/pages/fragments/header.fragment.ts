import { Page, Locator } from '@playwright/test';
import { BaseFragment } from '../base/base-fragment';

/**
 * Header Fragment
 * Represents the application header/navigation bar
 */
export class HeaderFragment extends BaseFragment {
  // Locators
  private readonly logo: Locator;
  private readonly userMenu: Locator;
  private readonly notificationsIcon: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    // Pass the root locator for the header
    super(page, page.locator('header, [role="banner"]'));

    // Initialize locators relative to the fragment
    this.logo = this.getLocator('[data-testid="logo"], .logo');
    this.userMenu = this.getLocator('[data-testid="user-menu"], .user-menu');
    this.notificationsIcon = this.getLocator('[data-testid="notifications"], .notifications-icon');
    this.searchInput = this.getLocator('input[type="search"], [data-testid="search-input"]');
  }

  /**
   * Click on logo to go home
   */
  public async clickLogo(): Promise<void> {
    await this.logo.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Open user menu
   */
  public async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  /**
   * Click notifications icon
   */
  public async openNotifications(): Promise<void> {
    await this.notificationsIcon.click();
  }

  /**
   * Search for content
   */
  public async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForNetworkIdle();
  }

  /**
   * Get notification count (example with shadow DOM)
   */
  public async getNotificationCount(): Promise<number> {
    // Example: If notifications are in a shadow DOM
    try {
      const countText = await this.shadowHelper.getTextFromShadow(
        '[data-testid="notifications"]',
        '.notification-badge'
      );
      return countText ? parseInt(countText, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    await this.openUserMenu();

    // Wait for menu to be visible
    await this.page.waitForTimeout(300);

    // Click logout option
    const logoutButton = this.page.locator('[data-testid="logout"], button:has-text("Logout"), button:has-text("Sign out")');
    await logoutButton.click();

    await this.waitForNetworkIdle();
  }

  /**
   * Get logged-in user name
   */
  public async getUserName(): Promise<string | null> {
    return await this.userMenu.textContent();
  }

  /**
   * Check if user is logged in
   */
  public async isUserLoggedIn(): Promise<boolean> {
    return await this.userMenu.isVisible();
  }
}
