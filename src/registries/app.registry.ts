import { Page } from '@playwright/test';
import { PageRegistry, createPageRegistry } from './page.registry';
import { ServiceRegistry, createServiceRegistry } from './service.registry';

/**
 * Application Registry
 * Combines page and service registries for convenient access
 * This is the main registry you'll use in tests
 */
export class AppRegistry {
  public pages: PageRegistry;
  public services: ServiceRegistry;
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.pages = createPageRegistry(page);
    this.services = createServiceRegistry(page);
  }

  /**
   * Get the underlying page instance
   */
  public getPage(): Page {
    return this.page;
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.pages.clearCache();
    this.services.clearCache();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    pages: string[];
    services: string[];
    total: number;
  } {
    const pages = this.pages.getCachedPages();
    const services = this.services.getCachedServices();

    return {
      pages,
      services,
      total: pages.length + services.length,
    };
  }
}

/**
 * Factory function to create AppRegistry
 */
export function createAppRegistry(page: Page): AppRegistry {
  return new AppRegistry(page);
}

/**
 * Multi-User Registry
 * Convenience wrapper for multi-user scenarios (up to 3 users)
 */
export class MultiUserRegistry {
  public user1: AppRegistry;
  public user2: AppRegistry;
  public user3: AppRegistry;

  constructor(user1Page: Page, user2Page: Page, user3Page: Page) {
    this.user1 = createAppRegistry(user1Page);
    this.user2 = createAppRegistry(user2Page);
    this.user3 = createAppRegistry(user3Page);
  }

  /**
   * Clear all caches for all users
   */
  public clearAll(): void {
    this.user1.clearAll();
    this.user2.clearAll();
    this.user3.clearAll();
  }

  /**
   * Get combined cache statistics
   */
  public getCacheStats() {
    return {
      user1: this.user1.getCacheStats(),
      user2: this.user2.getCacheStats(),
      user3: this.user3.getCacheStats(),
    };
  }
}

/**
 * Factory function to create MultiUserRegistry
 */
export function createMultiUserRegistry(
  user1Page: Page,
  user2Page: Page,
  user3Page: Page
): MultiUserRegistry {
  return new MultiUserRegistry(user1Page, user2Page, user3Page);
}
