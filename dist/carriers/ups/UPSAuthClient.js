"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPSAuthClient = void 0;
const axios_1 = __importDefault(require("axios"));
const AuthClient_1 = require("../base/AuthClient");
const CarrierError_1 = require("../../errors/CarrierError");
const config_1 = require("../../config/config");
/**
 * UPS OAuth 2.0 Authentication Client
 *
 * Implements the OAuth 2.0 client credentials flow for UPS API.
 * Handles token caching, expiration checking, and automatic refresh.
 */
class UPSAuthClient extends AuthClient_1.AuthClient {
    clientId;
    clientSecret;
    authUrl;
    httpClient;
    cachedToken = null;
    constructor(clientId = config_1.config.ups.clientId, clientSecret = config_1.config.ups.clientSecret, authUrl = config_1.config.ups.authUrl) {
        super();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.authUrl = authUrl;
        this.httpClient = axios_1.default.create({
            timeout: config_1.config.requestTimeout,
        });
    }
    /**
     * Get a valid access token.
     * Returns cached token if valid, otherwise acquires a new one.
     */
    async getAccessToken() {
        // Check if we have a valid cached token
        if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
            return this.cachedToken.accessToken;
        }
        // Acquire new token
        await this.acquireToken();
        if (!this.cachedToken) {
            throw new CarrierError_1.AuthenticationError('Failed to acquire access token', {
                carrier: 'UPS',
            });
        }
        return this.cachedToken.accessToken;
    }
    /**
     * Force refresh the access token
     */
    async refreshToken() {
        this.clearToken();
        await this.acquireToken();
    }
    /**
     * Clear the cached token
     */
    clearToken() {
        this.cachedToken = null;
    }
    /**
     * Acquire a new access token from UPS
     */
    async acquireToken() {
        try {
            // UPS uses Basic Auth with client credentials
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await this.httpClient.post(this.authUrl, 'grant_type=client_credentials', {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${auth}`,
                },
            });
            const tokenData = response.data;
            // Calculate expiration time (with 5 minute buffer for safety)
            const expiresInMs = (tokenData.expires_in - 300) * 1000;
            const expiresAt = new Date(Date.now() + expiresInMs);
            this.cachedToken = {
                accessToken: tokenData.access_token,
                tokenType: tokenData.token_type,
                expiresAt,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                    throw new CarrierError_1.NetworkError('Token request timed out', {
                        carrier: 'UPS',
                        cause: error,
                    });
                }
                if (error.response) {
                    const statusCode = error.response.status;
                    const message = error.response.data?.error_description ||
                        error.response.data?.message ||
                        'Authentication failed';
                    throw new CarrierError_1.AuthenticationError(message, {
                        carrier: 'UPS',
                        statusCode,
                        details: error.response.data,
                        cause: error,
                    });
                }
                throw new CarrierError_1.NetworkError('Network error during authentication', {
                    carrier: 'UPS',
                    cause: error,
                });
            }
            throw new CarrierError_1.AuthenticationError('Unexpected error during authentication', {
                carrier: 'UPS',
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    /**
     * Check if a token is still valid
     */
    isTokenValid(token) {
        // Add 1 minute buffer to avoid using tokens that are about to expire
        const bufferMs = 60 * 1000;
        return token.expiresAt.getTime() > Date.now() + bufferMs;
    }
}
exports.UPSAuthClient = UPSAuthClient;
//# sourceMappingURL=UPSAuthClient.js.map