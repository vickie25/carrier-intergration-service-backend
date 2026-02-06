import { RateRequest, RateResponse } from '../../domain/models';
/**
 * Abstract base class for all carrier integrations.
 *
 * Each carrier (UPS, FedEx, USPS, etc.) extends this class and implements
 * the required methods. This abstraction allows the application to work
 * with any carrier without knowing implementation details.
 */
export declare abstract class Carrier {
    /**
     * Get the carrier name (e.g., 'UPS', 'FedEx')
     */
    abstract getName(): string;
    /**
     * Get shipping rates for the given request.
     *
     * @param request - Rate request with origin, destination, and packages
     * @returns Promise resolving to normalized rate quotes
     * @throws CarrierError if the request fails
     */
    abstract getRates(request: RateRequest): Promise<RateResponse>;
}
//# sourceMappingURL=Carrier.d.ts.map