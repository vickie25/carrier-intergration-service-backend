/**
 * Abstract base class for carrier authentication.
 *
 * Handles OAuth 2.0 token lifecycle: acquisition, caching, and refresh.
 * Implementations are carrier-specific but the interface is consistent.
 */
export declare abstract class AuthClient {
    /**
     * Get a valid access token.
     *
     * This method handles token caching and automatic refresh:
     * - Returns cached token if still valid
     * - Refreshes token if expired
     * - Acquires new token if none exists
     *
     * @returns Promise resolving to a valid access token
     * @throws AuthenticationError if token acquisition fails
     */
    abstract getAccessToken(): Promise<string>;
    /**
     * Force refresh the access token.
     *
     * Useful for handling 401 responses where the cached token
     * might have been revoked.
     *
     * @returns Promise that resolves when token is refreshed
     * @throws AuthenticationError if refresh fails
     */
    abstract refreshToken(): Promise<void>;
    /**
     * Clear cached token.
     * Useful for logout or when credentials change.
     */
    abstract clearToken(): void;
}
//# sourceMappingURL=AuthClient.d.ts.map