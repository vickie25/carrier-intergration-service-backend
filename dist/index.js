"use strict";
/**
 * Carrier Integration Service
 *
 * Main entry point for the shipping carrier integration service.
 * This module provides a clean, carrier-agnostic API for shipping operations.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrierType = exports.UPSCarrier = exports.AuthClient = exports.Carrier = void 0;
exports.createCarrier = createCarrier;
exports.getRatesFromMultipleCarriers = getRatesFromMultipleCarriers;
// Domain Models (public API)
__exportStar(require("./domain/models"), exports);
__exportStar(require("./domain/schemas"), exports);
// Errors (public API)
__exportStar(require("./errors/CarrierError"), exports);
// Base Abstractions (for extending with new carriers)
var Carrier_1 = require("./carriers/base/Carrier");
Object.defineProperty(exports, "Carrier", { enumerable: true, get: function () { return Carrier_1.Carrier; } });
var AuthClient_1 = require("./carriers/base/AuthClient");
Object.defineProperty(exports, "AuthClient", { enumerable: true, get: function () { return AuthClient_1.AuthClient; } });
// UPS Implementation
var UPSCarrier_1 = require("./carriers/ups/UPSCarrier");
Object.defineProperty(exports, "UPSCarrier", { enumerable: true, get: function () { return UPSCarrier_1.UPSCarrier; } });
const UPSCarrier_2 = require("./carriers/ups/UPSCarrier");
/**
 * Supported carrier types
 */
var CarrierType;
(function (CarrierType) {
    CarrierType["UPS"] = "UPS";
    // Future: FEDEX = 'FEDEX',
    // Future: USPS = 'USPS',
    // Future: DHL = 'DHL',
})(CarrierType || (exports.CarrierType = CarrierType = {}));
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
function createCarrier(type) {
    switch (type) {
        case CarrierType.UPS:
            return new UPSCarrier_2.UPSCarrier();
        default:
            throw new Error(`Unsupported carrier type: ${type}`);
    }
}
/**
 * Convenience method to get rates from multiple carriers
 *
 * @param request - Rate request
 * @param carriers - Array of carrier types to query
 * @returns Combined rates from all carriers
 */
async function getRatesFromMultipleCarriers(request, carriers) {
    const promises = carriers.map(async (carrierType) => {
        try {
            const carrier = createCarrier(carrierType);
            return await carrier.getRates(request);
        }
        catch (error) {
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
//# sourceMappingURL=index.js.map