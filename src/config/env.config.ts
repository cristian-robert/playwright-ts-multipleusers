import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment configuration interface
 */
export interface EnvConfig {
  baseUrl: string;
  apiBaseUrl: string;
  user1: {
    email: string;
    password: string;
  };
  user2: {
    email: string;
    password: string;
  };
  user3: {
    email: string;
    password: string;
  };
  api: {
    key: string;
    secret: string;
  };
  env: string;
  headless: boolean;
  slowMo: number;
  workers: number;
}

/**
 * Load and validate environment configuration
 */
class EnvironmentConfig {
  private config: EnvConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.BASE_URL || 'https://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'https://localhost:3001/api',
      user1: {
        email: process.env.USER1_EMAIL || '',
        password: process.env.USER1_PASSWORD || '',
      },
      user2: {
        email: process.env.USER2_EMAIL || '',
        password: process.env.USER2_PASSWORD || '',
      },
      user3: {
        email: process.env.USER3_EMAIL || '',
        password: process.env.USER3_PASSWORD || '',
      },
      api: {
        key: process.env.API_KEY || '',
        secret: process.env.API_SECRET || '',
      },
      env: process.env.ENV || 'dev',
      headless: process.env.HEADLESS === 'true',
      slowMo: parseInt(process.env.SLOW_MO || '0', 10),
      workers: parseInt(process.env.WORKERS || '4', 10),
    };

    this.validate();
  }

  /**
   * Validate required environment variables
   */
  private validate(): void {
    const requiredFields = [
      'baseUrl',
      'apiBaseUrl',
    ];

    const missing = requiredFields.filter(field => !this.config[field as keyof EnvConfig]);

    if (missing.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
      console.warn('Using default values. Create .env file for custom configuration.');
    }
  }

  /**
   * Get the complete configuration
   */
  public getConfig(): EnvConfig {
    return this.config;
  }

  /**
   * Get specific configuration value
   */
  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }
}

// Export singleton instance
export const envConfig = new EnvironmentConfig();
export const config = envConfig.getConfig();
