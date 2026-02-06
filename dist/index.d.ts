/**
 * Carrier Integration Service
 *
 * Main entry point for the shipping carrier integration service.
 * This module provides a clean, carrier-agnostic API for shipping operations.
 */
export * from './domain/models';
export * from './domain/schemas';
export * from './errors/CarrierError';
export { Carrier } from './carriers/base/Carrier';
export { AuthClient } from './carriers/base/AuthClient';
export { UPSCarrier } from './carriers/ups/UPSCarrier';
import { Carrier } from './carriers/base/Carrier';
/**
 * Supported carrier types
 */
export declare enum CarrierType {
    UPS = "UPS"
}
/**
 * Factory function to create carrier instances
 *
 * @param type - The carrier type to instantiate
 * @returns A carrier instance
 *
 * @example
 * ```typescript
 * const ups = createCarrier(CarrierType.UPS);
 * const rates = await ups.getRates(request);
 * ```
 */
export declare function createCarrier(type: CarrierType): Carrier;
import { RateRequest, RateResponse } from './domain/models';
/**
 * Convenience method to get rates from multiple carriers
 *
 * @param request - Rate request
 * @param carriers - Array of carrier types to query
 * @returns Combined rates from all carriers
 */
export declare function getRatesFromMultipleCarriers(request: RateRequest, carriers: CarrierType[]): Promise<RateResponse>;
//# sourceMappingURL=index.d.ts.map