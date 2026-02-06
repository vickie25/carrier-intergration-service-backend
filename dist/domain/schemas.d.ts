import { z } from 'zod';
import { ServiceLevel } from './models';
/**
 * Runtime validation schemas using Zod.
 * These ensure that data conforms to our domain models before processing.
 */
export declare const AddressSchema: z.ZodObject<{
    streetLines: z.ZodArray<z.ZodString, "many">;
    city: z.ZodString;
    stateOrProvince: z.ZodString;
    postalCode: z.ZodString;
    countryCode: z.ZodString;
    residential: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    streetLines: string[];
    city: string;
    stateOrProvince: string;
    postalCode: string;
    countryCode: string;
    residential?: boolean | undefined;
}, {
    streetLines: string[];
    city: string;
    stateOrProvince: string;
    postalCode: string;
    countryCode: string;
    residential?: boolean | undefined;
}>;
export declare const PackageSchema: z.ZodObject<{
    length: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
    dimensionUnit: z.ZodEnum<["IN", "CM"]>;
    weight: z.ZodNumber;
    weightUnit: z.ZodEnum<["LBS", "KGS"]>;
}, "strip", z.ZodTypeAny, {
    length: number;
    width: number;
    height: number;
    dimensionUnit: "IN" | "CM";
    weight: number;
    weightUnit: "LBS" | "KGS";
}, {
    length: number;
    width: number;
    height: number;
    dimensionUnit: "IN" | "CM";
    weight: number;
    weightUnit: "LBS" | "KGS";
}>;
export declare const ServiceLevelSchema: z.ZodNativeEnum<typeof ServiceLevel>;
export declare const RateRequestSchema: z.ZodObject<{
    origin: z.ZodObject<{
        streetLines: z.ZodArray<z.ZodString, "many">;
        city: z.ZodString;
        stateOrProvince: z.ZodString;
        postalCode: z.ZodString;
        countryCode: z.ZodString;
        residential: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    }, {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    }>;
    destination: z.ZodObject<{
        streetLines: z.ZodArray<z.ZodString, "many">;
        city: z.ZodString;
        stateOrProvince: z.ZodString;
        postalCode: z.ZodString;
        countryCode: z.ZodString;
        residential: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    }, {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    }>;
    packages: z.ZodArray<z.ZodObject<{
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        dimensionUnit: z.ZodEnum<["IN", "CM"]>;
        weight: z.ZodNumber;
        weightUnit: z.ZodEnum<["LBS", "KGS"]>;
    }, "strip", z.ZodTypeAny, {
        length: number;
        width: number;
        height: number;
        dimensionUnit: "IN" | "CM";
        weight: number;
        weightUnit: "LBS" | "KGS";
    }, {
        length: number;
        width: number;
        height: number;
        dimensionUnit: "IN" | "CM";
        weight: number;
        weightUnit: "LBS" | "KGS";
    }>, "many">;
    serviceLevel: z.ZodOptional<z.ZodNativeEnum<typeof ServiceLevel>>;
    shipDate: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    origin: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    destination: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    packages: {
        length: number;
        width: number;
        height: number;
        dimensionUnit: "IN" | "CM";
        weight: number;
        weightUnit: "LBS" | "KGS";
    }[];
    serviceLevel?: ServiceLevel | undefined;
    shipDate?: Date | undefined;
}, {
    origin: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    destination: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    packages: {
        length: number;
        width: number;
        height: number;
        dimensionUnit: "IN" | "CM";
        weight: number;
        weightUnit: "LBS" | "KGS";
    }[];
    serviceLevel?: ServiceLevel | undefined;
    shipDate?: Date | undefined;
}>;
export declare const RateSchema: z.ZodObject<{
    carrier: z.ZodString;
    service: z.ZodString;
    serviceLevel: z.ZodNativeEnum<typeof ServiceLevel>;
    totalCharges: z.ZodNumber;
    currency: z.ZodString;
    estimatedDeliveryDate: z.ZodOptional<z.ZodDate>;
    transitDays: z.ZodOptional<z.ZodNumber>;
    deliveryGuarantee: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    serviceLevel: ServiceLevel;
    carrier: string;
    service: string;
    totalCharges: number;
    currency: string;
    estimatedDeliveryDate?: Date | undefined;
    transitDays?: number | undefined;
    deliveryGuarantee?: boolean | undefined;
}, {
    serviceLevel: ServiceLevel;
    carrier: string;
    service: string;
    totalCharges: number;
    currency: string;
    estimatedDeliveryDate?: Date | undefined;
    transitDays?: number | undefined;
    deliveryGuarantee?: boolean | undefined;
}>;
export declare const RateResponseSchema: z.ZodObject<{
    rates: z.ZodArray<z.ZodObject<{
        carrier: z.ZodString;
        service: z.ZodString;
        serviceLevel: z.ZodNativeEnum<typeof ServiceLevel>;
        totalCharges: z.ZodNumber;
        currency: z.ZodString;
        estimatedDeliveryDate: z.ZodOptional<z.ZodDate>;
        transitDays: z.ZodOptional<z.ZodNumber>;
        deliveryGuarantee: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        serviceLevel: ServiceLevel;
        carrier: string;
        service: string;
        totalCharges: number;
        currency: string;
        estimatedDeliveryDate?: Date | undefined;
        transitDays?: number | undefined;
        deliveryGuarantee?: boolean | undefined;
    }, {
        serviceLevel: ServiceLevel;
        carrier: string;
        service: string;
        totalCharges: number;
        currency: string;
        estimatedDeliveryDate?: Date | undefined;
        transitDays?: number | undefined;
        deliveryGuarantee?: boolean | undefined;
    }>, "many">;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rates: {
        serviceLevel: ServiceLevel;
        carrier: string;
        service: string;
        totalCharges: number;
        currency: string;
        estimatedDeliveryDate?: Date | undefined;
        transitDays?: number | undefined;
        deliveryGuarantee?: boolean | undefined;
    }[];
    requestId?: string | undefined;
}, {
    rates: {
        serviceLevel: ServiceLevel;
        carrier: string;
        service: string;
        totalCharges: number;
        currency: string;
        estimatedDeliveryDate?: Date | undefined;
        transitDays?: number | undefined;
        deliveryGuarantee?: boolean | undefined;
    }[];
    requestId?: string | undefined;
}>;
/**
 * Type-safe validation helper
 */
export declare function validateRateRequest(data: unknown): {
    origin: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    destination: {
        streetLines: string[];
        city: string;
        stateOrProvince: string;
        postalCode: string;
        countryCode: string;
        residential?: boolean | undefined;
    };
    packages: {
        length: number;
        width: number;
        height: number;
        dimensionUnit: "IN" | "CM";
        weight: number;
        weightUnit: "LBS" | "KGS";
    }[];
    serviceLevel?: ServiceLevel | undefined;
    shipDate?: Date | undefined;
};
//# sourceMappingURL=schemas.d.ts.map