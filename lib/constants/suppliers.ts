/**
 * Supplier Management Constants
 * Colombian departments and supplier categories
 */

// ============================================================================
// COLOMBIAN DEPARTMENTS
// ============================================================================

export const COLOMBIAN_DEPARTMENTS = [
  'Amazonas',
  'Antioquia',
  'Arauca',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Casanare',
  'Cauca',
  'Cesar',
  'Chocó',
  'Córdoba',
  'Cundinamarca',
  'Guainía',
  'Guaviare',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'San Andrés y Providencia',
  'Santander',
  'Sucre',
  'Tolima',
  'Valle del Cauca',
  'Vaupés',
  'Vichada',
] as const;

export type ColombianDepartment = typeof COLOMBIAN_DEPARTMENTS[number];

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const PRODUCT_CATEGORIES = [
  { value: 'seeds', label: 'Semillas', icon: '🌱' },
  { value: 'clones', label: 'Clones', icon: '🌿' },
  { value: 'nutrients', label: 'Nutrientes', icon: '🧪' },
  { value: 'pesticides', label: 'Pesticidas', icon: '🛡️' },
  { value: 'fertilizers', label: 'Fertilizantes', icon: '💧' },
  { value: 'substrates', label: 'Sustratos', icon: '🪴' },
  { value: 'equipment', label: 'Equipos', icon: '⚙️' },
  { value: 'packaging', label: 'Empaque', icon: '📦' },
  { value: 'laboratory', label: 'Laboratorio', icon: '🔬' },
  { value: 'other', label: 'Otros', icon: '📋' },
] as const;

export type ProductCategoryValue = typeof PRODUCT_CATEGORIES[number]['value'];

// ============================================================================
// CROP SPECIALIZATION
// ============================================================================

export const CROP_SPECIALIZATION = [
  { value: 'cannabis', label: 'Cannabis' },
  { value: 'coffee', label: 'Café' },
  { value: 'cacao', label: 'Cacao' },
  { value: 'flowers', label: 'Flores' },
  { value: 'vegetables', label: 'Hortalizas' },
  { value: 'fruits', label: 'Frutas' },
  { value: 'general', label: 'General' },
] as const;

export type CropSpecializationValue = typeof CROP_SPECIALIZATION[number]['value'];

// ============================================================================
// PAYMENT TERMS
// ============================================================================

export const PAYMENT_TERMS = [
  { value: 'cash', label: 'Contado' },
  { value: '15_days', label: '15 días' },
  { value: '30_days', label: '30 días' },
  { value: '45_days', label: '45 días' },
  { value: '60_days', label: '60 días' },
  { value: '90_days', label: '90 días' },
  { value: 'custom', label: 'Personalizado' },
] as const;

export type PaymentTermsValue = typeof PAYMENT_TERMS[number]['value'];

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export const BUSINESS_TYPES = [
  { value: 'S.A.S', label: 'S.A.S' },
  { value: 'S.A.', label: 'S.A.' },
  { value: 'Ltda', label: 'Ltda' },
  { value: 'E.U.', label: 'E.U.' },
  { value: 'Persona Natural', label: 'Persona Natural' },
] as const;

export type BusinessTypeValue = typeof BUSINESS_TYPES[number]['value'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getCategoryLabel(value: string): string {
  const category = PRODUCT_CATEGORIES.find((c) => c.value === value);
  return category?.label || value;
}

export function getCategoryIcon(value: string): string {
  const category = PRODUCT_CATEGORIES.find((c) => c.value === value);
  return category?.icon || '📋';
}

export function getCropSpecializationLabel(value: string): string {
  const crop = CROP_SPECIALIZATION.find((c) => c.value === value);
  return crop?.label || value;
}

export function getPaymentTermsLabel(value: string): string {
  const term = PAYMENT_TERMS.find((t) => t.value === value);
  return term?.label || value;
}
