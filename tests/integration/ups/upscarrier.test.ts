import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { UPSCarrier } from '../../../src/carriers/ups/UPSCarrier';
import { ServiceLevel } from '../../../src/domain/models';
import { mockTokenResponse } from '../../fixtures/ups/tokenResponse';
import { mockMultipleRatesResponse } from '../../fixtures/ups/rateResponses';
import { validDomesticRequest } from '../../fixtures/ups/testdata';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('UPSCarrier - End-to-End', () => {
  let carrier: UPSCarrier;
  let mockPost: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockPost = vi.fn();
    mockedAxios.create.mockReturnValue({
      post: mockPost,
    });

    carrier = new UPSCarrier();
  });

  describe('Complete Rate Shopping Flow', () => {
    it('should complete full flow: auth + rate request', async () => {
      // Mock auth token request
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });

      // Mock rating request
      mockPost.mockResolvedValueOnce({ data: mockMultipleRatesResponse });

      const response = await carrier.getRates(validDomesticRequest);

      // Verify auth was called
      expect(mockPost).toHaveBeenCalledTimes(2);

      // First call should be auth
      const authCall = mockPost.mock.calls[0];
      expect(authCall[0]).toContain('oauth/token');
      expect(authCall[1]).toBe('grant_type=client_credentials');

      // Second call should be rating
      const ratingCall = mockPost.mock.calls[1];
      expect(ratingCall[0]).toContain('rating');
      expect(ratingCall[2].headers.Authorization).toBe('Bearer mock_access_token_12345');

      // Verify response
      expect(response.rates).toHaveLength(3);
      expect(response.rates.map(r => r.serviceLevel)).toContain(ServiceLevel.GROUND);
      expect(response.rates.map(r => r.serviceLevel)).toContain(ServiceLevel.TWO_DAY);
      expect(response.rates.map(r => r.serviceLevel)).toContain(ServiceLevel.NEXT_DAY);
    });

    it('should reuse auth token across multiple rate requests', async () => {
      // Mock auth token request (once)
      mockPost.mockResolvedValueOnce({ data: mockTokenResponse });

      // Mock two rating requests
      mockPost.mockResolvedValueOnce({ data: mockMultipleRatesResponse });
      mockPost.mockResolvedValueOnce({ data: mockMultipleRatesResponse });

      // Make two rate requests
      await carrier.getRates(validDomesticRequest);
      await carrier.getRates(validDomesticRequest);

      // Auth should only be called once, rating twice
      expect(mockPost).toHaveBeenCalledTimes(3);

      // Verify first call was auth
      expect(mockPost.mock.calls[0][0]).toContain('oauth/token');

      // Verify next two were rating
      expect(mockPost.mock.calls[1][0]).toContain('rating');
      expect(mockPost.mock.calls[2][0]).toContain('rating');
    });
  });

  describe('getName', () => {
    it('should return carrier name', () => {
      expect(carrier.getName()).toBe('UPS');
    });
  });
});