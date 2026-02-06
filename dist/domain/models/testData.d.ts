import { RateRequest } from '../../../src/domain/models';
/**
 * Valid domestic rate request (US to US)
 */
export declare const validDomesticRequest: RateRequest;
/**
 * Valid request with specific service level
 */
export declare const validRequestWithService: RateRequest;
/**
 * Valid request with multiple packages
 */
export declare const validMultiPackageRequest: RateRequest;
/**
 * Invalid request - missing required fields
 */
export declare const invalidRequest: {
    origin: {
        city: string;
    };
    destination: {
        city: string;
    };
    packages: never[];
};
/**
 * Invalid request - negative dimensions
 */
export declare const invalidPackageRequest: RateRequest;
//# sourceMappingURL=testData.d.ts.map