/**
 * Area Validation Schemas
 *
 * Zod schemas for area management in Phase 2
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const areaTypeSchema = z.enum([
  'propagation',
  'vegetative',
  'flowering',
  'drying',
  'curing',
  'storage',
  'processing',
  'quarantine',
], {
  errorMap: () => ({ message: 'Debes seleccionar un tipo de área' }),
});

export const areaStatusSchema = z.enum(['active', 'maintenance', 'inactive'], {
  errorMap: () => ({ message: 'Debes seleccionar un estado' }),
});

export const environmentTypeSchema = z.enum(['indoor', 'outdoor'], {
  errorMap: () => ({ message: 'Debes seleccionar un tipo de ambiente' }),
});

// ============================================================================
// ENVIRONMENTAL SPECS SCHEMA
// ============================================================================

export const environmentalSpecsSchema = z
  .object({
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
    light_hours: z
      .number()
      .min(0, 'Horas de luz deben ser mayor o igual a 0')
      .max(24, 'Horas de luz deben ser menor o igual a 24')
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
  })
  .refine(
    (data) => {
      if (
        data.temperature_min !== undefined &&
        data.temperature_max !== undefined
      ) {
        return data.temperature_min <= data.temperature_max;
      }
      return true;
    },
    {
      message: 'Temperatura mínima debe ser menor o igual a temperatura máxima',
      path: ['temperature_min'],
    }
  )
  .refine(
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
  )
  .refine(
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
// CAPACITY CONFIGURATION SCHEMA
// ============================================================================

export const capacityModeSchema = z.enum(['manual', 'structures'], {
  errorMap: () => ({ message: 'Debes seleccionar un modo de capacidad' }),
});

export const capacityConfigurationSchema = z.object({
  max_capacity: z
    .number()
    .min(0, 'Capacidad máxima debe ser al menos 0')
    .max(1000000, 'Capacidad máxima no puede exceder 1,000,000 plantas'),
  source: z.string().optional(),
  structure_count: z.number().optional(),
  total_growing_area_m2: z.number().optional(),
});

// ============================================================================
// INLINE STRUCTURE TEMPLATE SCHEMA (for area creation)
// ============================================================================

export const inlineStructureSchema = z.object({
  prefix: z
    .string()
    .min(1, 'Prefijo es requerido')
    .max(50, 'Prefijo no puede exceder 50 caracteres'),
  quantity: z
    .number()
    .int('Cantidad debe ser un número entero')
    .min(1, 'Cantidad mínima es 1')
    .max(100, 'Máximo 100 estructuras'),
  structure_type: z.string().min(1, 'Tipo de estructura requerido'),
  environment_type: environmentTypeSchema,
  num_levels: z.number().int().min(1).max(20),
  containers_per_level: z.number().int().min(1).max(10000),
  container_type: z.string().min(1, 'Tipo de contenedor requerido'),
  positions_per_container: z.number().int().min(1).max(1000),
  footprint_m2: z
    .number()
    .positive('Huella debe ser un número positivo')
    .max(100000)
    .optional(),
});

// ============================================================================
// CREATE AREA SCHEMA
// ============================================================================

export const createAreaSchema = z.object({
  name: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim(),
  area_type: areaTypeSchema,
  environment_type: environmentTypeSchema,
  status: areaStatusSchema.default('active'),
  compatible_crop_type_ids: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos un tipo de cultivo compatible')
    .max(10, 'No puedes seleccionar más de 10 tipos de cultivo'),

  // Dimensions — simplified to total area only
  total_area_m2: z
    .number()
    .positive('Área total debe ser un número positivo')
    .max(1000000, 'Área total no puede exceder 1,000,000 m²'),

  // Legacy dimension fields (kept for edit backward compat)
  length_meters: z.number().positive().max(1000).optional(),
  width_meters: z.number().positive().max(1000).optional(),
  height_meters: z.number().positive().max(100).optional(),
  usable_area_m2: z.number().positive().max(1000000).optional(),

  // Capacity
  capacity_mode: capacityModeSchema.optional(),
  capacity_configurations: capacityConfigurationSchema.optional(),

  // Inline structure creation (optional, for create flow)
  structures: z.array(inlineStructureSchema).optional(),

  // Technical Features
  climate_controlled: z.boolean().default(false),
  lighting_controlled: z.boolean().default(false),
  irrigation_system: z.boolean().default(false),
  environmental_specs: environmentalSpecsSchema.optional(),
  equipment_list: z.array(z.any()).default([]),

  // Metadata
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// UPDATE AREA SCHEMA
// ============================================================================

export const updateAreaSchema = createAreaSchema.partial().extend({
  // Status can be updated separately
  status: areaStatusSchema.optional(),
});

// ============================================================================
// AREA FILTER SCHEMA
// ============================================================================

export const areaFilterSchema = z.object({
  facility_id: z.string().optional(),
  area_type: areaTypeSchema.optional(),
  status: areaStatusSchema.optional(),
  compatible_crop_type_id: z.string().optional(),
  climate_controlled: z.boolean().optional(),
  search: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
export type AreaFilterInput = z.infer<typeof areaFilterSchema>;
export type AreaType = z.infer<typeof areaTypeSchema>;
export type AreaStatus = z.infer<typeof areaStatusSchema>;
export type EnvironmentType = z.infer<typeof environmentTypeSchema>;
export type EnvironmentalSpecs = z.infer<typeof environmentalSpecsSchema>;
export type CapacityMode = z.infer<typeof capacityModeSchema>;
export type CapacityConfiguration = z.infer<typeof capacityConfigurationSchema>;
export type InlineStructure = z.infer<typeof inlineStructureSchema>;
