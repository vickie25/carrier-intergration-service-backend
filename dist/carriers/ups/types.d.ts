/**
 * UPS-specific types based on the UPS Rating API documentation.
 * These types represent the exact structure of UPS API requests and responses.
 *
 * Reference: https://developer.ups.com/tag/Rating?loc=en_US
 */
/**
 * UPS OAuth Token Response
 */
export interface UPSTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
}
/**
 * UPS Rating API Request
 */
export interface UPSRateRequest {
    RateRequest: {
        Request: {
            TransactionReference?: {
                CustomerContext?: string;
            };
        };
        Shipment: {
            Shipper: {
                Name?: string;
                ShipperNumber?: string;
                Address: UPSAddress;
            };
            ShipTo: {
                Name?: string;
                Address: UPSAddress;
            };
            ShipFrom?: {
                Name?: string;
                Address: UPSAddress;
            };
            Service?: {
                Code: string;
                Description?: string;
            };
            Package: UPSPackage | UPSPackage[];
            ShipmentRatingOptions?: {
                NegotiatedRatesIndicator?: string;
            };
        };
    };
}
/**
 * UPS Address
 */
export interface UPSAddress {
    AddressLine?: string[];
    City: string;
    StateProvinceCode: string;
    PostalCode: string;
    CountryCode: string;
    ResidentialAddressIndicator?: string;
}
/**
 * UPS Package
 */
export interface UPSPackage {
    PackagingType: {
        Code: string;
        Description?: string;
    };
    Dimensions?: {
        UnitOfMeasurement: {
            Code: 'IN' | 'CM';
            Description?: string;
        };
        Length: string;
        Width: string;
        Height: string;
    };
    PackageWeight: {
        UnitOfMeasurement: {
            Code: 'LBS' | 'KGS';
            Description?: string;
        };
        Weight: string;
    };
}
/**
 * UPS Rating API Response
 */
export interface UPSRateResponse {
    RateResponse: {
        Response: {
            ResponseStatus: {
                Code: string;
                Description: string;
            };
            Alert?: Array<{
                Code: string;
                Description: string;
            }>;
            TransactionReference?: {
                CustomerContext?: string;
            };
        };
        RatedShipment: UPSRatedShipment | UPSRatedShipment[];
    };
}
/**
 * UPS Rated Shipment
 */
export interface UPSRatedShipment {
    Service: {
        Code: string;
        Description?: string;
    };
    RatedShipmentAlert?: Array<{
        Code: string;
        Description: string;
    }>;
    BillingWeight?: {
        UnitOfMeasurement: {
            Code: string;
        };
        Weight: string;
    };
    TransportationCharges?: {
        CurrencyCode: string;
        MonetaryValue: string;
    };
    ServiceOptionsCharges?: {
        CurrencyCode: string;
        MonetaryValue: string;
    };
    TotalCharges: {
        CurrencyCode: string;
        MonetaryValue: string;
    };
    GuaranteedDelivery?: {
        BusinessDaysInTransit: string;
        DeliveryByTime?: string;
    };
    RatedPackage?: Array<{
        Weight?: string;
    }>;
    TimeInTransit?: {
        PickupDate: string;
        DocumentsOnlyIndicator?: string;
        PackageBillType?: string;
        ServiceSummary: {
            Service: {
                Description: string;
            };
            EstimatedArrival: {
                Arrival: {
                    Date: string;
                    Time: string;
                };
                BusinessDaysInTransit: string;
            };
        };
    };
}
/**
 * UPS Error Response
 */
export interface UPSErrorResponse {
    response: {
        errors: Array<{
            code: string;
            message: string;
        }>;
    };
}
/**
 * UPS Service Code Mapping
 * Maps UPS service codes to our standardized ServiceLevel enum
 */
export declare const UPS_SERVICE_CODES: {
    readonly '03': "GROUND";
    readonly '02': "TWO_DAY";
    readonly '01': "NEXT_DAY";
    readonly '14': "NEXT_DAY_EARLY_AM";
    readonly '13': "NEXT_DAY";
    readonly '12': "THREE_DAY";
    readonly '11': "INTERNATIONAL_STANDARD";
    readonly '07': "INTERNATIONAL_EXPEDITED";
    readonly '08': "INTERNATIONAL_EXPEDITED";
    readonly '54': "INTERNATIONAL_EXPEDITED";
    readonly '65': "INTERNATIONAL_EXPEDITED";
};
export type UPSServiceCode = keyof typeof UPS_SERVICE_CODES;
//# sourceMappingURL=types.d.ts.map