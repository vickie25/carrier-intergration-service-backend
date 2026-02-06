/**
 * Carrier Integration Service
 * 
 * Main entry point for the shipping carrier integration service.
 * This module provides a clean, carrier-agnostic API for shipping operations.
 */

// Domain Models (public API)
export * from './domain/models';
export * from './domain/schemas';

// Errors (public API)
export * from './errors/CarrierError';

// Base Abstractions (for extending with new carriers)
export { Carrier } from './carriers/base/Carrier';
export { AuthClient } from './carriers/base/AuthClient';

// UPS Implementation
export { UPSCarrier } from './carriers/ups/UPSCarrier';

// Carrier Factory for easy instantiation
import { Carrier } from './carriers/base/Carrier';
import { UPSCarrier } from './carriers/ups/UPSCarrier';

/**
 * Supported carrier types
 */
export enum CarrierType {
  UPS = 'UPS',
  // Future: FEDEX = 'FEDEX',
  // Future: USPS = 'USPS',
  // Future: DHL = 'DHL',
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
export function createCarrier(type: CarrierType): Carrier {
  switch (type) {
    case CarrierType.UPS:
      return new UPSCarrier();
    default:
      throw new Error(`Unsupported carrier type: ${type}`);
  }
}

import { RateRequest, RateResponse } from './domain/models';

/**
 * Convenience method to get rates from multiple carriers
 * 
 * @param request - Rate request
 * @param carriers - Array of carrier types to query
 * @returns Combined rates from all carriers
 */
export async function getRatesFromMultipleCarriers(
  request: RateRequest,
  carriers: CarrierType[]
): Promise<RateResponse> {
  const promises = carriers.map(async (carrierType) => {
    try {
      const carrier = createCarrier(carrierType);
      return await carrier.getRates(request);
    } catch (error) {
      // Log error but don't fail entire request
      console.error(`Failed to get rates from ${carrierType}:`, error);
      return { rates: [] };
    }
  });

  const results = await Promise.all(promises);

  // Combine all rates
  const allRates = results.flatMap((result) => result.rates);

  return {
    rates: allRates,
  };
}