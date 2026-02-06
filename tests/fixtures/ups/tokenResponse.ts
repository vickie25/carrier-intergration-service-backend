import { UPSTokenResponse } from '../../../src/carriers/ups/types';

/**
 * Mock successful token response from UPS OAuth endpoint
 */
export const mockTokenResponse: UPSTokenResponse = {
  access_token: 'mock_access_token_12345',
  token_type: 'Bearer',
  expires_in: 3600, // 1 hour
  scope: 'rating',
};

/**
 * Mock expired token (for testing refresh logic)
 */
export const mockExpiredTokenResponse: UPSTokenResponse = {
  access_token: 'expired_token',
  token_type: 'Bearer',
  expires_in: -1, // Already expired
  scope: 'rating',
};