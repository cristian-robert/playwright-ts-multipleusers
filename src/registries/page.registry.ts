import { Page } from '@playwright/test';
import { HomePage } from '@pages/home.page';

/**
 * Page Registry
 * Centralized management of page object initialization
 * Provides lazy-loaded page objects with caching
 */
export class PageRegistry {
  private page: Page;
  private cache: Map<string, any> = new Map();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get HomePage instance (cached)
   */
  get home(): HomePage {
    if (!this.cache.has('home')) {
      this.cache.set('home', new HomePage(this.page));
    }
    return this.cache.get('home');
  }

  /**
   * Add more page getters as needed:
   *
   * get login(): LoginPage {
   *   if (!this.cache.has('login')) {
   *     this.cache.set('login', new LoginPage(this.page));
   *   }
   *   return this.cache.get('login');
   * }
   *
   * get dashboard(): DashboardPage {
   *   if (!this.cache.has('dashboard')) {
   *     this.cache.set('dashboard', new DashboardPage(this.page));
   *   }
   *   return this.cache.get('dashboard');
   * }
   */

  /**
   * Generic method to get any page by key
   * Useful for dynamic page access
   */
  public getPage<T>(key: string, factory: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key);
  }

  /**
   * Clear cache - useful for test isolation
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get all cached page objects
   */
  public getCachedPages(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if page is cached
   */
  public isCached(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * Factory function to create PageRegistry
 */
export function createPageRegistry(page: Page): PageRegistry {
  return new PageRegistry(page);
}
