import { expect, Page, Locator } from '@playwright/test';

/**
 * Custom Assertions
 * Extended assertion methods for common test scenarios
 */
export class CustomAssertions {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Assert element has exact text
   */
  public async assertExactText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert element contains text
   */
  public async assertContainsText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }

  /**
   * Assert element count
   */
  public async assertCount(locator: Locator, expectedCount: number): Promise<void> {
    await expect(locator).toHaveCount(expectedCount);
  }

  /**
   * Assert element is visible
   */
  public async assertVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element is hidden
   */
  public async assertHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden();
  }

  /**
   * Assert element is enabled
   */
  public async assertEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  /**
   * Assert element is disabled
   */
  public async assertDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  /**
   * Assert element has attribute
   */
  public async assertHasAttribute(
    locator: Locator,
    attributeName: string,
    expectedValue?: string
  ): Promise<void> {
    if (expectedValue !== undefined) {
      await expect(locator).toHaveAttribute(attributeName, expectedValue);
    } else {
      const value = await locator.getAttribute(attributeName);
      expect(value).not.toBeNull();
    }
  }

  /**
   * Assert element has class
   */
  public async assertHasClass(locator: Locator, className: string): Promise<void> {
    await expect(locator).toHaveClass(new RegExp(className));
  }

  /**
   * Assert URL contains text
   */
  public async assertUrlContains(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  /**
   * Assert URL equals
   */
  public async assertUrlEquals(expectedUrl: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }

  /**
   * Assert page title
   */
  public async assertTitle(expectedTitle: string): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Assert page title contains
   */
  public async assertTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }

  /**
   * Assert element value (for inputs)
   */
  public async assertValue(locator: Locator, expectedValue: string): Promise<void> {
    await expect(locator).toHaveValue(expectedValue);
  }

  /**
   * Assert checkbox is checked
   */
  public async assertChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
  }

  /**
   * Assert checkbox is not checked
   */
  public async assertNotChecked(locator: Locator): Promise<void> {
    await expect(locator).not.toBeChecked();
  }

  /**
   * Assert element is focused
   */
  public async assertFocused(locator: Locator): Promise<void> {
    await expect(locator).toBeFocused();
  }

  /**
   * Assert element is editable
   */
  public async assertEditable(locator: Locator): Promise<void> {
    await expect(locator).toBeEditable();
  }

  /**
   * Assert elements are in order
   */
  public async assertElementsOrder(
    locators: Locator[],
    expectedOrder: string[]
  ): Promise<void> {
    const actualOrder: string[] = [];

    for (const locator of locators) {
      const text = await locator.textContent();
      if (text) {
        actualOrder.push(text.trim());
      }
    }

    expect(actualOrder).toEqual(expectedOrder);
  }

  /**
   * Assert API response status
   */
  public async assertResponseStatus(
    urlPattern: string | RegExp,
    expectedStatus: number,
    timeout: number = 30000
  ): Promise<void> {
    const response = await this.page.waitForResponse(
      resp => {
        const url = resp.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );

    expect(response.status()).toBe(expectedStatus);
  }

  /**
   * Assert API response contains data
   */
  public async assertResponseContains(
    urlPattern: string | RegExp,
    expectedData: any,
    timeout: number = 30000
  ): Promise<void> {
    const response = await this.page.waitForResponse(
      resp => {
        const url = resp.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );

    const responseData = await response.json();
    expect(responseData).toMatchObject(expectedData);
  }

  /**
   * Assert screenshot matches baseline
   */
  public async assertScreenshotMatches(
    locator: Locator | Page,
    name: string,
    options?: { maxDiffPixels?: number; threshold?: number }
  ): Promise<void> {
    if ('screenshot' in locator) {
      await expect(locator).toHaveScreenshot(`${name}.png`, options);
    }
  }

  /**
   * Assert element CSS property
   */
  public async assertCssProperty(
    locator: Locator,
    property: string,
    expectedValue: string
  ): Promise<void> {
    await expect(locator).toHaveCSS(property, expectedValue);
  }

  /**
   * Soft assertion (continues test on failure)
   */
  public async softAssert(assertion: () => Promise<void>): Promise<void> {
    try {
      await assertion();
    } catch (error) {
      console.warn('Soft assertion failed:', error);
      // Don't throw - continue test execution
    }
  }

  /**
   * Assert multiple conditions (all must pass)
   */
  public async assertAll(...assertions: (() => Promise<void>)[]): Promise<void> {
    const results = await Promise.allSettled(assertions.map(fn => fn()));

    const failures = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'rejected');

    if (failures.length > 0) {
      const errorMessages = failures.map(
        ({ result, index }) =>
          `Assertion ${index + 1} failed: ${(result as PromiseRejectedResult).reason}`
      );
      throw new Error(`Multiple assertions failed:\n${errorMessages.join('\n')}`);
    }
  }
}

/**
 * Factory function to create CustomAssertions instance
 */
export function createAssertions(page: Page): CustomAssertions {
  return new CustomAssertions(page);
}
