import axios, { AxiosInstance } from 'axios';
import { RateRequest, RateResponse, Rate, ServiceLevel } from '../../domain/models';
import { validateRateRequest } from '../../domain/schemas';
import { UPSAuthClient } from './UPSAuthClient';
import {
  UPSRateRequest,
  UPSRateResponse,
  UPSRatedShipment,
  UPSErrorResponse,
  UPS_SERVICE_CODES,
  UPSServiceCode,
} from './types';
import {
  CarrierError,
  ValidationError,
  APIError,
  NetworkError,
  RateLimitError,
  ErrorCode,
} from '../../errors/CarrierError';
import { config } from '../../config/config';

/**
 * UPS Rating Service
 * 
 * Handles rate shopping requests to the UPS Rating API.
 * Converts between our domain models and UPS-specific formats.
 */
export class UPSRatingService {
  private readonly authClient: UPSAuthClient;
  private readonly httpClient: AxiosInstance;
  private readonly apiBaseUrl: string;

  constructor(authClient?: UPSAuthClient) {
    this.authClient = authClient || new UPSAuthClient();
    this.apiBaseUrl = config.ups.apiBaseUrl;

    this.httpClient = axios.create({
      timeout: config.requestTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get shipping rates from UPS
   */
  async getRates(request: RateRequest): Promise<RateResponse> {
    // Validate input
    try {
      validateRateRequest(request);
    } catch (error) {
      throw new ValidationError('Invalid rate request', {
        details: error,
        cause: error instanceof Error ? error : undefined,
      });
    }

    // Build UPS-specific request
    const upsRequest = this.buildUPSRequest(request);

    // Make API call with retry logic
    const upsResponse = await this.makeRatingRequest(upsRequest);

    // Parse and normalize response
    return this.parseUPSResponse(upsResponse);
  }

  /**
   * Build UPS Rating API request from our domain model
   */
  private buildUPSRequest(request: RateRequest): UPSRateRequest {
    const { origin, destination, packages, serviceLevel } = request;

    // Convert packages to UPS format
    const upsPackages = packages.map((pkg) => ({
      PackagingType: {
        Code: '02', // Customer Supplied Package
        Description: 'Package',
      },
      Dimensions: {
        UnitOfMeasurement: {
          Code: pkg.dimensionUnit,
          Description: pkg.dimensionUnit === 'IN' ? 'Inches' : 'Centimeters',
        },
        Length: pkg.length.toString(),
        Width: pkg.width.toString(),
        Height: pkg.height.toString(),
      },
      PackageWeight: {
        UnitOfMeasurement: {
          Code: pkg.weightUnit,
          Description: pkg.weightUnit === 'LBS' ? 'Pounds' : 'Kilograms',
        },
        Weight: pkg.weight.toString(),
      },
    }));

    const upsRequest: UPSRateRequest = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: `Rate-${Date.now()}`,
          },
        },
        Shipment: {
          Shipper: {
            Address: this.convertAddress(origin),
          },
          ShipTo: {
            Address: this.convertAddress(destination),
          },
          Package: upsPackages.length === 1 ? upsPackages[0] : upsPackages,
        },
      },
    };

    // If specific service level requested, add service code
    if (serviceLevel) {
      const serviceCode = this.getServiceCode(serviceLevel);
      if (serviceCode) {
        upsRequest.RateRequest.Shipment.Service = {
          Code: serviceCode,
        };
      }
    }

