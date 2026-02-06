"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPSCarrier = void 0;
const Carrier_1 = require("../base/Carrier");
const UPSAuthClient_1 = require("./UPSAuthClient");
const UPSRatingService_1 = require("./UPSRatingService");
/**
 * UPS Carrier Implementation
 *
 * This class ties together the UPS authentication and rating services,
 * implementing the Carrier interface. It serves as the main entry point
 * for all UPS operations.
 */
class UPSCarrier extends Carrier_1.Carrier {
    authClient;
    ratingService;
    constructor() {
        super();
        this.authClient = new UPSAuthClient_1.UPSAuthClient();
        this.ratingService = new UPSRatingService_1.UPSRatingService(this.authClient);
    }
    /**
     * Get carrier name
     */
    getName() {
        return 'UPS';
    }
    /**
     * Get shipping rates from UPS
     */
    async getRates(request) {
        return this.ratingService.getRates(request);
    }
}
exports.UPSCarrier = UPSCarrier;
//# sourceMappingURL=UPSCarrier.js.map