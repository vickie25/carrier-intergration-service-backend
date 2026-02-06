"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateResponseSchema = exports.RateSchema = exports.RateRequestSchema = exports.ServiceLevelSchema = exports.PackageSchema = exports.AddressSchema = void 0;
exports.validateRateRequest = validateRateRequest;
const zod_1 = require("zod");
const models_1 = require("./models");
/**
 * Runtime validation schemas using Zod.
 * These ensure that data conforms to our domain models before processing.
 */
exports.AddressSchema = zod_1.z.object({
    streetLines: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(3),
    city: zod_1.z.string().min(1),
    stateOrProvince: zod_1.z.string().min(1),
    postalCode: zod_1.z.string().min(1),
    countryCode: zod_1.z.string().length(2).toUpperCase(),
    residential: zod_1.z.boolean().optional(),
});
exports.PackageSchema = zod_1.z.object({
    length: zod_1.z.number().positive(),
    width: zod_1.z.number().positive(),
    height: zod_1.z.number().positive(),
    dimensionUnit: zod_1.z.enum(['IN', 'CM']),
    weight: zod_1.z.number().positive(),
    weightUnit: zod_1.z.enum(['LBS', 'KGS']),
});
exports.ServiceLevelSchema = zod_1.z.nativeEnum(models_1.ServiceLevel);
exports.RateRequestSchema = zod_1.z.object({
    origin: exports.AddressSchema,
    destination: exports.AddressSchema,
    packages: zod_1.z.array(exports.PackageSchema).min(1),
    serviceLevel: exports.ServiceLevelSchema.optional(),
    shipDate: zod_1.z.date().optional(),
});
exports.RateSchema = zod_1.z.object({
    carrier: zod_1.z.string(),
    service: zod_1.z.string(),
    serviceLevel: exports.ServiceLevelSchema,
    totalCharges: zod_1.z.number().nonnegative(),
    currency: zod_1.z.string().length(3),
    estimatedDeliveryDate: zod_1.z.date().optional(),
    transitDays: zod_1.z.number().int().nonnegative().optional(),
    deliveryGuarantee: zod_1.z.boolean().optional(),
});
exports.RateResponseSchema = zod_1.z.object({
    rates: zod_1.z.array(exports.RateSchema),
    requestId: zod_1.z.string().optional(),
});
/**
 * Type-safe validation helper
 */
function validateRateRequest(data) {
    return exports.RateRequestSchema.parse(data);
}
//# sourceMappingURL=schemas.js.map