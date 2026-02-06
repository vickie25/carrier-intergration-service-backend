import axios, { AxiosInstance } from 'axios';
import { AuthClient } from '../base/AuthClient';
import { AuthToken } from '../../domain/models';
import { AuthenticationError, NetworkError } from '../../errors/CarrierError';
import { UPSTokenResponse } from './types';
import { config } from '../../config/config';

/**
 * UPS OAuth 2.0 Authentication Client
 * 
 * Implements the OAuth 2.0 client credentials flow for UPS API.
 * Handles token caching, expiration checking, and automatic refresh.
 */
export class UPSAuthClient extends AuthClient {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authUrl: string;
  private readonly httpClient: AxiosInstance;
  
  private cachedToken: AuthToken | null = null;

  constructor(
    clientId: string = config.ups.clientId,
    clientSecret: string = config.ups.clientSecret,
    authUrl: string = config.ups.authUrl
  ) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authUrl = authUrl;

    this.httpClient = axios.create({
      timeout: config.requestTimeout,
    });
  }

  /**
   * Get a valid access token.
   * Returns cached token if valid, otherwise acquires a new one.
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.cachedToken && this.isTokenValid(this.cachedToken)) {
      return this.cachedToken.accessToken;
    }

    // Acquire new token
    await this.acquireToken();
    
    if (!this.cachedToken) {
      throw new AuthenticationError('Failed to acquire access token', {
        carrier: 'UPS',
      });
    }

    return this.cachedToken.accessToken;
  }

  /**
   * Force refresh the access token
   */
  async refreshToken(): Promise<void> {
    this.clearToken();
    await this.acquireToken();
  }

  /**
   * Clear the cached token
   */
  clearToken(): void {
    this.cachedToken = null;
  }

  /**
   * Acquire a new access token from UPS
   */
  private async acquireToken(): Promise<void> {
    try {
      // UPS uses Basic Auth with client credentials
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await this.httpClient.post<UPSTokenResponse>(
        this.authUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      const tokenData = response.data;

      // Calculate expiration time (with 5 minute buffer for safety)
      const expiresInMs = (tokenData.expires_in - 300) * 1000;
      const expiresAt = new Date(Date.now() + expiresInMs);

      this.cachedToken = {
        accessToken: tokenData.access_token,
        tokenType: tokenData.token_type,
        expiresAt,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new NetworkError('Token request timed out', {
            carrier: 'UPS',
            cause: error,
          });
        }

        if (error.response) {
          const statusCode = error.response.status;
          const message = error.response.data?.error_description || 
                         error.response.data?.message || 
                         'Authentication failed';

          throw new AuthenticationError(message, {
            carrier: 'UPS',
            statusCode,
            details: error.response.data,
            cause: error,
          });
        }

        throw new NetworkError('Network error during authentication', {
          carrier: 'UPS',
          cause: error,
        });
      }

      throw new AuthenticationError('Unexpected error during authentication', {
        carrier: 'UPS',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Check if a token is still valid
   */
  private isTokenValid(token: AuthToken): boolean {
    // Add 1 minute buffer to avoid using tokens that are about to expire
    const bufferMs = 60 * 1000;
    return token.expiresAt.getTime() > Date.now() + bufferMs;
  }
}