import { AuthClient } from '../base/AuthClient';
/**
 * UPS OAuth 2.0 Authentication Client
 *
 * Implements the OAuth 2.0 client credentials flow for UPS API.
 * Handles token caching, expiration checking, and automatic refresh.
 */
export declare class UPSAuthClient extends AuthClient {
    private readonly clientId;
    private readonly clientSecret;
    private readonly authUrl;
    private readonly httpClient;
    private cachedToken;
    constructor(clientId?: string, clientSecret?: string, authUrl?: string);
    /**
     * Get a valid access token.
     * Returns cached token if valid, otherwise acquires a new one.
     */
    getAccessToken(): Promise<string>;
    /**
     * Force refresh the access token
     */
    refreshToken(): Promise<void>;
    /**
     * Clear the cached token
     */
    clearToken(): void;
    /**
     * Acquire a new access token from UPS
     */
    private acquireToken;
    /**
     * Check if a token is still valid
     */
    private isTokenValid;
}
//# sourceMappingURL=UPSAuthClient.d.ts.map