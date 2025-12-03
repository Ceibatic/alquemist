/**
 * Supplier Validation Schemas
 *
 * Zod schemas for supplier management in Phase 2
 * Includes Colombian-specific validations (NIT format, phone numbers)
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const businessTypeSchema = z.enum(
  ['S.A.S', 'S.A.', 'Ltda', 'E.U.', 'Persona Natural'],
  {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de empresa' }),
  }
);

// ============================================================================
// COLOMBIAN-SPECIFIC VALIDATORS
// ============================================================================

/**
 * Colombian NIT (Número de Identificación Tributaria) Validator
 * Formats accepted:
 * - XXX.XXX.XXX-X
 * - XXXXXXXXX-X
 * - XXXXXXXXXX (without formatting)
 */
export const nitSchema = z
  .string()
  .trim()
  .regex(
    /^(\d{3}\.\d{3}\.\d{3}-\d{1}|\d{9}-\d{1}|\d{9,10})$/,
    'NIT inválido. Formato: XXX.XXX.XXX-X o XXXXXXXXX-X'
  )
  .optional();

/**
 * Colombian Phone Number Validator
 * Formats accepted:
 * - +57 XXX XXX XXXX (international)
 * - 3XX XXX XXXX (mobile - 10 digits)
 * - XXX XXXX (landline - 7 digits)
 * - XXXXXXXXXX (10 digits no formatting)
 */
export const colombianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+57\s?\d{3}\s?\d{3}\s?\d{4}|3\d{2}\s?\d{3}\s?\d{4}|\d{3}\s?\d{4}|\d{10})$/,
    'Teléfono inválido. Formato: +57 XXX XXX XXXX o 3XX XXX XXXX'
  )
  .optional()
  .or(z.literal(''));

/**
 * Helper function to format NIT
 */
export const formatNIT = (nit: string): string => {
  const cleaned = nit.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return nit;
};

/**
 * Helper function to format Colombian phone
 */
export const formatColombianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
};

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const productCategoriesSchema = z
  .array(
    z.enum([
      'seeds',
      'clones',
      'nutrients',
      'pesticides',
      'fertilizers',
      'substrates',
      'equipment',
      'packaging',
      'laboratory',
      'other',
    ])
  )
  .min(1, 'Debes seleccionar al menos una categoría de producto')
  .max(10, 'No puedes seleccionar más de 10 categorías');

// ============================================================================
// CROP SPECIALIZATION
// ============================================================================

export const cropSpecializationSchema = z
  .array(z.string())
  .min(1, 'Debes seleccionar al menos un cultivo de especialización')
  .max(10, 'No puedes seleccionar más de 10 cultivos');

// ============================================================================
// CERTIFICATION SCHEMA
// ============================================================================

export const certificationSchema = z.object({
  name: z
    .string()
    .min(2, 'Nombre de certificación debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres'),
  number: z
    .string()
    .min(1, 'Número de certificación es requerido')
    .max(100, 'Número no puede exceder 100 caracteres'),
  issued_by: z
    .string()
    .min(2, 'Emisor debe tener al menos 2 caracteres')
    .max(200, 'Emisor no puede exceder 200 caracteres'),
  issued_date: z.number().positive('Fecha de emisión es requerida'),
  expiry_date: z.number().positive().optional(),
});

// ============================================================================
// LICENSE SCHEMA
// ============================================================================

export const licenseSchema = z.object({
  type: z
    .string()
    .min(2, 'Tipo de licencia debe tener al menos 2 caracteres')
    .max(100, 'Tipo no puede exceder 100 caracteres'),
  number: z
    .string()
    .min(1, 'Número de licencia es requerido')
    .max(100, 'Número no puede exceder 100 caracteres'),
  authority: z
    .string()
    .min(2, 'Autoridad debe tener al menos 2 caracteres')
    .max(200, 'Autoridad no puede exceder 200 caracteres'),
  issued_date: z.number().positive('Fecha de emisión es requerida'),
  expiry_date: z.number().positive('Fecha de vencimiento es requerida'),
}).refine(
  (data) => data.issued_date < data.expiry_date,
  {
    message: 'Fecha de emisión debe ser anterior a fecha de vencimiento',
    path: ['issued_date'],
  }
);

