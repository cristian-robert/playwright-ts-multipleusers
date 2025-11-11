import { Page } from '@playwright/test';
import { BasePage } from './base/base-page';
import { HeaderFragment } from './fragments/header.fragment';
import { CategoriesSectionFragment } from './fragments/categories-section.fragment';
import { RegistrationFormFragment } from './fragments/registration-form.fragment';

/**
 * Home Page
 * Composes multiple fragments to represent the home page
 */
export class HomePage extends BasePage {
  protected url = '/';

  // Fragments
  public header: HeaderFragment;
  public categoriesSection: CategoriesSectionFragment;
  public registrationForm: RegistrationFormFragment;

  constructor(page: Page) {
    super(page);

    // Initialize fragments
    this.header = new HeaderFragment(page);
    this.categoriesSection = new CategoriesSectionFragment(page);
    this.registrationForm = new RegistrationFormFragment(page);
  }

  /**
   * Wait for the home page to load completely
   */
  protected async waitForPageLoad(): Promise<void> {
    await super.waitForPageLoad();

    // Wait for key fragments to be visible
    await this.header.waitForVisible();

    // Optionally wait for other fragments
    // Note: Some fragments might not always be visible, handle accordingly
    const isCategoriesVisible = await this.categoriesSection.isVisible();
    const isRegistrationVisible = await this.registrationForm.isVisible();

    console.log(`Home page loaded - Categories visible: ${isCategoriesVisible}, Registration visible: ${isRegistrationVisible}`);
  }

  /**
   * Check if user is logged in
   */
  public async isUserLoggedIn(): Promise<boolean> {
    return await this.header.isUserLoggedIn();
  }

  /**
   * Perform quick registration
   */
  public async quickRegister(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<boolean> {
    await this.registrationForm.register(userData);
    return await this.registrationForm.isSuccessful();
  }

  /**
   * Navigate to category
   */
  public async navigateToCategory(categoryName: string): Promise<void> {
    await this.categoriesSection.clickCategory(categoryName);
  }

  /**
   * Search from header
   */
  public async search(query: string): Promise<void> {
    await this.header.search(query);
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    await this.header.logout();
  }
}
