/**
 * Settings Validation Schemas
 *
 * Zod schemas for account settings, user profile, and password change
 */

import { z } from 'zod';

// ============================================================================
// ACCOUNT SETTINGS SCHEMA
// ============================================================================

// Colombian NIT validation (reusable)
const nitSchema = z
  .string()
  .trim()
  .regex(
    /^(\d{3}\.\d{3}\.\d{3}-\d{1}|\d{9}-\d{1}|\d{9,10})$/,
    'NIT inválido. Formato: XXX.XXX.XXX-X o XXXXXXXXX-X'
  )
  .optional();

// Colombian phone validation (optional)
const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+57\s?\d{3}\s?\d{3}\s?\d{4}|3\d{2}\s?\d{3}\s?\d{4}|\d{3}\s?\d{4}|\d{10})$/,
    'Teléfono inválido. Formato: +57 XXX XXX XXXX o 3XX XXX XXXX'
  )
  .optional()
  .or(z.literal(''));

export const accountSettingsSchema = z.object({
  // Company Information
  company_name: z
    .string()
    .min(3, 'Nombre de empresa debe tener al menos 3 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .trim(),
  legal_name: z
    .string()
    .min(3, 'Razón social debe tener al menos 3 caracteres')
    .max(200, 'Razón social no puede exceder 200 caracteres')
    .trim()
    .optional(),
  tax_id: nitSchema,
  business_entity_type: z
    .enum(['S.A.S', 'S.A.', 'Ltda', 'E.U.', 'Persona Natural'])
    .optional(),
  business_registration_number: z
    .string()
    .max(100, 'Número de registro no puede exceder 100 caracteres')
    .optional(),

  // Contact Information
  primary_contact_name: z
    .string()
    .min(2, 'Nombre de contacto debe tener al menos 2 caracteres')
    .max(200, 'Nombre no puede exceder 200 caracteres')
    .optional(),
  primary_contact_email: z
    .string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim()
    .optional(),
  primary_contact_phone: phoneSchema,

  // Address
  address_line1: z
    .string()
    .min(5, 'Dirección debe tener al menos 5 caracteres')
    .max(200, 'Dirección no puede exceder 200 caracteres')
    .optional(),
  address_line2: z
    .string()
    .max(200, 'Dirección línea 2 no puede exceder 200 caracteres')
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
  postal_code: z
    .string()
    .max(20, 'Código postal no puede exceder 20 caracteres')
    .optional(),

  // Localization
  default_locale: z.enum(['es', 'en']).default('es'),
  default_currency: z.enum(['COP', 'USD', 'EUR']).default('COP'),
  default_timezone: z.string().default('America/Bogota'),
});

// ============================================================================
// USER PROFILE SETTINGS SCHEMA
// ============================================================================

export const userProfileSettingsSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede exceder 50 caracteres')
    .trim(),
  last_name: z
    .string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede exceder 50 caracteres')
    .trim(),
  phone: phoneSchema,
  identification_type: z
    .enum(['CC', 'CE', 'NIT', 'Passport'])
    .optional(),
  identification_number: z
    .string()
    .max(50, 'Número de identificación no puede exceder 50 caracteres')
    .optional(),

  // Preferences
  locale: z.enum(['es', 'en']).default('es'),
  timezone: z.string().default('America/Bogota'),
  date_format: z
    .enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
    .default('DD/MM/YYYY'),
  time_format: z.enum(['12h', '24h']).default('24h'),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  default_facility_id: z.string().optional(),
});

// ============================================================================
// PASSWORD CHANGE SCHEMA
// ============================================================================

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos 1 letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos 1 número')
  .regex(
    /[^A-Za-z0-9]/,
    'Debe contener al menos 1 carácter especial (!@#$%^&*)'
  );

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Contraseña actual es requerida'),
    new_password: passwordSchema,
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_new_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['new_password'],
  });

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type UserProfileSettingsInput = z.infer<typeof userProfileSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
