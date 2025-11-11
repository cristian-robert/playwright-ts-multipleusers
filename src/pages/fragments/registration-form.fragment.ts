import { Page, Locator } from '@playwright/test';
import { BaseFragment } from '../base/base-fragment';

/**
 * Registration form data
 */
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Registration Form Fragment
 * Represents a user registration form
 */
export class RegistrationFormFragment extends BaseFragment {
  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page, rootSelector: string = '[data-testid="registration-form"]') {
    super(page, page.locator(rootSelector));

    // Initialize locators
    this.firstNameInput = this.getLocator('input[name="firstName"], [data-testid="first-name-input"]');
    this.lastNameInput = this.getLocator('input[name="lastName"], [data-testid="last-name-input"]');
    this.emailInput = this.getLocator('input[name="email"], [data-testid="email-input"]');
    this.passwordInput = this.getLocator('input[name="password"], [data-testid="password-input"]');
    this.confirmPasswordInput = this.getLocator('input[name="confirmPassword"], [data-testid="confirm-password-input"]');
    this.submitButton = this.getLocator('button[type="submit"], [data-testid="submit-button"]');
    this.errorMessage = this.getLocator('[data-testid="error-message"], .error-message');
    this.successMessage = this.getLocator('[data-testid="success-message"], .success-message');
  }

  /**
   * Fill the registration form
   */
  public async fillForm(data: RegistrationData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);

    if (data.confirmPassword) {
      await this.confirmPasswordInput.fill(data.confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(data.password);
    }
  }

  /**
   * Submit the form
   */
  public async submit(): Promise<void> {
    await this.submitButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Fill and submit in one action
   */
  public async register(data: RegistrationData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  /**
   * Get error message
   */
  public async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Get success message
   */
  public async getSuccessMessage(): Promise<string | null> {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.successMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if form has errors
   */
  public async hasErrors(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Check if registration was successful
   */
  public async isSuccessful(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  /**
   * Get field validation error (example with shadow DOM)
   */
  public async getFieldError(fieldName: string): Promise<string | null> {
    // Example: If field errors are in shadow DOM
    try {
      return await this.shadowHelper.getTextFromShadow(
        `[name="${fieldName}"]`,
        '.field-error'
      );
    } catch {
      return null;
    }
  }

  /**
   * Check if submit button is enabled
   */
  public async isSubmitEnabled(): Promise<boolean> {
    return await this.submitButton.isEnabled();
  }

  /**
   * Clear all fields
   */
  public async clearForm(): Promise<void> {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.confirmPasswordInput.clear();
  }
}
