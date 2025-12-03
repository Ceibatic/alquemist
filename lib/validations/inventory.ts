/**
 * Inventory Validation Schemas
 *
 * Zod schemas for inventory management in Phase 2
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const productCategorySchema = z.enum(
  [
    'nutrient',
    'pesticide',
    'equipment',
    'seed',
    'substrate',
    'container',
    'tool',
    'other',
  ],
  {
    errorMap: () => ({ message: 'Debes seleccionar una categoría de producto' }),
  }
);

export const productStatusSchema = z.enum(['active', 'discontinued'], {
  errorMap: () => ({ message: 'Debes seleccionar un estado' }),
});

export const lotStatusSchema = z.enum(
  ['available', 'reserved', 'expired', 'quarantine'],
  {
    errorMap: () => ({ message: 'Debes seleccionar un estado de lote' }),
  }
);

export const qualityGradeSchema = z.enum(['A', 'B', 'C'], {
  errorMap: () => ({ message: 'Debes seleccionar un grado de calidad' }),
});

export const sourceTypeSchema = z.enum(['purchase', 'production', 'transfer'], {
  errorMap: () => ({ message: 'Debes seleccionar un tipo de origen' }),
});

// ============================================================================
// PRODUCT METADATA SCHEMA
// ============================================================================

export const productMetadataSchema = z.object({
  active_ingredients: z.array(z.string()).optional(),
  concentration: z.string().optional(),
  application_method: z.string().optional(),
  safety_precautions: z.array(z.string()).optional(),
  storage_requirements: z.string().optional(),
}).catchall(z.any()); // Allow additional fields

// ============================================================================
// STORAGE CONDITIONS SCHEMA
// ============================================================================

export const storageConditionsSchema = z.object({
  temperature_min: z
    .number()
    .min(-50, 'Temperatura mínima debe ser mayor a -50°C')
    .max(100, 'Temperatura mínima debe ser menor a 100°C')
    .optional(),
  temperature_max: z
    .number()
    .min(-50, 'Temperatura máxima debe ser mayor a -50°C')
    .max(100, 'Temperatura máxima debe ser menor a 100°C')
    .optional(),
  humidity_max: z
    .number()
    .min(0, 'Humedad máxima debe ser mayor o igual a 0%')
    .max(100, 'Humedad máxima debe ser menor o igual a 100%')
    .optional(),
  light_exposure: z.enum(['dark', 'low', 'ambient']).optional(),
  special_requirements: z
    .array(z.string().max(200))
    .max(20, 'No puedes agregar más de 20 requisitos especiales')
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
);

// ============================================================================
// CREATE PRODUCT SCHEMA
// ============================================================================

export const createProductSchema = z.object({
  sku: z
    .string()
    .min(2, 'SKU debe tener al menos 2 caracteres')
    .max(50, 'SKU no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'SKU debe contener solo letras mayúsculas, números y guiones')
    .trim(),
  gtin: z
    .string()
    .regex(/^\d{8,14}$/, 'GTIN debe tener entre 8 y 14 dígitos')
    .optional()
    .or(z.literal('')),
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .optional(),
  category: productCategorySchema,
  subcategory: z
    .string()
    .max(100, 'Subcategoría no puede exceder 100 caracteres')
    .optional(),

  // Crop Applicability
  applicable_crop_type_ids: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos un tipo de cultivo aplicable')
    .max(20, 'No puedes seleccionar más de 20 tipos de cultivo'),

  // Supplier Information
  brand_id: z.string().max(100).optional(),
  manufacturer: z
    .string()
    .max(200, 'Fabricante no puede exceder 200 caracteres')
    .optional(),
  preferred_supplier_id: z.string().optional(),
  regional_suppliers: z.array(z.string()).max(50).default([]),

  // Physical Properties
  weight_value: z.number().positive('Peso debe ser un número positivo').optional(),
  weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional(),
  dimensions_length: z.number().positive('Longitud debe ser un número positivo').optional(),
  dimensions_width: z.number().positive('Ancho debe ser un número positivo').optional(),
  dimensions_height: z.number().positive('Altura debe ser un número positivo').optional(),
  dimensions_unit: z.enum(['cm', 'm', 'in', 'ft']).optional(),

  // Metadata
  product_metadata: productMetadataSchema.optional(),

  // Regulatory
  regulatory_registered: z.boolean().default(false),
  regulatory_registration_number: z
    .string()
    .max(100, 'Número de registro no puede exceder 100 caracteres')
    .optional(),
  organic_certified: z.boolean().default(false),
  organic_cert_number: z
    .string()
    .max(100, 'Número de certificación no puede exceder 100 caracteres')
    .optional(),

  // Pricing
  default_price: z.number().positive('Precio debe ser un número positivo').optional(),
  price_unit: z
    .string()
    .max(50, 'Unidad de precio no puede exceder 50 caracteres')
    .optional(),
});

// ============================================================================
// UPDATE PRODUCT SCHEMA
// ============================================================================

export const updateProductSchema = createProductSchema.partial().extend({
  status: productStatusSchema.optional(),
});

// ============================================================================
// CREATE INVENTORY ITEM SCHEMA
// ============================================================================

export const createInventoryItemSchema = z.object({
  product_id: z.string().min(1, 'Debes seleccionar un producto'),
  area_id: z.string().min(1, 'Debes seleccionar un área'),
  supplier_id: z.string().optional(),

  // Quantities
  quantity_available: z
    .number()
    .min(0, 'Cantidad disponible debe ser mayor o igual a 0'),
  quantity_unit: z
    .string()
    .min(1, 'Unidad de cantidad es requerida')
    .max(50, 'Unidad no puede exceder 50 caracteres'),

  // Batch Tracking
  batch_number: z
    .string()
    .max(100, 'Número de lote no puede exceder 100 caracteres')
    .optional(),
  supplier_lot_number: z
    .string()
    .max(100, 'Número de lote del proveedor no puede exceder 100 caracteres')
    .optional(),
  serial_numbers: z
    .array(z.string().max(100))
    .max(1000, 'No puedes agregar más de 1000 números de serie')
    .default([]),

  // Dates
  received_date: z.number().positive().optional(),
  manufacturing_date: z.number().positive().optional(),
  expiration_date: z.number().positive().optional(),
  last_tested_date: z.number().positive().optional(),

  // Financial
  purchase_price: z
    .number()
    .positive('Precio de compra debe ser un número positivo')
    .optional(),
  cost_per_unit: z
    .number()
    .positive('Costo por unidad debe ser un número positivo')
    .optional(),

  // Quality
  quality_grade: qualityGradeSchema.optional(),
  quality_notes: z
    .string()
    .max(1000, 'Notas de calidad no pueden exceder 1000 caracteres')
    .optional(),

  // Source
  source_type: sourceTypeSchema.optional(),
  source_recipe_id: z.string().optional(),
  source_batch_id: z.string().optional(),
  production_date: z.number().positive().optional(),

  // Storage
  storage_conditions: storageConditionsSchema.optional(),
  minimum_stock_level: z
    .number()
    .min(0, 'Nivel mínimo de stock debe ser mayor o igual a 0')
    .optional(),
  maximum_stock_level: z
    .number()
    .min(0, 'Nivel máximo de stock debe ser mayor o igual a 0')
    .optional(),
  reorder_point: z
    .number()
    .min(0, 'Punto de reorden debe ser mayor o igual a 0')
    .optional(),
  lead_time_days: z
    .number()
    .int('Tiempo de entrega debe ser un número entero')
    .min(0, 'Tiempo de entrega debe ser mayor o igual a 0')
    .optional(),

  // Metadata
  notes: z
    .string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
}).refine(
  (data) => {
    if (data.minimum_stock_level !== undefined && data.maximum_stock_level !== undefined) {
      return data.minimum_stock_level <= data.maximum_stock_level;
    }
    return true;
  },
  {
    message: 'Nivel mínimo debe ser menor o igual al nivel máximo',
    path: ['minimum_stock_level'],
  }
).refine(
  (data) => {
    if (data.manufacturing_date !== undefined && data.expiration_date !== undefined) {
      return data.manufacturing_date < data.expiration_date;
    }
    return true;
  },
  {
    message: 'Fecha de fabricación debe ser anterior a fecha de vencimiento',
    path: ['manufacturing_date'],
  }
);

// ============================================================================
// UPDATE INVENTORY ITEM SCHEMA
// ============================================================================

// Base schema without refinements for partial updates
const baseInventoryItemSchema = z.object({
  product_id: z.string().min(1, 'Debes seleccionar un producto'),
  area_id: z.string().min(1, 'Debes seleccionar un área'),
  supplier_id: z.string().optional(),

  // Quantities
  quantity_available: z
    .number()
    .min(0, 'Cantidad disponible debe ser mayor o igual a 0'),
  quantity_unit: z
    .string()
    .min(1, 'Unidad de cantidad es requerida')
    .max(50, 'Unidad no puede exceder 50 caracteres'),

  // Batch Tracking
  batch_number: z
    .string()
    .max(100, 'Número de lote no puede exceder 100 caracteres')
    .optional(),
  supplier_lot_number: z
    .string()
    .max(100, 'Número de lote del proveedor no puede exceder 100 caracteres')
    .optional(),
  serial_numbers: z
    .array(z.string().max(100))
    .max(1000, 'No puedes agregar más de 1000 números de serie')
    .default([]),

  // Dates
  received_date: z.number().positive().optional(),
  manufacturing_date: z.number().positive().optional(),
  expiration_date: z.number().positive().optional(),
  last_tested_date: z.number().positive().optional(),

  // Financial
  purchase_price: z
    .number()
    .positive('Precio de compra debe ser un número positivo')
    .optional(),
  cost_per_unit: z
    .number()
    .positive('Costo por unidad debe ser un número positivo')
    .optional(),

  // Quality
  quality_grade: qualityGradeSchema.optional(),
  quality_notes: z
    .string()
    .max(1000, 'Notas de calidad no pueden exceder 1000 caracteres')
    .optional(),

  // Source
  source_type: sourceTypeSchema.optional(),
  source_recipe_id: z.string().optional(),
  source_batch_id: z.string().optional(),
  production_date: z.number().positive().optional(),

  // Storage
  storage_conditions: storageConditionsSchema.optional(),
  minimum_stock_level: z
    .number()
    .min(0, 'Nivel mínimo de stock debe ser mayor o igual a 0')
    .optional(),
  maximum_stock_level: z
    .number()
    .min(0, 'Nivel máximo de stock debe ser mayor o igual a 0')
    .optional(),
  reorder_point: z
    .number()
    .min(0, 'Punto de reorden debe ser mayor o igual a 0')
    .optional(),
  lead_time_days: z
    .number()
    .int('Tiempo de entrega debe ser un número entero')
    .min(0, 'Tiempo de entrega debe ser mayor o igual a 0')
    .optional(),

  // Metadata
  notes: z
    .string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
});

export const updateInventoryItemSchema = baseInventoryItemSchema.partial().extend({
  lot_status: lotStatusSchema.optional(),
});

// ============================================================================
// ADJUST INVENTORY QUANTITY SCHEMA
// ============================================================================

export const adjustInventoryQuantitySchema = z.object({
  inventory_item_id: z.string().min(1, 'ID de ítem de inventario es requerido'),
  adjustment_type: z.enum(['add', 'subtract', 'set'], {
    errorMap: () => ({ message: 'Tipo de ajuste inválido' }),
  }),
  quantity: z.number().positive('Cantidad debe ser un número positivo'),
  reason: z
    .string()
    .min(5, 'Razón debe tener al menos 5 caracteres')
    .max(500, 'Razón no puede exceder 500 caracteres'),
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// INVENTORY FILTER SCHEMA
// ============================================================================

export const inventoryFilterSchema = z.object({
  area_id: z.string().optional(),
  product_id: z.string().optional(),
  category: productCategorySchema.optional(),
  lot_status: lotStatusSchema.optional(),
  quality_grade: qualityGradeSchema.optional(),
  supplier_id: z.string().optional(),
  low_stock: z.boolean().optional(), // Filter items below reorder point
  expired: z.boolean().optional(), // Filter expired items
  expiring_soon: z.number().int().positive().optional(), // Days until expiration
  search: z.string().optional(),
});

// ============================================================================
// INVENTORY TRANSFER SCHEMA
// ============================================================================

export const transferInventorySchema = z.object({
  inventory_item_id: z.string().min(1, 'ID de ítem de inventario es requerido'),
  from_area_id: z.string().min(1, 'Área de origen es requerida'),
  to_area_id: z.string().min(1, 'Área de destino es requerida'),
  quantity: z.number().positive('Cantidad debe ser un número positivo'),
  reason: z
    .string()
    .min(5, 'Razón debe tener al menos 5 caracteres')
    .max(500, 'Razón no puede exceder 500 caracteres'),
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
}).refine(
  (data) => data.from_area_id !== data.to_area_id,
  {
    message: 'Área de origen y destino deben ser diferentes',
    path: ['to_area_id'],
  }
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type AdjustInventoryQuantityInput = z.infer<typeof adjustInventoryQuantitySchema>;
export type InventoryFilterInput = z.infer<typeof inventoryFilterSchema>;
export type TransferInventoryInput = z.infer<typeof transferInventorySchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type LotStatus = z.infer<typeof lotStatusSchema>;
export type QualityGrade = z.infer<typeof qualityGradeSchema>;
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type StorageConditions = z.infer<typeof storageConditionsSchema>;
