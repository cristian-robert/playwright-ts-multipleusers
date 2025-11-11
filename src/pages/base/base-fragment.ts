import { Locator, Page } from '@playwright/test';
import { ShadowDomHelper, createShadowHelper } from '@utils/shadow-dom/shadow-dom.helper';

/**
 * Base Fragment
 * Represents a reusable piece of a page (component, section, widget)
 */
export abstract class BaseFragment {
  protected page: Page;
  protected shadowHelper: ShadowDomHelper;
  protected rootLocator?: Locator;

  constructor(page: Page, rootLocator?: Locator) {
    this.page = page;
    this.rootLocator = rootLocator;
    this.shadowHelper = createShadowHelper(page);
  }

  /**
   * Wait for the fragment to be visible
   */
  public async waitForVisible(timeout?: number): Promise<void> {
    if (this.rootLocator) {
      await this.rootLocator.waitFor({ state: 'visible', timeout });
    }
  }

  /**
   * Wait for the fragment to be hidden
   */
  public async waitForHidden(timeout?: number): Promise<void> {
    if (this.rootLocator) {
      await this.rootLocator.waitFor({ state: 'hidden', timeout });
    }
  }

  /**
   * Check if fragment is visible
   */
  public async isVisible(): Promise<boolean> {
    if (!this.rootLocator) {
      return false;
    }
    try {
      await this.rootLocator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a locator relative to the fragment root
   */
  protected getLocator(selector: string): Locator {
    if (this.rootLocator) {
      return this.rootLocator.locator(selector);
    }
    return this.page.locator(selector);
  }

  /**
   * Wait for network to be idle
   */
  protected async waitForNetworkIdle(timeout: number = 10000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  }

  /**
   * Take screenshot of the fragment
   */
  public async screenshot(path?: string): Promise<Buffer> {
    if (this.rootLocator) {
      return await this.rootLocator.screenshot({ path });
    }
    return await this.page.screenshot({ path });
  }
}
