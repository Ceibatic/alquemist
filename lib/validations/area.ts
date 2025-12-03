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
// CONTAINER TYPE SCHEMA
// ============================================================================

export const containerTypeSchema = z.enum(
  [
    'bandeja',
    'maceta',
    'charola_propagacion',
    'bolsa_cultivo',
    'cubo_contenedor',
    'cama_cultivo',
    'otro',
  ],
  {
    errorMap: () => ({
      message: 'Debes seleccionar un tipo de contenedor válido',
    }),
  }
);

// ============================================================================
// CAPACITY CONFIGURATION SCHEMA
// ============================================================================

export const capacityConfigurationSchema = z
  .object({
    // Capacidad máxima de plantas (calculada o manual)
    max_capacity: z
      .number()
      .min(1, 'Capacidad máxima debe ser al menos 1')
      .max(1000000, 'Capacidad máxima no puede exceder 1,000,000 plantas'),

    // Campos opcionales para modo contenedor
    container_type: containerTypeSchema.optional(),
    container_count: z
      .number()
      .min(1, 'Cantidad de contenedores debe ser al menos 1')
      .max(100000, 'Cantidad de contenedores no puede exceder 100,000')
      .optional(),
    plants_per_container: z
      .number()
      .min(1, 'Plantas por contenedor debe ser al menos 1')
      .max(1000, 'Plantas por contenedor no puede exceder 1,000')
      .optional(),
  })
  .refine(
    (data) => {
      // Si hay tipo de contenedor, debe haber count y plants_per_container
      if (data.container_type) {
        return (
          data.container_count !== undefined &&
          data.plants_per_container !== undefined
        );
      }
      return true;
    },
    {
      message:
        'Si seleccionas un tipo de contenedor, debes especificar cantidad y plantas por contenedor',
      path: ['container_type'],
    }
  );

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
  status: areaStatusSchema.default('active'),
  compatible_crop_type_ids: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos un tipo de cultivo compatible')
    .max(10, 'No puedes seleccionar más de 10 tipos de cultivo'),

  // Dimensions (optional)
  length_meters: z
    .number()
    .positive('Longitud debe ser un número positivo')
    .max(1000, 'Longitud no puede exceder 1000 metros')
    .optional(),
  width_meters: z
    .number()
    .positive('Ancho debe ser un número positivo')
    .max(1000, 'Ancho no puede exceder 1000 metros')
    .optional(),
  height_meters: z
    .number()
    .positive('Altura debe ser un número positivo')
    .max(100, 'Altura no puede exceder 100 metros')
    .optional(),
  total_area_m2: z
    .number()
    .positive('Área total debe ser un número positivo')
    .max(1000000, 'Área total no puede exceder 1,000,000 m²'),
  usable_area_m2: z
    .number()
    .positive('Área útil debe ser un número positivo')
    .max(1000000, 'Área útil no puede exceder 1,000,000 m²')
    .optional(),

  // Capacity
  capacity_configurations: capacityConfigurationSchema.optional(),

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
export type EnvironmentalSpecs = z.infer<typeof environmentalSpecsSchema>;
export type ContainerType = z.infer<typeof containerTypeSchema>;
export type CapacityConfiguration = z.infer<typeof capacityConfigurationSchema>;
