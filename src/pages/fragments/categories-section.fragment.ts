import { Page, Locator } from '@playwright/test';
import { BaseFragment } from '../base/base-fragment';

/**
 * Categories Section Fragment
 * Represents a section displaying categories
 */
export class CategoriesSectionFragment extends BaseFragment {
  // Locators
  private readonly sectionTitle: Locator;
  private readonly categoryCards: Locator;

  constructor(page: Page, rootSelector: string = '[data-testid="categories-section"]') {
    // Pass the root locator for the categories section
    super(page, page.locator(rootSelector));

    // Initialize locators
    this.sectionTitle = this.getLocator('h2, [data-testid="section-title"]');
    this.categoryCards = this.getLocator('[data-testid="category-card"], .category-card');
  }

  /**
   * Get section title
   */
  public async getTitle(): Promise<string | null> {
    return await this.sectionTitle.textContent();
  }

  /**
   * Get all category names
   */
  public async getAllCategories(): Promise<string[]> {
    const cards = await this.categoryCards.all();
    const categories: string[] = [];

    for (const card of cards) {
      const nameElement = card.locator('[data-testid="category-name"], .category-name');
      const name = await nameElement.textContent();
      if (name) {
        categories.push(name.trim());
      }
    }

    return categories;
  }

  /**
   * Click on a category by name
   */
  public async clickCategory(categoryName: string): Promise<void> {
    // Find the category card with matching name
    const categoryCard = this.categoryCards.filter({
      has: this.page.locator(`text="${categoryName}"`),
    }).first();

    await categoryCard.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get category count
   */
  public async getCategoryCount(): Promise<number> {
    return await this.categoryCards.count();
  }

  /**
   * Check if category exists
   */
  public async hasCategory(categoryName: string): Promise<boolean> {
    const categories = await this.getAllCategories();
    return categories.includes(categoryName);
  }

  /**
   * Get category description (example with shadow DOM)
   */
  public async getCategoryDescription(categoryName: string): Promise<string | null> {
    // Example: If category descriptions are in shadow DOM
    try {
      // First, find the category card
      const categoryCard = this.categoryCards.filter({
        has: this.page.locator(`text="${categoryName}"`),
      }).first();

      // Get the data-id or unique identifier
      const categoryId = await categoryCard.getAttribute('data-category-id');

      if (categoryId) {
        // Access description in shadow DOM
        return await this.shadowHelper.getTextFromShadow(
          `[data-category-id="${categoryId}"]`,
          '.category-description'
        );
      }
    } catch (error) {
      console.warn(`Could not get description for category: ${categoryName}`);
    }

    return null;
  }

  /**
   * Hover over category
   */
  public async hoverCategory(categoryName: string): Promise<void> {
    const categoryCard = this.categoryCards.filter({
      has: this.page.locator(`text="${categoryName}"`),
    }).first();

    await categoryCard.hover();
  }
}
