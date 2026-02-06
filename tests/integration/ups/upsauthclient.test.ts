import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { UPSAuthClient } from '../../../src/carriers/ups/UPSAuthClient';
import { AuthenticationError, NetworkError } from '../../../src/errors/CarrierError';
import { mockTokenResponse, mockExpiredTokenResponse } from '../../fixtures/ups/tokenResponse';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('UPSAuthClient', () => {
  let authClient: UPSAuthClient;
  let mockPost: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock post function
    mockPost = vi.fn();
    mockedAxios.create.mockReturnValue({
      post: mockPost,
    });

    // Mock axios.isAxiosError to check the isAxiosError property
    mockedAxios.isAxiosError = (error: any) => error?.isAxiosError === true;

    // Create auth client with test credentials
    authClient = new UPSAuthClient('test_client_id', 'test_client_secret', 'https://test.ups.com/oauth/token');
  });

  describe('getAccessToken', () => {
    it('should acquire and return a valid access token', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });

      const token = await authClient.getAccessToken();

      expect(token).toBe('mock_access_token_12345');
      expect(mockPost).toHaveBeenCalledTimes(1);

      // Verify request format
      const call = mockPost.mock.calls[0];
      expect(call[0]).toBe('https://test.ups.com/oauth/token');
      expect(call[1]).toBe('grant_type=client_credentials');
      expect(call[2].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(call[2].headers['Authorization']).toContain('Basic');
    });

    it('should reuse cached token if still valid', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });

      // First call - should acquire token
      const token1 = await authClient.getAccessToken();

      // Second call - should use cached token
      const token2 = await authClient.getAccessToken();

      expect(token1).toBe(token2);
      expect(mockPost).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should refresh token when expired', async () => {
      // First return expired token
      mockPost.mockResolvedValueOnce({ data: mockExpiredTokenResponse });
      await authClient.getAccessToken();

      // Clear token to simulate expiration
      authClient.clearToken();

      // Next call should acquire new token
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });
      const token = await authClient.getAccessToken();

      expect(token).toBe('mock_access_token_12345');
      expect(mockPost).toHaveBeenCalledTimes(2);
    });

    it('should throw AuthenticationError on 401', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: {
            error_description: 'Invalid credentials',
          },
        },
      });

      await expect(authClient.getAccessToken()).rejects.toThrow(AuthenticationError);
    });

    it('should throw NetworkError on timeout', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ETIMEDOUT',
      });

      await expect(authClient.getAccessToken()).rejects.toThrow(NetworkError);
    });

    it('should throw NetworkError on connection error', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ECONNREFUSED',
      });

      await expect(authClient.getAccessToken()).rejects.toThrow(NetworkError);
    });
  });

  describe('refreshToken', () => {
    it('should clear cached token and acquire new one', async () => {
      // First acquire a token
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });
      await authClient.getAccessToken();

      // Now refresh
      mockPost.mockResolvedValueOnce({
        data: {
          ...mockTokenResponse,
          access_token: 'new_token_67890'
        }
      });
      await authClient.refreshToken();

      // Get token again - should return new one
      const token = await authClient.getAccessToken();
      expect(token).toBe('new_token_67890');
    });
  });

  describe('clearToken', () => {
    it('should clear cached token', async () => {
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });
      await authClient.getAccessToken();

      authClient.clearToken();

      // Next call should acquire new token
      mockPost.mockResolvedValueOnce({
        data: {
          ...mockTokenResponse,
          access_token: 'another_token'
        }
      });
      const token = await authClient.getAccessToken();

      expect(token).toBe('another_token');
      expect(mockPost).toHaveBeenCalledTimes(2);
    });
  });
});