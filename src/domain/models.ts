/**
 * Domain models representing shipping concepts in a carrier-agnostic way.
 * These types form the boundary between our application and external carrier APIs.
 */

/**
 * Address for shipping origin or destination
 */
export interface Address {
  streetLines: string[];
  city: string;
  stateOrProvince: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2
  residential?: boolean;
}

/**
 * Package dimensions and weight
 */
export interface Package {
  length: number;
  width: number;
  height: number;
  dimensionUnit: 'IN' | 'CM';
  weight: number;
  weightUnit: 'LBS' | 'KGS';
}

/**
 * Service level options (standardized across carriers)
 */
export enum ServiceLevel {
  GROUND = 'GROUND',
  TWO_DAY = 'TWO_DAY',
  NEXT_DAY = 'NEXT_DAY',
  NEXT_DAY_EARLY_AM = 'NEXT_DAY_EARLY_AM',
  THREE_DAY = 'THREE_DAY',
  INTERNATIONAL_STANDARD = 'INTERNATIONAL_STANDARD',
  INTERNATIONAL_EXPEDITED = 'INTERNATIONAL_EXPEDITED',
}

/**
 * Request to get shipping rates
 */
export interface RateRequest {
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel?: ServiceLevel; // If omitted, return all available services
  shipDate?: Date; // Defaults to today
}

/**
 * A single rate quote from a carrier
 */
export interface Rate {
  carrier: string; // e.g., 'UPS', 'FedEx'
  service: string; // Carrier-specific service name
  serviceLevel: ServiceLevel; // Our standardized service level
  totalCharges: number;
  currency: string;
  estimatedDeliveryDate?: Date;
  transitDays?: number;
  deliveryGuarantee?: boolean;
}

/**
 * Response containing one or more rate quotes
 */
export interface RateResponse {
  rates: Rate[];
  requestId?: string; // For tracking/debugging
}

/**
 * Authentication token with metadata
 */
export interface AuthToken {
  accessToken: string;
  expiresAt: Date;
  tokenType: string;
}