/**
 * Configuration object for managing environment variables.
 * Uses lazy loading via getters to avoid throwing at import time during tests.
 */
declare class Config {
    private _ups;
    /**
     * UPS Configuration - lazily loaded
     */
    get ups(): {
        clientId: string;
        clientSecret: string;
        apiBaseUrl: string;
        authUrl: string;
    };
    readonly nodeEnv: string;
    readonly maxRetries: number;
    readonly requestTimeout: number;
    /**
     * Get an environment variable or return default
     */
    private get;
    /**
     * Get a required environment variable or throw/fallback for tests
     */
    private getRequired;
    /**
     * Check if running in production
     */
    isProduction(): boolean;
    /**
     * Check if running in test environment
     */
    isTest(): boolean;
}
export declare const config: Config;
export {};
//# sourceMappingURL=config.d.ts.map