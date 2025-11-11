import { Page, Locator } from '@playwright/test';
import { ShadowDomHelper, createShadowHelper } from '@utils/shadow-dom/shadow-dom.helper';
import { config } from '@config/env.config';

/**
 * Base Page
 * Provides common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;
  protected shadowHelper: ShadowDomHelper;
  protected abstract url: string;

  constructor(page: Page) {
    this.page = page;
    this.shadowHelper = createShadowHelper(page);
  }

  /**
   * Navigate to the page
   */
  public async navigate(): Promise<void> {
    const fullUrl = `${config.baseUrl}${this.url}`;
    await this.page.goto(fullUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  protected async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  }

  /**
   * Get current page URL
   */
  public getUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  public async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Reload the page
   */
  public async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back
   */
  public async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward
   */
  public async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }

  /**
   * Wait for navigation
   */
  protected async waitForNavigation(action: () => Promise<void>): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation(),
      action(),
    ]);
  }

  /**
   * Take screenshot
   */
  public async screenshot(path?: string): Promise<Buffer> {
    return await this.page.screenshot({ path, fullPage: true });
  }

  /**
   * Get locator
   */
  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Wait for selector
   */
  protected async waitForSelector(
    selector: string,
    options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }
  ): Promise<void> {
    await this.page.locator(selector).waitFor(options);
  }

  /**
   * Click element
   */
  protected async click(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  /**
   * Fill input
   */
  protected async fill(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  /**
   * Get text content
   */
  protected async getText(selector: string): Promise<string | null> {
    return await this.page.locator(selector).textContent();
  }

  /**
   * Check if element is visible
   */
  protected async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for network idle
   */
  protected async waitForNetworkIdle(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  }

  /**
   * Execute JavaScript
   */
  protected async evaluate<T>(pageFunction: () => T): Promise<T> {
    return await this.page.evaluate(pageFunction);
  }

  /**
   * Scroll to element
   */
  protected async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  protected async hover(selector: string): Promise<void> {
    await this.page.locator(selector).hover();
  }

  /**
   * Double click
   */
  protected async doubleClick(selector: string): Promise<void> {
    await this.page.locator(selector).dblclick();
  }

  /**
   * Right click
   */
  protected async rightClick(selector: string): Promise<void> {
    await this.page.locator(selector).click({ button: 'right' });
  }
}
