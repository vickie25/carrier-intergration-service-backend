import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { UPSRatingService } from '../../../src/carriers/ups/UPSRatingService';
import { UPSAuthClient } from '../../../src/carriers/ups/UPSAuthClient';
import { ServiceLevel } from '../../../src/domain/models';
import {
  ValidationError,
  APIError,
  NetworkError,
  RateLimitError,
  CarrierError,
} from '../../../src/errors/CarrierError';
import {
  mockSingleRateResponse,
  mockMultipleRatesResponse,
  mockInvalidAddressError,
  mockMalformedResponse,
} from '../../fixtures/ups/rateResponses';
import {
  validDomesticRequest,
  validRequestWithService,
  validMultiPackageRequest,
  invalidRequest,
  invalidPackageRequest,
} from '../../fixtures/ups/testdata';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('UPSRatingService', () => {
  let ratingService: UPSRatingService;
  let mockAuthClient: UPSAuthClient;
  let mockPost: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock auth client
    mockAuthClient = {
      getAccessToken: vi.fn().mockResolvedValue('mock_token'),
      refreshToken: vi.fn().mockResolvedValue(undefined),
      clearToken: vi.fn(),
    } as any;

    // Mock axios
    mockPost = vi.fn();
    mockedAxios.create.mockReturnValue({
      post: mockPost,
    });

    // Mock axios.isAxiosError to check the isAxiosError property
    mockedAxios.isAxiosError = (error: any) => error?.isAxiosError === true;

    ratingService = new UPSRatingService(mockAuthClient);
  });

  describe('getRates', () => {
    it('should successfully get rates for valid request', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      const response = await ratingService.getRates(validDomesticRequest);

      expect(response.rates).toHaveLength(1);
      expect(response.rates[0]).toMatchObject({
        carrier: 'UPS',
        service: 'UPS Ground',
        serviceLevel: ServiceLevel.GROUND,
        totalCharges: 45.67,
        currency: 'USD',
        transitDays: 3,
        deliveryGuarantee: true,
      });
    });

    it('should handle multiple rate quotes', async () => {
      mockPost.mockResolvedValueOnce({ data: mockMultipleRatesResponse });

      const response = await ratingService.getRates(validDomesticRequest);

      expect(response.rates).toHaveLength(3);
      expect(response.rates[0].service).toBe('UPS Ground');
      expect(response.rates[1].service).toBe('UPS 2nd Day Air');
      expect(response.rates[2].service).toBe('UPS Next Day Air');

      // Verify prices are in ascending order (Ground < 2Day < NextDay)
      expect(response.rates[0].totalCharges).toBeLessThan(response.rates[1].totalCharges);
      expect(response.rates[1].totalCharges).toBeLessThan(response.rates[2].totalCharges);
    });

    it('should request specific service when service level provided', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      await ratingService.getRates(validRequestWithService);

      // Verify the request includes service code
      const requestBody = mockPost.mock.calls[0][1];
      expect(requestBody.RateRequest.Shipment.Service).toBeDefined();
      // Object.entries returns '13' (Next Day Air Saver) as first NEXT_DAY match
      expect(requestBody.RateRequest.Shipment.Service.Code).toBe('13');
    });

    it('should correctly build request for multiple packages', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      await ratingService.getRates(validMultiPackageRequest);

      const requestBody = mockPost.mock.calls[0][1];
      expect(Array.isArray(requestBody.RateRequest.Shipment.Package)).toBe(true);
      expect(requestBody.RateRequest.Shipment.Package).toHaveLength(2);
    });

    it('should include authorization header', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      await ratingService.getRates(validDomesticRequest);

      const headers = mockPost.mock.calls[0][2].headers;
      expect(headers.Authorization).toBe('Bearer mock_token');
    });

    it('should throw ValidationError for invalid request', async () => {
      await expect(
        ratingService.getRates(invalidRequest as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid package dimensions', async () => {
      await expect(
        ratingService.getRates(invalidPackageRequest)
      ).rejects.toThrow(ValidationError);
    });

    it('should throw APIError on 400 response', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 400,
          data: mockInvalidAddressError,
        },
      });

      await expect(
        ratingService.getRates(validDomesticRequest)
      ).rejects.toThrow(APIError);
    });

    it('should throw RateLimitError on 429 response', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 429,
          headers: {
            'retry-after': '60',
          },
          data: {
            response: {
              errors: [{ code: 'RATE_LIMIT', message: 'Too many requests' }],
            },
          },
        },
      });

      const error = await ratingService.getRates(validDomesticRequest).catch((e) => e);

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.retryAfter).toBe(60);
    });

    it('should retry with refreshed token on 401', async () => {
      // First call returns 401
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      });

      // Second call succeeds
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      const response = await ratingService.getRates(validDomesticRequest);

      expect(mockAuthClient.refreshToken).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(response.rates).toHaveLength(1);
    });

    it('should throw NetworkError on timeout', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ETIMEDOUT',
      });

      await expect(
        ratingService.getRates(validDomesticRequest)
      ).rejects.toThrow(NetworkError);
    });

    it('should throw NetworkError on connection error', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        code: 'ECONNREFUSED',
      });

      await expect(
        ratingService.getRates(validDomesticRequest)
      ).rejects.toThrow(NetworkError);
    });

    it('should throw CarrierError on malformed response', async () => {
      mockPost.mockResolvedValueOnce({ data: mockMalformedResponse });

      await expect(
        ratingService.getRates(validDomesticRequest)
      ).rejects.toThrow(CarrierError);
    });

    it('should throw CarrierError when no rates returned', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          RateResponse: {
            Response: {
              ResponseStatus: { Code: '1', Description: 'Success' },
            },
            RatedShipment: [],
          },
        },
      });

      const error = await ratingService.getRates(validDomesticRequest).catch((e) => e);

      expect(error).toBeInstanceOf(CarrierError);
      expect(error.code).toBe('NO_RATES_FOUND');
    });

    it('should handle APIError with status >= 500 as retryable', async () => {
      mockPost.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 503,
          data: { message: 'Service Unavailable' },
        },
      });

      const error = await ratingService.getRates(validDomesticRequest).catch((e) => e);

      expect(error).toBeInstanceOf(APIError);
      expect(error.retryable).toBe(true);
    });

    it('should parse estimated delivery date when available', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSingleRateResponse });

      const response = await ratingService.getRates(validDomesticRequest);

      expect(response.rates[0].estimatedDeliveryDate).toBeInstanceOf(Date);
      expect(response.rates[0].estimatedDeliveryDate?.toISOString()).toContain('2024-02-09');
    });
  });
});