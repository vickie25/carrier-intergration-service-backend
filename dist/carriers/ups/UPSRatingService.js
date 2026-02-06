"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPSRatingService = void 0;
const axios_1 = __importDefault(require("axios"));
const models_1 = require("../../domain/models");
const schemas_1 = require("../../domain/schemas");
const UPSAuthClient_1 = require("./UPSAuthClient");
const types_1 = require("./types");
const CarrierError_1 = require("../../errors/CarrierError");
const config_1 = require("../../config/config");
/**
 * UPS Rating Service
 *
 * Handles rate shopping requests to the UPS Rating API.
 * Converts between our domain models and UPS-specific formats.
 */
class UPSRatingService {
    authClient;
    httpClient;
    apiBaseUrl;
    constructor(authClient) {
        this.authClient = authClient || new UPSAuthClient_1.UPSAuthClient();
        this.apiBaseUrl = config_1.config.ups.apiBaseUrl;
        this.httpClient = axios_1.default.create({
            timeout: config_1.config.requestTimeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    /**
     * Get shipping rates from UPS
     */
    async getRates(request) {
        // Validate input
        try {
            (0, schemas_1.validateRateRequest)(request);
        }
        catch (error) {
            throw new CarrierError_1.ValidationError('Invalid rate request', {
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
    buildUPSRequest(request) {
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
        const upsRequest = {
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
    convertAddress(address) {
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
    getServiceCode(serviceLevel) {
        // Reverse lookup in UPS_SERVICE_CODES
        const entries = Object.entries(types_1.UPS_SERVICE_CODES);
        const match = entries.find(([_, level]) => level === serviceLevel);
        return match ? match[0] : null;
    }
    /**
     * Make the rating request to UPS API
     */
    async makeRatingRequest(upsRequest, retryCount = 0) {
        try {
            // Get access token
            const accessToken = await this.authClient.getAccessToken();
            // Make request
            const response = await this.httpClient.post(`${this.apiBaseUrl}/rating/v1/rate`, upsRequest, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            // Handle specific error cases
            if (axios_1.default.isAxiosError(error)) {
                // Timeout
                if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                    throw new CarrierError_1.NetworkError('Request timed out', {
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
                        throw new CarrierError_1.RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : undefined, {
                            carrier: 'UPS',
                            details: error.response.data,
                        });
                    }
                    // Authentication error - try to refresh token once
                    if (statusCode === 401 && retryCount === 0) {
                        await this.authClient.refreshToken();
                        return this.makeRatingRequest(upsRequest, retryCount + 1);
                    }
                    // Parse UPS error response
                    const errorData = error.response.data;
                    const errorMessage = errorData?.response?.errors?.[0]?.message ||
                        'UPS API error';
                    throw new CarrierError_1.APIError(errorMessage, statusCode, {
                        carrier: 'UPS',
                        details: errorData,
                        cause: error,
                    });
                }
                // Network error
                throw new CarrierError_1.NetworkError('Network error while fetching rates', {
                    carrier: 'UPS',
                    cause: error,
                });
            }
            // Unexpected error
            throw new CarrierError_1.CarrierError('Unexpected error during rating request', CarrierError_1.ErrorCode.UNEXPECTED_ERROR, {
                carrier: 'UPS',
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    /**
     * Parse UPS response and convert to our domain model
     */
    parseUPSResponse(upsResponse) {
        try {
            const ratedShipments = Array.isArray(upsResponse.RateResponse.RatedShipment)
                ? upsResponse.RateResponse.RatedShipment
                : [upsResponse.RateResponse.RatedShipment];
            const rates = ratedShipments.map((shipment) => this.convertToRate(shipment));
            if (rates.length === 0) {
                throw new CarrierError_1.CarrierError('No rates available', CarrierError_1.ErrorCode.NO_RATES_FOUND, {
                    carrier: 'UPS',
                });
            }
            return {
                rates,
                requestId: upsResponse.RateResponse.Response.TransactionReference?.CustomerContext,
            };
        }
        catch (error) {
            if (error instanceof CarrierError_1.CarrierError) {
                throw error;
            }
            throw new CarrierError_1.CarrierError('Failed to parse UPS response', CarrierError_1.ErrorCode.INVALID_RESPONSE, {
                carrier: 'UPS',
                details: upsResponse,
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    /**
     * Convert UPS RatedShipment to our Rate model
     */
    convertToRate(shipment) {
        const serviceCode = shipment.Service.Code;
        const serviceLevel = types_1.UPS_SERVICE_CODES[serviceCode] || models_1.ServiceLevel.GROUND;
        const rate = {
            carrier: 'UPS',
            service: shipment.Service.Description || `UPS ${serviceCode}`,
            serviceLevel: serviceLevel,
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
exports.UPSRatingService = UPSRatingService;
//# sourceMappingURL=UPSRatingService.js.map