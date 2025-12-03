/**
 * Cultivar Validation Schemas
 *
 * Zod schemas for cultivar management in Phase 2
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

export const growthDifficultySchema = z.enum(['easy', 'medium', 'difficult'], {
  errorMap: () => ({ message: 'Debes seleccionar un nivel de dificultad' }),
});

// ============================================================================
// CHARACTERISTICS SCHEMA
// ============================================================================

export const cultivarCharacteristicsSchema = z.object({
  // Cannabis specific - THC/CBD percentages
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
  terpene_profile: z
    .array(z.string())
    .max(20, 'No puedes agregar más de 20 terpenos')
    .optional(),

  // General characteristics
  flowering_time_days: z
    .number()
    .int('Tiempo de floración debe ser un número entero')
    .min(1, 'Tiempo de floración debe ser mayor a 0 días')
    .max(365, 'Tiempo de floración no puede exceder 365 días')
    .optional(),
  yield_per_plant_g: z
    .number()
    .positive('Rendimiento por planta debe ser un número positivo')
    .max(10000, 'Rendimiento por planta no puede exceder 10,000g')
    .optional(),
  height_cm: z
    .number()
    .positive('Altura debe ser un número positivo')
    .max(1000, 'Altura no puede exceder 1000 cm')
    .optional(),
  growth_difficulty: growthDifficultySchema.optional(),

  // Sensory
  aroma: z
    .string()
    .max(200, 'Aroma no puede exceder 200 caracteres')
    .optional(),
  flavor: z
    .string()
    .max(200, 'Sabor no puede exceder 200 caracteres')
    .optional(),
  effects: z
    .array(z.string())
    .max(20, 'No puedes agregar más de 20 efectos')
    .optional(),
}).refine(
  (data) => {
    if (data.thc_min !== undefined && data.thc_max !== undefined) {
      return data.thc_min <= data.thc_max;
    }
    return true;
  },
  {
    message: 'THC mínimo debe ser menor o igual a THC máximo',
    path: ['thc_min'],
  }
).refine(
  (data) => {
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
// OPTIMAL CONDITIONS SCHEMA
// ============================================================================

export const optimalConditionsSchema = z.object({
  temperature_min: z
    .number()
    .min(-10, 'Temperatura mínima debe ser mayor a -10°C')
    .max(50, 'Temperatura mínima debe ser menor a 50°C')
    .optional(),
  temperature_max: z
    .number()
    .min(-10, 'Temperatura máxima debe ser mayor a -10°C')
    .max(50, 'Temperatura máxima debe ser menor a 50°C')
    .optional(),
  humidity_min: z
    .number()
    .min(0, 'Humedad mínima debe ser mayor o igual a 0%')
    .max(100, 'Humedad mínima debe ser menor o igual a 100%')
    .optional(),
  humidity_max: z
    .number()
    .min(0, 'Humedad máxima debe ser mayor o igual a 0%')
    .max(100, 'Humedad máxima debe ser menor o igual a 100%')
    .optional(),
  ph_min: z
    .number()
    .min(0, 'pH mínimo debe ser mayor o igual a 0')
    .max(14, 'pH mínimo debe ser menor o igual a 14')
    .optional(),
  ph_max: z
    .number()
    .min(0, 'pH máximo debe ser mayor o igual a 0')
    .max(14, 'pH máximo debe ser menor o igual a 14')
    .optional(),
  light_type: z
    .string()
    .max(100, 'Tipo de luz no puede exceder 100 caracteres')
    .optional(),
  light_hours: z
    .number()
    .min(0, 'Horas de luz deben ser mayor o igual a 0')
    .max(24, 'Horas de luz deben ser menor o igual a 24')
    .optional(),
}).refine(
  (data) => {
    if (data.temperature_min !== undefined && data.temperature_max !== undefined) {
      return data.temperature_min <= data.temperature_max;
    }
    return true;
  },
  {
    message: 'Temperatura mínima debe ser menor o igual a temperatura máxima',
    path: ['temperature_min'],
  }
).refine(
  (data) => {
    if (data.humidity_min !== undefined && data.humidity_max !== undefined) {
      return data.humidity_min <= data.humidity_max;
    }
    return true;
  },
  {
    message: 'Humedad mínima debe ser menor o igual a humedad máxima',
    path: ['humidity_min'],
  }
).refine(
  (data) => {
    if (data.ph_min !== undefined && data.ph_max !== undefined) {
      return data.ph_min <= data.ph_max;
    }
    return true;
  },
  {
    message: 'pH mínimo debe ser menor o igual a pH máximo',
    path: ['ph_min'],
  }
);

// ============================================================================
// ORIGIN METADATA SCHEMA
// ============================================================================

export const originMetadataSchema = z.object({
  breeder: z
    .string()
    .max(200, 'Criador no puede exceder 200 caracteres')
    .optional(),
  origin_country: z
    .string()
    .length(2, 'Código de país debe tener 2 caracteres (ISO)')
    .optional(),
  year_developed: z
    .number()
    .int('Año debe ser un número entero')
    .min(1900, 'Año debe ser mayor a 1900')
    .max(new Date().getFullYear(), `Año no puede ser mayor a ${new Date().getFullYear()}`)
    .optional(),
  awards: z
    .array(z.string().max(200))
    .max(50, 'No puedes agregar más de 50 premios')
    .optional(),
});

// ============================================================================
// CREATE CULTIVAR SCHEMA (CUSTOM)
// ============================================================================

export const createCustomCultivarSchema = z.object({
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
  origin_metadata: originMetadataSchema.optional(),
  characteristics: cultivarCharacteristicsSchema.optional(),
  optimal_conditions: optimalConditionsSchema.optional(),
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// LINK SYSTEM CULTIVAR SCHEMA
// ============================================================================

export const linkSystemCultivarSchema = z.object({
  system_cultivar_id: z.string().min(1, 'Debes seleccionar un cultivar del sistema'),
  crop_type_id: z.string().min(1, 'Debes seleccionar un tipo de cultivo'),
  supplier_id: z.string().optional(),
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// UPDATE CULTIVAR SCHEMA
// ============================================================================

export const updateCultivarSchema = createCustomCultivarSchema.partial().extend({
  status: cultivarStatusSchema.optional(),
});

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
export type LinkSystemCultivarInput = z.infer<typeof linkSystemCultivarSchema>;
export type UpdateCultivarInput = z.infer<typeof updateCultivarSchema>;
export type CultivarFilterInput = z.infer<typeof cultivarFilterSchema>;
export type CultivarStatus = z.infer<typeof cultivarStatusSchema>;
export type CultivarCharacteristics = z.infer<typeof cultivarCharacteristicsSchema>;
export type OptimalConditions = z.infer<typeof optimalConditionsSchema>;
export type OriginMetadata = z.infer<typeof originMetadataSchema>;
