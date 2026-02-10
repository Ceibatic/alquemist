/**
 * Product Validation Schemas
 *
 * Zod schemas for product management
 */

import { z } from 'zod';

// Re-export shared schemas from inventory
export {
  productCategorySchema,
  productStatusSchema,
  type ProductCategory,
  type ProductStatus,
} from './inventory';

// ============================================================================
// PRODUCT FORM SCHEMA (Frontend)
// ============================================================================

export const productFormSchema = z.object({
  sku: z
    .string()
    .min(2, 'SKU debe tener al menos 2 caracteres')
    .max(50, 'SKU no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'SKU debe contener solo letras mayúsculas, números y guiones')
    .trim(),
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  description: z
    .string()
    .max(1000, 'Descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  category: z.enum(
    [
      // Insumos
      'seed', 'nutrient', 'pesticide', 'substrate', 'biocontrol',
      // Material vegetal
      'clone', 'seedling', 'mother_plant', 'plant_material',
      'plant_vegetative', 'plant_flowering', 'harvest_wet', 'harvest_dry', 'processed_plant',
      // Preparados
      'stock_solution', 'substrate_mix',
      // Infraestructura
      'equipment', 'container', 'tool', 'other',
    ],
    { errorMap: () => ({ message: 'Debes seleccionar una categoría' }) }
  ),
  subcategory: z
    .string()
    .max(100, 'Subcategoría no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Inventory Unit - default unit for tracking inventory
  default_unit: z
    .enum(['kg', 'g', 'L', 'mL', 'unidades', 'bolsas', 'cajas', 'galones', 'libras', 'onzas'])
    .optional()
    .or(z.literal('')),

  // Supplier
  preferred_supplier_id: z.string().optional().or(z.literal('')),

  // Brand/Manufacturer
  brand_id: z.string().max(100).optional().or(z.literal('')),
  manufacturer: z
    .string()
    .max(200, 'Fabricante no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  // Physical Properties
  weight_value: z.coerce
    .number()
    .positive('Peso debe ser un número positivo')
    .optional()
    .or(z.literal('')),
  weight_unit: z.enum(['kg', 'g', 'lb', 'oz']).optional().or(z.literal('')),

  // Regulatory
  regulatory_registered: z.boolean().default(false),
  regulatory_registration_number: z
    .string()
    .max(100, 'Número de registro no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  organic_certified: z.boolean().default(false),
  organic_cert_number: z
    .string()
    .max(100, 'Número de certificación no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  // Pricing
  default_price: z.coerce
    .number()
    .min(0, 'Precio debe ser mayor o igual a 0')
    .optional()
    .or(z.literal('')),
  price_currency: z.string().default('COP'),
  price_unit: z
    .string()
    .max(50, 'Unidad de precio no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),

  // Transformation Chain
  transformation_produces_id: z.string().optional().or(z.literal('')),
  default_yield_pct: z.coerce
    .number()
    .min(0, 'Rendimiento debe ser mayor o igual a 0')
    .max(100, 'Rendimiento no puede exceder 100%')
    .optional()
    .or(z.literal('')),

  // Procurement & Tracking
  procurement_type: z.enum(['purchased', 'produced', 'both']).optional().or(z.literal('')),
  lot_tracking: z.enum(['required', 'optional', 'none']).optional().or(z.literal('')),
  shelf_life_days: z.coerce
    .number()
    .int('Días de vida útil debe ser un número entero')
    .positive('Días de vida útil debe ser positivo')
    .optional()
    .or(z.literal('')),

  // Price change tracking (for edits)
  priceChangeCategory: z.string().optional().or(z.literal('')),
  priceChangeReason: z
    .string()
    .max(500, 'Razón no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  priceChangeNotes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
});

// ============================================================================
// PRODUCT FILTER SCHEMA
// ============================================================================

export const productFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(['active', 'discontinued']).optional(),
  search: z.string().optional(),
  supplier_id: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ProductFormInput = z.infer<typeof productFormSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

// ============================================================================
// CATEGORY LABELS (Spanish)
// ============================================================================

export const productCategoryLabels: Record<string, string> = {
  // Insumos
  seed: 'Semillas',
  nutrient: 'Nutrientes',
  pesticide: 'Pesticidas',
  substrate: 'Sustratos',
  biocontrol: 'Biocontrol',
  // Material vegetal
  clone: 'Esquejes',
  seedling: 'Plántulas',
  mother_plant: 'Plantas Madre',
  plant_material: 'Material Vegetal',
  plant_vegetative: 'Planta Vegetativa',
  plant_flowering: 'Planta en Floración',
  harvest_wet: 'Cosecha Húmeda',
  harvest_dry: 'Cosecha Seca',
  processed_plant: 'Producto Procesado',
  // Preparados
  stock_solution: 'Solución Madre',
  substrate_mix: 'Mezcla de Sustrato',
  // Infraestructura
  equipment: 'Equipos',
  container: 'Contenedores',
  tool: 'Herramientas',
  other: 'Otros',
};

export const productCategoryIcons: Record<string, string> = {
  // Insumos
  seed: '🌱',
  nutrient: '🧪',
  pesticide: '🛡️',
  substrate: '🌾',
  biocontrol: '🐛',
  // Material vegetal
  clone: '🪴',
  seedling: '🌿',
  mother_plant: '🌳',
  plant_material: '🍃',
  plant_vegetative: '🌱',
  plant_flowering: '🌸',
  harvest_wet: '🌿',
  harvest_dry: '🍂',
  processed_plant: '📦',
  // Preparados
  stock_solution: '🧫',
  substrate_mix: '🌾',
  // Infraestructura
  equipment: '⚙️',
  container: '🪣',
  tool: '🔧',
  other: '📋',
};

export const procurementTypeLabels: Record<string, string> = {
  purchased: 'Comprado',
  produced: 'Producido',
  both: 'Comprado y Producido',
};

export const lotTrackingLabels: Record<string, string> = {
  required: 'Obligatorio',
  optional: 'Opcional',
  none: 'Sin seguimiento',
};

export const productStatusLabels: Record<string, string> = {
  active: 'Activo',
  discontinued: 'Descontinuado',
};

export const weightUnitLabels: Record<string, string> = {
  kg: 'Kilogramos (kg)',
  g: 'Gramos (g)',
  lb: 'Libras (lb)',
  oz: 'Onzas (oz)',
};

export const priceChangeCategoryLabels: Record<string, string> = {
  market_adjustment: 'Ajuste de mercado',
  supplier_change: 'Cambio de proveedor',
  inflation: 'Inflación',
  promotion: 'Promoción',
  error_correction: 'Corrección de error',
  cost_increase: 'Aumento de costos',
  cost_decrease: 'Reducción de costos',
  new_contract: 'Nuevo contrato',
  other: 'Otro',
};

export const inventoryUnitLabels: Record<string, string> = {
  kg: 'Kilogramos (kg)',
  g: 'Gramos (g)',
  L: 'Litros (L)',
  mL: 'Mililitros (mL)',
  unidades: 'Unidades',
  bolsas: 'Bolsas',
  cajas: 'Cajas',
  galones: 'Galones',
  libras: 'Libras',
  onzas: 'Onzas',
};

export const INVENTORY_UNITS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'mL', label: 'Mililitros (mL)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'bolsas', label: 'Bolsas' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'galones', label: 'Galones' },
  { value: 'libras', label: 'Libras' },
  { value: 'onzas', label: 'Onzas' },
];
