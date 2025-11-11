import { Page } from '@playwright/test';
import { ShadowDomHelper, createShadowHelper } from '@utils/shadow-dom/shadow-dom.helper';
import { WaitHelpers, createWaitHelpers } from '@utils/waits/wait-helpers';
import { CustomAssertions, createAssertions } from '@utils/assertions/custom-assertions';
import { MicrosoftSSOHelper, createMicrosoftAuthHelper } from '@utils/auth/microsoft-sso.helper';
import { UserApiClient } from '@api/clients/user-api.client';

/**
 * Service Registry
 * Centralized management of utilities and services
 * Provides lazy-loaded services with caching
 */
export class ServiceRegistry {
  private page: Page;
  private cache: Map<string, any> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get Shadow DOM helper (cached)
   */
  get shadow(): ShadowDomHelper {
    if (!this.cache.has('shadow')) {
      this.cache.set('shadow', createShadowHelper(this.page));
    }
    return this.cache.get('shadow');
  }

  /**
   * Get Wait helpers (cached)
   */
  get waits(): WaitHelpers {
    if (!this.cache.has('waits')) {
      this.cache.set('waits', createWaitHelpers(this.page));
    }
    return this.cache.get('waits');
  }

  /**
   * Get Custom assertions (cached)
   */
  get assertions(): CustomAssertions {
    if (!this.cache.has('assertions')) {
      this.cache.set('assertions', createAssertions(this.page));
    }
    return this.cache.get('assertions');
  }

  /**
   * Get Microsoft SSO helper (cached)
   */
  get auth(): MicrosoftSSOHelper {
    if (!this.cache.has('auth')) {
      this.cache.set('auth', createMicrosoftAuthHelper(this.page));
    }
    return this.cache.get('auth');
  }

  /**
   * Get User API client (cached)
   * Note: This doesn't need page, but included for convenience
   */
  get userApi(): UserApiClient {
    if (!this.cache.has('userApi')) {
      this.cache.set('userApi', new UserApiClient());
    }
    return this.cache.get('userApi');
  }

  /**
   * Add more service getters as needed:
   *
   * get logger(): Logger {
   *   if (!this.cache.has('logger')) {
   *     this.cache.set('logger', new Logger());
   *   }
   *   return this.cache.get('logger');
   * }
   *
   * get dataGenerator(): DataGenerator {
   *   if (!this.cache.has('dataGenerator')) {
   *     this.cache.set('dataGenerator', new DataGenerator());
   *   }
   *   return this.cache.get('dataGenerator');
   * }
   */

  /**
   * Generic method to get any service by key
   */
  public getService<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key);
  }

  /**
   * Set a service manually
   */
  public setService<T>(key: string, service: T): void {
    this.cache.set(key, service);
  }

  /**
   * Clear cache - useful for test isolation
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get all cached services
   */
  public getCachedServices(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if service is cached
   */
  public isCached(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * Factory function to create ServiceRegistry
 */
export function createServiceRegistry(page: Page): ServiceRegistry {
  return new ServiceRegistry(page);
}
