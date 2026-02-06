"use strict";
/**
 * UPS-specific types based on the UPS Rating API documentation.
 * These types represent the exact structure of UPS API requests and responses.
 *
 * Reference: https://developer.ups.com/tag/Rating?loc=en_US
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPS_SERVICE_CODES = void 0;
/**
 * UPS Service Code Mapping
 * Maps UPS service codes to our standardized ServiceLevel enum
 */
exports.UPS_SERVICE_CODES = {
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
};
//# sourceMappingURL=types.js.map