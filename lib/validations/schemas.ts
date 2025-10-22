/**
 * Shared Validation Schemas
 * Zod schemas used across both REST API and Next.js frontend
 *
 * INTERNATIONALIZATION STRATEGY:
 * - Database values: English (technical, API-compatible)
 * - User display: Spanish (via messages/es.json)
 * - Example: DB stores "indoor", user sees "Interior"
 *
 * All enum values below are kept in English for:
 * 1. API compatibility
 * 2. Database consistency
 * 3. Developer experience
 *
 * Translations are centralized in messages/es.json:
 * - facilityTypes.indoor → "Interior"
 * - status.active → "Activo"
 * - etc.
 */

import { z } from 'zod'

// ============================================================================
// Common Schemas
// ============================================================================

export const idSchema = z.string().min(1, 'ID is required')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

// ============================================================================
// Company Schemas
// ============================================================================

export const businessEntityTypes = [
  'S.A.S',
  'S.A.',
  'Ltda',
  'E.U.',
  'Persona Natural',
  'Other',
] as const

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  company_type: z.string().min(1, 'Company type is required'),
  business_entity_type: z.enum(businessEntityTypes).optional(),
  primary_contact_email: z.string().email().optional(),
  primary_contact_phone: z.string().optional(),
  country: z.string().default('CO'),
  default_locale: z.string().default('es'),
  default_currency: z.string().default('COP'),
  default_timezone: z.string().default('America/Bogota'),
})

export const updateCompanySchema = createCompanySchema.partial()

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>

// ============================================================================
// Facility Schemas
// ============================================================================

// Technical values stored in DB (English) - User sees Spanish via i18n
// indoor → "Interior", outdoor → "Exterior", greenhouse → "Invernadero", mixed → "Mixto"
export const facilityTypes = [
  'indoor',
  'outdoor',
  'greenhouse',
  'mixed',
] as const

export const createFacilitySchema = z.object({
  name: z.string().min(1, 'Facility name is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_type: z.string().optional(),
  license_authority: z.string().optional(),
  facility_type: z.enum(facilityTypes).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  administrative_division_1: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  altitude_meters: z.number().optional(),
  total_area_m2: z.number().positive().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
})

export const updateFacilitySchema = createFacilitySchema.partial()

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>

// ============================================================================
// Batch Schemas
// ============================================================================

export const batchTypes = ['propagation', 'growth', 'harvest'] as const

export const createBatchSchema = z.object({
  facility_id: idSchema,
  area_id: idSchema,
  crop_type_id: idSchema,
  cultivar_id: idSchema.optional(),
  batch_type: z.enum(batchTypes),
  tracking_level: z.enum(['batch', 'individual']).default('batch'),
  planned_quantity: z.number().int().positive(),
  current_quantity: z.number().int().positive(),
  initial_quantity: z.number().int().positive(),
  unit_of_measure: z.string().default('plants'),
  status: z
    .enum(['active', 'completed', 'harvested', 'destroyed', 'archived'])
    .default('active'),
  notes: z.string().optional(),
})

export const updateBatchSchema = createBatchSchema.partial()

export type CreateBatchInput = z.infer<typeof createBatchSchema>
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>

// ============================================================================
// Activity Schemas
// ============================================================================

export const activityTypes = [
  'watering',
  'feeding',
  'pruning',
  'transplanting',
  'harvest',
  'inspection',
  'pest_treatment',
  'quality_check',
  'other',
] as const

export const createActivitySchema = z.object({
  entity_type: z.enum(['batch', 'plant', 'area']),
  entity_id: idSchema,
  activity_type: z.enum(activityTypes),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
  materials_consumed: z.array(z.object({
    product_id: idSchema,
    quantity: z.number().positive(),
    unit: z.string(),
  })).optional().default([]),
  environmental_data: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    ph: z.number().optional(),
  }).optional(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>

// ============================================================================
// Compliance Schemas
// ============================================================================

export const eventCategories = [
  'ica',
  'invima',
  'municipal',
  'fnc',
  'other',
] as const

export const createComplianceEventSchema = z.object({
  event_type: z.enum(['inspection', 'violation', 'permit', 'audit']),
  event_category: z.enum(eventCategories),
  entity_type: z.enum(['company', 'facility', 'batch']),
  entity_id: idSchema,
  facility_id: idSchema.optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  due_date: z.string().datetime().optional(),
})

export type CreateComplianceEventInput = z.infer<
  typeof createComplianceEventSchema
>

// ============================================================================
// Inventory Schemas
// ============================================================================

export const createInventoryItemSchema = z.object({
  product_id: idSchema,
  area_id: idSchema,
  supplier_id: idSchema.optional(),
  quantity_available: z.number().positive(),
  quantity_unit: z.string(),
  batch_number: z.string().optional(),
  received_date: z.string().datetime().optional(),
  expiration_date: z.string().datetime().optional(),
  lot_status: z
    .enum(['available', 'reserved', 'expired', 'quarantine'])
    .default('available'),
})

export type CreateInventoryItemInput = z.infer<
  typeof createInventoryItemSchema
>
