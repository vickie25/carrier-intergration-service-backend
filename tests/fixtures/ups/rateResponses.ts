import { UPSRateResponse, UPSErrorResponse } from '../../../src/carriers/ups/types';

/**
 * Mock successful rating response from UPS (single service)
 */
export const mockSingleRateResponse: UPSRateResponse = {
  RateResponse: {
    Response: {
      ResponseStatus: {
        Code: '1',
        Description: 'Success',
      },
      TransactionReference: {
        CustomerContext: 'Rate-1234567890',
      },
    },
    RatedShipment: {
      Service: {
        Code: '03',
        Description: 'UPS Ground',
      },
      TotalCharges: {
        CurrencyCode: 'USD',
        MonetaryValue: '45.67',
      },
      GuaranteedDelivery: {
        BusinessDaysInTransit: '3',
      },
      TimeInTransit: {
        PickupDate: '2024-02-06',
        ServiceSummary: {
          Service: {
            Description: 'UPS Ground',
          },
          EstimatedArrival: {
            Arrival: {
              Date: '2024-02-09',
              Time: '170000',
            },
            BusinessDaysInTransit: '3',
          },
        },
      },
    },
  },
};

/**
 * Mock successful rating response with multiple services
 */
export const mockMultipleRatesResponse: UPSRateResponse = {
  RateResponse: {
    Response: {
      ResponseStatus: {
        Code: '1',
        Description: 'Success',
      },
      TransactionReference: {
        CustomerContext: 'Rate-1234567890',
      },
    },
    RatedShipment: [
      {
        Service: {
          Code: '03',
          Description: 'UPS Ground',
        },
        TotalCharges: {
          CurrencyCode: 'USD',
          MonetaryValue: '45.67',
        },
        GuaranteedDelivery: {
          BusinessDaysInTransit: '3',
        },
      },
      {
        Service: {
          Code: '02',
          Description: 'UPS 2nd Day Air',
        },
        TotalCharges: {
          CurrencyCode: 'USD',
          MonetaryValue: '78.90',
        },
        GuaranteedDelivery: {
          BusinessDaysInTransit: '2',
        },
      },
      {
        Service: {
          Code: '01',
          Description: 'UPS Next Day Air',
        },
        TotalCharges: {
          CurrencyCode: 'USD',
          MonetaryValue: '125.50',
        },
        GuaranteedDelivery: {
          BusinessDaysInTransit: '1',
        },
      },
    ],
  },
};

/**
 * Mock error response - invalid address
 */
export const mockInvalidAddressError: UPSErrorResponse = {
  response: {
    errors: [
      {
        code: '9110208',
        message: 'The postal code is invalid for the specified city and state/province',
      },
    ],
  },
};

/**
 * Mock error response - authentication failure
 */
export const mockAuthError: UPSErrorResponse = {
  response: {
    errors: [
      {
        code: '250003',
        message: 'Invalid Access License number',
      },
    ],
  },
};

/**
 * Mock malformed response (missing required fields)
 */
export const mockMalformedResponse = {
  SomeRandomField: 'invalid',
};