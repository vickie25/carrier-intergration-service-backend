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
  expires_in: number; // seconds
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
export const UPS_SERVICE_CODES = {
  // Domestic
  '03': 'GROUND', // UPS Ground
  '02': 'TWO_DAY', // UPS 2nd Day Air
  '01': 'NEXT_DAY', // UPS Next Day Air
  '14': 'NEXT_DAY_EARLY_AM', // UPS Next Day Air Early
  '13': 'NEXT_DAY', // UPS Next Day Air Saver
  '12': 'THREE_DAY', // UPS 3 Day Select
  
  // International
  '11': 'INTERNATIONAL_STANDARD', // UPS Standard
  '07': 'INTERNATIONAL_EXPEDITED', // UPS Worldwide Express
  '08': 'INTERNATIONAL_EXPEDITED', // UPS Worldwide Expedited
  '54': 'INTERNATIONAL_EXPEDITED', // UPS Worldwide Express Plus
  '65': 'INTERNATIONAL_EXPEDITED', // UPS Worldwide Saver
} as const;

export type UPSServiceCode = keyof typeof UPS_SERVICE_CODES;