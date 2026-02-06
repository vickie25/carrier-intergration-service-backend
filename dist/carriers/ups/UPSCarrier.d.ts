import { Carrier } from '../base/Carrier';
import { RateRequest, RateResponse } from '../../domain/models';
/**
 * UPS Carrier Implementation
 *
 * This class ties together the UPS authentication and rating services,
 * implementing the Carrier interface. It serves as the main entry point
 * for all UPS operations.
 */
export declare class UPSCarrier extends Carrier {
    private readonly authClient;
    private readonly ratingService;
    constructor();
    /**
     * Get carrier name
     */
    getName(): string;
    /**
     * Get shipping rates from UPS
     */
    getRates(request: RateRequest): Promise<RateResponse>;
}
//# sourceMappingURL=UPSCarrier.d.ts.map