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
      'nutrient', 'pesticide', 'equipment', 'seed', 'substrate', 'container', 'tool', 'other',
      // Plant lifecycle categories
      'clone', 'seedling', 'mother_plant', 'plant_material'
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
  seed: 'Semillas',
  nutrient: 'Nutrientes',
  pesticide: 'Pesticidas',
  equipment: 'Equipos',
  substrate: 'Sustratos',
  container: 'Contenedores',
  tool: 'Herramientas',
  other: 'Otros',
  // Plant lifecycle categories
  clone: 'Esquejes',
  seedling: 'Plántulas',
  mother_plant: 'Plantas Madre',
  plant_material: 'Material Vegetal',
};

export const productCategoryIcons: Record<string, string> = {
  seed: '🌱',
  nutrient: '🧪',
  pesticide: '🛡️',
  equipment: '⚙️',
  substrate: '🌾',
  container: '🪣',
  tool: '🔧',
  other: '📋',
  // Plant lifecycle categories
  clone: '🪴',
  seedling: '🌿',
  mother_plant: '🌳',
  plant_material: '🍃',
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
