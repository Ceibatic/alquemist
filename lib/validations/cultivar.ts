/**
 * Cultivar Validation Schemas
 *
 * Zod schemas for cultivar management
 * Uses direct fields (not nested) matching the database schema
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

// Cannabis variety types
export const cannabisVarietyTypeSchema = z.enum(
  ['indica', 'sativa', 'hybrid', 'ruderalis'],
  {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de variedad' }),
  }
);

// Coffee variety types
export const coffeeVarietyTypeSchema = z.enum(
  ['arabica', 'robusta', 'liberica'],
  {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de variedad' }),
  }
);

// General variety type (string for flexibility)
export const varietyTypeSchema = z.string().optional();

export const cultivarStatusSchema = z.enum(['active', 'discontinued'], {
  errorMap: () => ({ message: 'Debes seleccionar un estado' }),
});

// ============================================================================
// BASE CULTIVAR SCHEMA (without refinements)
// ============================================================================

const baseCultivarSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim(),
  crop_type_id: z.string().min(1, 'Debes seleccionar un tipo de cultivo'),
  variety_type: varietyTypeSchema,
  genetic_lineage: z
    .string()
    .max(500, 'Linaje genético no puede exceder 500 caracteres')
    .optional(),
  supplier_id: z.string().optional(),

  // Direct fields (not nested in characteristics)
  flowering_time_days: z
    .number()
    .int('Tiempo de floración debe ser un número entero')
    .min(1, 'Tiempo de floración debe ser mayor a 0 días')
    .max(365, 'Tiempo de floración no puede exceder 365 días')
    .optional(),

  // Cannabis cannabinoid ranges
  thc_min: z
    .number()
    .min(0, 'THC mínimo debe ser mayor o igual a 0%')
    .max(100, 'THC mínimo debe ser menor o igual a 100%')
    .optional(),
  thc_max: z
    .number()
    .min(0, 'THC máximo debe ser mayor o igual a 0%')
    .max(100, 'THC máximo debe ser menor o igual a 100%')
    .optional(),
  cbd_min: z
    .number()
    .min(0, 'CBD mínimo debe ser mayor o igual a 0%')
    .max(100, 'CBD mínimo debe ser menor o igual a 100%')
    .optional(),
  cbd_max: z
    .number()
    .min(0, 'CBD máximo debe ser mayor o igual a 0%')
    .max(100, 'CBD máximo debe ser menor o igual a 100%')
    .optional(),

  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// Refinement function for cannabinoid validation
const cannabinoidRefinements = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: any) => {
        if (data.thc_min !== undefined && data.thc_max !== undefined) {
          return data.thc_min <= data.thc_max;
        }
        return true;
      },
      {
        message: 'THC mínimo debe ser menor o igual a THC máximo',
        path: ['thc_min'],
      }
    )
    .refine(
      (data: any) => {
        if (data.cbd_min !== undefined && data.cbd_max !== undefined) {
          return data.cbd_min <= data.cbd_max;
        }
        return true;
      },
      {
        message: 'CBD mínimo debe ser menor o igual a CBD máximo',
        path: ['cbd_min'],
      }
    );

// ============================================================================
// CREATE CULTIVAR SCHEMA
// ============================================================================

export const createCustomCultivarSchema = cannabinoidRefinements(baseCultivarSchema);

// ============================================================================
// UPDATE CULTIVAR SCHEMA
// ============================================================================

export const updateCultivarSchema = cannabinoidRefinements(
  baseCultivarSchema.partial().extend({
    status: cultivarStatusSchema.optional(),
  })
);

// ============================================================================
// CULTIVAR FILTER SCHEMA
// ============================================================================

export const cultivarFilterSchema = z.object({
  crop_type_id: z.string().optional(),
  variety_type: z.string().optional(),
  status: cultivarStatusSchema.optional(),
  supplier_id: z.string().optional(),
  search: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateCustomCultivarInput = z.infer<typeof createCustomCultivarSchema>;
export type UpdateCultivarInput = z.infer<typeof updateCultivarSchema>;
export type CultivarFilterInput = z.infer<typeof cultivarFilterSchema>;
export type CultivarStatus = z.infer<typeof cultivarStatusSchema>;
