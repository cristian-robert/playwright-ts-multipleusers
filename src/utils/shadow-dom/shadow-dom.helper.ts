import { Locator, Page } from '@playwright/test';

/**
 * Shadow DOM Helper Utilities
 * Provides methods to interact with Shadow DOM elements in Playwright
 */
export class ShadowDomHelper {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Pierce through a single shadow root
   * @param hostSelector - Selector for the shadow host element
   * @param innerSelector - Selector within the shadow root
   * @returns Locator for the element inside shadow DOM
   */
  public pierceOnce(hostSelector: string, innerSelector: string): Locator {
    return this.page.locator(`${hostSelector} >>> ${innerSelector}`);
  }

  /**
   * Pierce through nested shadow roots
   * @param selectors - Array of selectors representing the path through shadow DOMs
   * @returns Locator for the deeply nested element
   *
   * @example
   * // To access: <component-a> -> shadow -> <component-b> -> shadow -> <button>
   * pierceNested(['component-a', 'component-b', 'button'])
   */
  public pierceNested(selectors: string[]): Locator {
    const path = selectors.join(' >>> ');
    return this.page.locator(path);
  }

  /**
   * Get element inside shadow root by evaluating JavaScript
   * Useful when deep piercing doesn't work
   * @param hostSelector - Selector for the shadow host
   * @param innerSelector - Selector within shadow root
   * @returns ElementHandle or null
   */
  public async evaluateInShadow<T = any>(
    hostSelector: string,
    innerSelector: string,
    operation: (element: Element) => T
  ): Promise<T> {
    return this.page.evaluate(
      ({ host, inner, op }) => {
        const hostElement = document.querySelector(host);
        if (!hostElement?.shadowRoot) {
          throw new Error(`Shadow host not found: ${host}`);
        }
        const innerElement = hostElement.shadowRoot.querySelector(inner);
        if (!innerElement) {
          throw new Error(`Element not found in shadow root: ${inner}`);
        }
        return op(innerElement);
      },
      { host: hostSelector, inner: innerSelector, op: operation.toString() }
    );
  }

  /**
   * Wait for element in shadow DOM to be visible
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   * @param timeout - Optional timeout in milliseconds
   */
  public async waitForShadowElement(
    hostSelector: string,
    innerSelector: string,
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      ({ host, inner }) => {
        const hostElement = document.querySelector(host);
        if (!hostElement?.shadowRoot) return false;
        const innerElement = hostElement.shadowRoot.querySelector(inner);
        return innerElement !== null;
      },
      { host: hostSelector, inner: innerSelector },
      { timeout }
    );
  }

  /**
   * Click element inside shadow DOM
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   */
  public async clickInShadow(hostSelector: string, innerSelector: string): Promise<void> {
    const locator = this.pierceOnce(hostSelector, innerSelector);
    await locator.click();
  }

  /**
   * Fill input field inside shadow DOM
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Input selector within shadow root
   * @param value - Value to fill
   */
  public async fillInShadow(
    hostSelector: string,
    innerSelector: string,
    value: string
  ): Promise<void> {
    const locator = this.pierceOnce(hostSelector, innerSelector);
    await locator.fill(value);
  }

  /**
   * Get text content from element inside shadow DOM
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   * @returns Text content
   */
  public async getTextFromShadow(
    hostSelector: string,
    innerSelector: string
  ): Promise<string | null> {
    const locator = this.pierceOnce(hostSelector, innerSelector);
    return await locator.textContent();
  }

  /**
   * Check if element exists in shadow DOM
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   * @returns Boolean indicating existence
   */
  public async isElementInShadow(
    hostSelector: string,
    innerSelector: string
  ): Promise<boolean> {
    try {
      const locator = this.pierceOnce(hostSelector, innerSelector);
      await locator.waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all elements matching selector inside shadow DOM
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   * @returns Array of element handles
   */
  public getAllInShadow(hostSelector: string, innerSelector: string): Locator {
    return this.pierceOnce(hostSelector, innerSelector);
  }

  /**
   * Execute custom action on shadow DOM element
   * @param hostSelector - Shadow host selector
   * @param innerSelector - Element selector within shadow root
   * @param action - Custom action to perform on the locator
   */
  public async executeOnShadowElement<T>(
    hostSelector: string,
    innerSelector: string,
    action: (locator: Locator) => Promise<T>
  ): Promise<T> {
    const locator = this.pierceOnce(hostSelector, innerSelector);
    return await action(locator);
  }
}

/**
 * Shadow DOM Locator Builder
 * Provides a fluent API for building complex shadow DOM selectors
 */
export class ShadowLocatorBuilder {
  private page: Page;
  private selectors: string[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Add a selector to the shadow path
   * @param selector - CSS selector
   * @returns Builder instance for chaining
   */
  public shadow(selector: string): this {
    this.selectors.push(selector);
    return this;
  }

  /**
   * Build the final locator
   * @returns Playwright Locator
   */
  public build(): Locator {
    if (this.selectors.length === 0) {
      throw new Error('No selectors provided to ShadowLocatorBuilder');
    }
    const path = this.selectors.join(' >>> ');
    return this.page.locator(path);
  }

  /**
   * Reset the builder
   */
  public reset(): this {
    this.selectors = [];
    return this;
  }
}

/**
 * Factory function to create ShadowDomHelper instance
 */
export function createShadowHelper(page: Page): ShadowDomHelper {
  return new ShadowDomHelper(page);
}

/**
 * Factory function to create ShadowLocatorBuilder instance
 */
export function createShadowBuilder(page: Page): ShadowLocatorBuilder {
  return new ShadowLocatorBuilder(page);
}
