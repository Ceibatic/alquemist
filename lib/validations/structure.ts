/**
 * Structure Validation Schemas
 *
 * Zod schemas for the hierarchical capacity model (structures within areas)
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const environmentTypeSchema = z.enum(['indoor', 'outdoor', 'greenhouse'], {
  errorMap: () => ({ message: 'Debes seleccionar un tipo de ambiente' }),
});

export const structureStatusSchema = z.enum(['active', 'inactive'], {
  errorMap: () => ({ message: 'Debes seleccionar un estado' }),
});

// ============================================================================
// CREATE STRUCTURE SCHEMA
// ============================================================================

export const createStructureSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .trim(),
  structure_type: z
    .string()
    .min(1, 'Debes seleccionar un tipo de estructura'),
  environment_type: environmentTypeSchema,

  // Hierarchy configuration
  num_levels: z
    .number()
    .int('Debe ser un numero entero')
    .min(1, 'Debe tener al menos 1 nivel')
    .max(20, 'Maximo 20 niveles'),
  containers_per_level: z
    .number()
    .int('Debe ser un numero entero')
    .min(1, 'Debe tener al menos 1 contenedor por nivel')
    .max(10000, 'Maximo 10,000 contenedores por nivel'),
  container_type: z
    .string()
    .min(1, 'Debes seleccionar un tipo de contenedor'),
  positions_per_container: z
    .number()
    .int('Debe ser un numero entero')
    .min(1, 'Debe tener al menos 1 posicion por contenedor')
    .max(1000, 'Maximo 1,000 posiciones por contenedor'),

  // Physical dimensions
  footprint_m2: z
    .number()
    .positive('Debe ser un numero positivo')
    .max(100000, 'No puede exceder 100,000 m2')
    .optional(),

  // Metadata
  sort_order: z.number().int().min(0).optional(),
  notes: z
    .string()
    .max(500, 'Notas no pueden exceder 500 caracteres')
    .optional(),
});

// ============================================================================
// UPDATE STRUCTURE SCHEMA
// ============================================================================

export const updateStructureSchema = createStructureSchema.partial();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateStructureInput = z.infer<typeof createStructureSchema>;
export type UpdateStructureInput = z.infer<typeof updateStructureSchema>;
export type EnvironmentType = z.infer<typeof environmentTypeSchema>;
export type StructureStatus = z.infer<typeof structureStatusSchema>;
