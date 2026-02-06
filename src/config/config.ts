import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Configuration object for managing environment variables.
 * Uses lazy loading via getters to avoid throwing at import time during tests.
 */
class Config {
  private _ups: {
    clientId: string;
    clientSecret: string;
    apiBaseUrl: string;
    authUrl: string;
  } | null = null;

  /**
   * UPS Configuration - lazily loaded
   */
  get ups() {
    if (!this._ups) {
      this._ups = {
        clientId: this.getRequired('UPS_CLIENT_ID'),
        clientSecret: this.getRequired('UPS_CLIENT_SECRET'),
        apiBaseUrl: this.get('UPS_API_BASE_URL', 'https://onlinetools.ups.com/api'),
        authUrl: this.get('UPS_AUTH_URL', 'https://onlinetools.ups.com/security/v1/oauth/token'),
      };
    }
    return this._ups;
  }

  // General Configuration
  public readonly nodeEnv = this.get('NODE_ENV', 'development');
  public readonly maxRetries = parseInt(this.get('MAX_RETRIES', '3'), 10);
  public readonly requestTimeout = parseInt(this.get('REQUEST_TIMEOUT_MS', '30000'), 10);

  /**
   * Get an environment variable or return default
   */
  private get(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Get a required environment variable or throw/fallback for tests
   */
  private getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      // In test environment, return a placeholder value
      if (this.nodeEnv === 'test') {
        return `test_${key.toLowerCase()}`;
      }
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Check if running in test environment
   */
  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

// Export singleton instance
export const config = new Config();