// ============================================================================
// CREATE SUPPLIER SCHEMA
// ============================================================================

export const createSupplierSchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  legal_name: z
    .string()
    .min(2, 'Razón social debe tener al menos 2 caracteres')
    .max(200, 'Razón social no puede exceder 200 caracteres')
    .trim()
    .optional(),
  tax_id: nitSchema,
  business_type: businessTypeSchema.optional(),
  registration_number: z
    .string()
    .max(100, 'Número de registro no puede exceder 100 caracteres')
    .optional(),

  // Contact Information
  primary_contact_name: z
    .string()
    .min(2, 'Nombre de contacto debe tener al menos 2 caracteres')
    .max(200, 'Nombre de contacto no puede exceder 200 caracteres')
    .optional(),
  primary_contact_email: z
    .string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim()
    .optional()
    .or(z.literal('')),
  primary_contact_phone: colombianPhoneSchema,

  // Location
  address: z
    .string()
    .min(5, 'Dirección debe tener al menos 5 caracteres')
    .max(300, 'Dirección no puede exceder 300 caracteres')
    .optional(),
  city: z
    .string()
    .min(2, 'Ciudad debe tener al menos 2 caracteres')
    .max(100, 'Ciudad no puede exceder 100 caracteres')
    .optional(),
  administrative_division_1: z
    .string()
    .min(2, 'Departamento debe tener al menos 2 caracteres')
    .max(100, 'Departamento no puede exceder 100 caracteres')
    .optional(),

  // Product & Specialization
  product_categories: productCategoriesSchema,
  crop_specialization: cropSpecializationSchema,

  // Performance (optional, typically set by system)
  rating: z
    .number()
    .min(0, 'Calificación debe ser mayor o igual a 0')
    .max(5, 'Calificación debe ser menor o igual a 5')
    .optional(),
  delivery_reliability: z
    .number()
    .min(0, 'Confiabilidad debe ser mayor o igual a 0%')
    .max(100, 'Confiabilidad debe ser menor o igual a 100%')
    .optional(),
  quality_score: z
    .number()
    .min(0, 'Calidad debe ser mayor o igual a 0%')
    .max(100, 'Calidad debe ser menor o igual a 100%')
    .optional(),

  // Compliance
  certifications: z.array(certificationSchema).max(50).optional(),
  licenses: z.array(licenseSchema).max(20).optional(),

  // Financial
  payment_terms: z
    .string()
    .max(500, 'Términos de pago no pueden exceder 500 caracteres')
    .optional(),

  // Metadata
  notes: z
    .string()
    .max(2000, 'Notas no pueden exceder 2000 caracteres')
    .optional(),
});

// ============================================================================
// UPDATE SUPPLIER SCHEMA
// ============================================================================

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  is_approved: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// ============================================================================
// SUPPLIER FILTER SCHEMA
// ============================================================================

export const supplierFilterSchema = z.object({
  product_category: z.string().optional(),
  crop_specialization: z.string().optional(),
  is_approved: z.boolean().optional(),
  is_active: z.boolean().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
});

// ============================================================================
// SUPPLIER APPROVAL SCHEMA
// ============================================================================

export const approveSupplierSchema = z.object({
  supplier_id: z.string().min(1, 'ID de proveedor es requerido'),
  approved: z.boolean(),
  notes: z
    .string()
    .max(1000, 'Notas no pueden exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierFilterInput = z.infer<typeof supplierFilterSchema>;
export type ApproveSupplierInput = z.infer<typeof approveSupplierSchema>;
export type SupplierCertification = z.infer<typeof certificationSchema>;
export type SupplierLicense = z.infer<typeof licenseSchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;