    return upsRequest;
  }

  /**
   * Convert our Address to UPS Address format
   */
  private convertAddress(address: any) {
    return {
      AddressLine: address.streetLines,
      City: address.city,
      StateProvinceCode: address.stateOrProvince,
      PostalCode: address.postalCode,
      CountryCode: address.countryCode,
      ...(address.residential && { ResidentialAddressIndicator: '' }),
    };
  }

  /**
   * Get UPS service code for a service level
   */
  private getServiceCode(serviceLevel: ServiceLevel): string | null {
    // Reverse lookup in UPS_SERVICE_CODES
    const entries = Object.entries(UPS_SERVICE_CODES);
    const match = entries.find(([_, level]) => level === serviceLevel);
    return match ? match[0] : null;
  }

  /**
   * Make the rating request to UPS API
   */
  private async makeRatingRequest(
    upsRequest: UPSRateRequest,
    retryCount = 0
  ): Promise<UPSRateResponse> {
    try {
      // Get access token
      const accessToken = await this.authClient.getAccessToken();

      // Make request
      const response = await this.httpClient.post<UPSRateResponse>(
        `${this.apiBaseUrl}/rating/v1/rate`,
        upsRequest,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        // Timeout
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new NetworkError('Request timed out', {
            carrier: 'UPS',
            cause: error,
          });
        }

        // HTTP errors
        if (error.response) {
          const statusCode = error.response.status;

          // Rate limiting
          if (statusCode === 429) {
            const retryAfter = error.response.headers['retry-after'];
            throw new RateLimitError(
              'Rate limit exceeded',
              retryAfter ? parseInt(retryAfter, 10) : undefined,
              {
                carrier: 'UPS',
                details: error.response.data,
              }
            );
          }

          // Authentication error - try to refresh token once
          if (statusCode === 401 && retryCount === 0) {
            await this.authClient.refreshToken();
            return this.makeRatingRequest(upsRequest, retryCount + 1);
          }

          // Parse UPS error response
          const errorData = error.response.data as UPSErrorResponse;
          const errorMessage = errorData?.response?.errors?.[0]?.message || 
                              'UPS API error';

          throw new APIError(errorMessage, statusCode, {
            carrier: 'UPS',
            details: errorData,
            cause: error,
          });
        }

        // Network error
        throw new NetworkError('Network error while fetching rates', {
          carrier: 'UPS',
          cause: error,
        });
      }

      // Unexpected error
      throw new CarrierError('Unexpected error during rating request', ErrorCode.UNEXPECTED_ERROR, {
        carrier: 'UPS',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Parse UPS response and convert to our domain model
   */
  private parseUPSResponse(upsResponse: UPSRateResponse): RateResponse {
    try {
      const ratedShipments = Array.isArray(upsResponse.RateResponse.RatedShipment)
        ? upsResponse.RateResponse.RatedShipment
        : [upsResponse.RateResponse.RatedShipment];

      const rates: Rate[] = ratedShipments.map((shipment) => 
        this.convertToRate(shipment)
      );

      if (rates.length === 0) {
        throw new CarrierError('No rates available', ErrorCode.NO_RATES_FOUND, {
          carrier: 'UPS',
        });
      }

      return {
        rates,
        requestId: upsResponse.RateResponse.Response.TransactionReference?.CustomerContext,
      };
    } catch (error) {
      if (error instanceof CarrierError) {
        throw error;
      }

      throw new CarrierError('Failed to parse UPS response', ErrorCode.INVALID_RESPONSE, {
        carrier: 'UPS',
        details: upsResponse,
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Convert UPS RatedShipment to our Rate model
   */
  private convertToRate(shipment: UPSRatedShipment): Rate {
    const serviceCode = shipment.Service.Code as UPSServiceCode;
    const serviceLevel = UPS_SERVICE_CODES[serviceCode] || ServiceLevel.GROUND;

    const rate: Rate = {
      carrier: 'UPS',
      service: shipment.Service.Description || `UPS ${serviceCode}`,
      serviceLevel: serviceLevel as ServiceLevel,
      totalCharges: parseFloat(shipment.TotalCharges.MonetaryValue),
      currency: shipment.TotalCharges.CurrencyCode,
    };

    // Add optional fields if available
    if (shipment.GuaranteedDelivery) {
      rate.transitDays = parseInt(shipment.GuaranteedDelivery.BusinessDaysInTransit, 10);
      rate.deliveryGuarantee = true;
    }

    if (shipment.TimeInTransit?.ServiceSummary?.EstimatedArrival?.Arrival) {
      const arrival = shipment.TimeInTransit.ServiceSummary.EstimatedArrival.Arrival;
      rate.estimatedDeliveryDate = new Date(arrival.Date);
    }

    return rate;
  }
}