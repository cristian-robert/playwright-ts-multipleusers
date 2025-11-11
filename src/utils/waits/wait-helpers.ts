import { Page, Locator } from '@playwright/test';

/**
 * Wait Helpers
 * Advanced waiting strategies for complex scenarios
 */
export class WaitHelpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for element to have specific text
   */
  public async waitForText(
    selector: string,
    expectedText: string,
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      ({ sel, text }) => {
        const element = document.querySelector(sel);
        return element?.textContent?.includes(text) || false;
      },
      { sel: selector, text: expectedText },
      { timeout }
    );
  }

  /**
   * Wait for element count
   */
  public async waitForElementCount(
    selector: string,
    expectedCount: number,
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      ({ sel, count }) => {
        const elements = document.querySelectorAll(sel);
        return elements.length === count;
      },
      { sel: selector, count: expectedCount },
      { timeout }
    );
  }

  /**
   * Wait for element to have specific attribute value
   */
  public async waitForAttribute(
    selector: string,
    attributeName: string,
    expectedValue: string,
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      ({ sel, attr, value }) => {
        const element = document.querySelector(sel);
        return element?.getAttribute(attr) === value;
      },
      { sel: selector, attr: attributeName, value: expectedValue },
      { timeout }
    );
  }

  /**
   * Wait for URL to contain specific text
   */
  public async waitForUrlContains(text: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(url => url.includes(text), { timeout });
  }

  /**
   * Wait for URL to match pattern
   */
  public async waitForUrlPattern(pattern: RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  /**
   * Wait for element to be stable (not moving)
   */
  public async waitForStability(
    locator: Locator,
    stableTime: number = 1000,
    timeout: number = 30000
  ): Promise<void> {
    const startTime = Date.now();
    let lastPosition = await this.getElementPosition(locator);

    while (Date.now() - startTime < timeout) {
      await this.page.waitForTimeout(stableTime);
      const currentPosition = await this.getElementPosition(locator);

      if (
        currentPosition.x === lastPosition.x &&
        currentPosition.y === lastPosition.y
      ) {
        return; // Element is stable
      }

      lastPosition = currentPosition;
    }

    throw new Error(`Element did not stabilize within ${timeout}ms`);
  }

  /**
   * Get element position
   */
  private async getElementPosition(locator: Locator): Promise<{ x: number; y: number }> {
    const box = await locator.boundingBox();
    return { x: box?.x || 0, y: box?.y || 0 };
  }

  /**
   * Wait for API response
   */
  public async waitForApiResponse(
    urlPattern: string | RegExp,
    timeout: number = 30000
  ): Promise<any> {
    const response = await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );

    return await response.json().catch(() => response.text());
  }

  /**
   * Wait for multiple network requests to complete
   */
  public async waitForNetworkIdle(
    options: { timeout?: number; idleTime?: number } = {}
  ): Promise<void> {
    const { timeout = 30000, idleTime = 500 } = options;

    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});

    // Additional wait for specified idle time
    await this.page.waitForTimeout(idleTime);
  }

  /**
   * Wait for element to disappear
   */
  public async waitForDisappear(selector: string, timeout: number = 30000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for animation to complete
   */
  public async waitForAnimation(locator: Locator, timeout: number = 5000): Promise<void> {
    // Wait for animations to complete
    await this.page.waitForTimeout(300); // Initial delay

    await this.page.evaluate(
      el => {
        if (el) {
          return Promise.all(
            el.getAnimations().map(animation => animation.finished)
          );
        }
      },
      await locator.elementHandle()
    );
  }

  /**
   * Retry action until success
   */
  public async retryUntilSuccess<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${i + 1}/${maxRetries} failed:`, error);

        if (i < maxRetries - 1) {
          await this.page.waitForTimeout(delayMs);
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Wait with polling
   */
  public async waitWithPolling<T>(
    condition: () => Promise<boolean>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<void> {
    const { timeout = 30000, interval = 500 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await this.page.waitForTimeout(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

/**
 * Factory function to create WaitHelpers instance
 */
export function createWaitHelpers(page: Page): WaitHelpers {
  return new WaitHelpers(page);
}
