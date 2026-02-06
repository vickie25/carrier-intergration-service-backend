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
    countryCode: string;
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
export declare enum ServiceLevel {
    GROUND = "GROUND",
    TWO_DAY = "TWO_DAY",
    NEXT_DAY = "NEXT_DAY",
    NEXT_DAY_EARLY_AM = "NEXT_DAY_EARLY_AM",
    THREE_DAY = "THREE_DAY",
    INTERNATIONAL_STANDARD = "INTERNATIONAL_STANDARD",
    INTERNATIONAL_EXPEDITED = "INTERNATIONAL_EXPEDITED"
}
/**
 * Request to get shipping rates
 */
export interface RateRequest {
    origin: Address;
    destination: Address;
    packages: Package[];
    serviceLevel?: ServiceLevel;
    shipDate?: Date;
}
/**
 * A single rate quote from a carrier
 */
export interface Rate {
    carrier: string;
    service: string;
    serviceLevel: ServiceLevel;
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
    requestId?: string;
}
/**
 * Authentication token with metadata
 */
export interface AuthToken {
    accessToken: string;
    expiresAt: Date;
    tokenType: string;
}
//# sourceMappingURL=models.d.ts.map