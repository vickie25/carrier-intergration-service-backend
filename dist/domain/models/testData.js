"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidPackageRequest = exports.invalidRequest = exports.validMultiPackageRequest = exports.validRequestWithService = exports.validDomesticRequest = void 0;
const models_1 = require("../../../src/domain/models");
/**
 * Valid domestic rate request (US to US)
 */
exports.validDomesticRequest = {
    origin: {
        streetLines: ['123 Main St'],
        city: 'San Francisco',
        stateOrProvince: 'CA',
        postalCode: '94105',
        countryCode: 'US',
    },
    destination: {
        streetLines: ['456 Market St'],
        city: 'New York',
        stateOrProvince: 'NY',
        postalCode: '10001',
        countryCode: 'US',
    },
    packages: [
        {
            length: 12,
            width: 8,
            height: 6,
            dimensionUnit: 'IN',
            weight: 5,
            weightUnit: 'LBS',
        },
    ],
};
/**
 * Valid request with specific service level
 */
exports.validRequestWithService = {
    ...exports.validDomesticRequest,
    serviceLevel: models_1.ServiceLevel.NEXT_DAY,
};
/**
 * Valid request with multiple packages
 */
exports.validMultiPackageRequest = {
    ...exports.validDomesticRequest,
    packages: [
        {
            length: 12,
            width: 8,
            height: 6,
            dimensionUnit: 'IN',
            weight: 5,
            weightUnit: 'LBS',
        },
        {
            length: 10,
            width: 10,
            height: 10,
            dimensionUnit: 'IN',
            weight: 10,
            weightUnit: 'LBS',
        },
    ],
};
/**
 * Invalid request - missing required fields
 */
exports.invalidRequest = {
    origin: {
        city: 'San Francisco',
        // Missing required fields
    },
    destination: {
        city: 'New York',
    },
    packages: [],
};
/**
 * Invalid request - negative dimensions
 */
exports.invalidPackageRequest = {
    ...exports.validDomesticRequest,
    packages: [
        {
            length: -12,
            width: 8,
            height: 6,
            dimensionUnit: 'IN',
            weight: 5,
            weightUnit: 'LBS',
        },
    ],
};
//# sourceMappingURL=testData.js.map