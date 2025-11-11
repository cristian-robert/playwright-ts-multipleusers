/**
 * Shared Type Definitions
 * Common types used across the framework
 */

/**
 * Test environment types
 */
export type Environment = 'dev' | 'staging' | 'prod' | 'local';

/**
 * Browser types
 */
export type BrowserType = 'chromium' | 'firefox' | 'webkit';

/**
 * Test data cleanup strategy
 */
export type CleanupStrategy = 'immediate' | 'afterEach' | 'afterAll' | 'manual';

/**
 * Retry strategy options
 */
export interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier?: number;
}

/**
 * Wait options
 */
export interface WaitOptions {
  timeout?: number;
  interval?: number;
  throwOnTimeout?: boolean;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

/**
 * Test metadata
 */
export interface TestMetadata {
  testId: string;
  testName: string;
  startTime: Date;
  endTime?: Date;
  status?: 'passed' | 'failed' | 'skipped';
  errorMessage?: string;
}

/**
 * User session
 */
export interface UserSession {
  userId: string;
  email: string;
  token?: string;
  expiresAt?: Date;
}

/**
 * Test context
 */
export interface TestContext {
  environment: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  metadata: TestMetadata;
}
