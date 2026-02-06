import { RateRequest, RateResponse } from '../../domain/models';
import { UPSAuthClient } from './UPSAuthClient';
/**
 * UPS Rating Service
 *
 * Handles rate shopping requests to the UPS Rating API.
 * Converts between our domain models and UPS-specific formats.
 */
export declare class UPSRatingService {
    private readonly authClient;
    private readonly httpClient;
    private readonly apiBaseUrl;
    constructor(authClient?: UPSAuthClient);
    /**
     * Get shipping rates from UPS
     */
    getRates(request: RateRequest): Promise<RateResponse>;
    /**
     * Build UPS Rating API request from our domain model
     */
    private buildUPSRequest;
    /**
     * Convert our Address to UPS Address format
     */
    private convertAddress;
    /**
     * Get UPS service code for a service level
     */
    private getServiceCode;
    /**
     * Make the rating request to UPS API
     */
    private makeRatingRequest;
    /**
     * Parse UPS response and convert to our domain model
     */
    private parseUPSResponse;
    /**
     * Convert UPS RatedShipment to our Rate model
     */
    private convertToRate;
}
//# sourceMappingURL=UPSRatingService.d.ts.map