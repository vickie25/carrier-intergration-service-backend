import { RateRequest, ServiceLevel } from '../../../src/domain/models';

/**
 * Valid domestic rate request (US to US)
 */
export const validDomesticRequest: RateRequest = {
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
export const validRequestWithService: RateRequest = {
  ...validDomesticRequest,
  serviceLevel: ServiceLevel.NEXT_DAY,
};

/**
 * Valid request with multiple packages
 */
export const validMultiPackageRequest: RateRequest = {
  ...validDomesticRequest,
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
export const invalidRequest = {
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
export const invalidPackageRequest: RateRequest = {
  ...validDomesticRequest,
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