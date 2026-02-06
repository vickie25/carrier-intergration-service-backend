import { z } from 'zod';
import { ServiceLevel } from './models';

/**
 * Runtime validation schemas using Zod.
 * These ensure that data conforms to our domain models before processing.
 */

export const AddressSchema = z.object({
  streetLines: z.array(z.string().min(1)).min(1).max(3),
  city: z.string().min(1),
  stateOrProvince: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().length(2).toUpperCase(),
  residential: z.boolean().optional(),
});

export const PackageSchema = z.object({
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  dimensionUnit: z.enum(['IN', 'CM']),
  weight: z.number().positive(),
  weightUnit: z.enum(['LBS', 'KGS']),
});

export const ServiceLevelSchema = z.nativeEnum(ServiceLevel);

export const RateRequestSchema = z.object({
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z.array(PackageSchema).min(1),
  serviceLevel: ServiceLevelSchema.optional(),
  shipDate: z.date().optional(),
});

export const RateSchema = z.object({
  carrier: z.string(),
  service: z.string(),
  serviceLevel: ServiceLevelSchema,
  totalCharges: z.number().nonnegative(),
  currency: z.string().length(3),
  estimatedDeliveryDate: z.date().optional(),
  transitDays: z.number().int().nonnegative().optional(),
  deliveryGuarantee: z.boolean().optional(),
});

export const RateResponseSchema = z.object({
  rates: z.array(RateSchema),
  requestId: z.string().optional(),
});

/**
 * Type-safe validation helper
 */
export function validateRateRequest(data: unknown) {
  return RateRequestSchema.parse(data);
}