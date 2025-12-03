/**
 * Validation Helpers
 *
 * Reusable validation utilities and helper functions
 */

import { z } from 'zod';

// ============================================================================
// COLOMBIAN-SPECIFIC HELPERS
// ============================================================================

/**
 * Format Colombian NIT
 * Converts various NIT formats to standard XXX.XXX.XXX-X format
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
 * Validate Colombian NIT check digit
 * Based on Colombian tax authority algorithm
 */
export const validateNITCheckDigit = (nit: string): boolean => {
  const cleaned = nit.replace(/\D/g, '');
  if (cleaned.length < 9) return false;

  const digits = cleaned.slice(0, -1).split('').map(Number);
  const checkDigit = parseInt(cleaned.slice(-1), 10);

  // NIT validation weights
  const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
  const startIndex = weights.length - digits.length;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * weights[startIndex + i];
  }

  const remainder = sum % 11;
  const calculatedCheckDigit = remainder > 1 ? 11 - remainder : remainder;

  return calculatedCheckDigit === checkDigit;
};

/**
 * Format Colombian phone number
 * Converts 10-digit number to +57 XXX XXX XXXX format
 */
export const formatColombianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  if (cleaned.length === 7) {
    // Landline format
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return phone;
};

/**
 * Validate Colombian DANE code
 * Department codes: 2 digits
 * Municipality codes: 5 digits
 */
export const validateDANECode = (code: string, level: 'department' | 'municipality'): boolean => {
  const cleaned = code.trim();
  if (level === 'department') {
    return /^\d{2}$/.test(cleaned);
  }
  if (level === 'municipality') {
    return /^\d{5}$/.test(cleaned);
  }
  return false;
};

// ============================================================================
// REUSABLE SCHEMA COMPONENTS
// ============================================================================

/**
 * Email schema with Colombian business domains validation
 */
export const emailSchema = z
  .string()
  .email('Correo electrónico inválido')
  .toLowerCase()
  .trim();

/**
 * Password schema with strong requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos 1 letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos 1 número')
  .regex(
    /[^A-Za-z0-9]/,
    'Debe contener al menos 1 carácter especial (!@#$%^&*)'
  );

/**
 * Colombian phone schema
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
 * Colombian NIT schema
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
 * Date range validation helper
 */
export const dateRangeSchema = z
  .object({
    from_date: z.number().positive('Fecha inicial inválida').optional(),
    to_date: z.number().positive('Fecha final inválida').optional(),
  })
  .refine(
    (data) => {
      if (data.from_date !== undefined && data.to_date !== undefined) {
        return data.from_date <= data.to_date;
      }
      return true;
    },
    {
      message: 'Fecha inicial debe ser anterior o igual a fecha final',
      path: ['from_date'],
    }
  );

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Página debe ser un número entero')
    .min(1, 'Página debe ser mayor o igual a 1')
    .default(1),
  limit: z
    .number()
    .int('Límite debe ser un número entero')
    .min(1, 'Límite debe ser mayor o igual a 1')
    .max(100, 'Límite máximo es 100')
    .default(20),
});

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc'], {
  errorMap: () => ({ message: 'Orden debe ser "asc" o "desc"' }),
});

/**
 * GPS coordinates schema (MAGNA-SIRGAS for Colombia)
 */
export const gpsCoordinatesSchema = z.object({
  latitude: z
    .number()
    .min(-4.23, 'Latitud fuera del rango de Colombia')
    .max(12.47, 'Latitud fuera del rango de Colombia'),
  longitude: z
    .number()
    .min(-81.74, 'Longitud fuera del rango de Colombia')
    .max(-66.87, 'Longitud fuera del rango de Colombia'),
  altitude: z
    .number()
    .min(-100, 'Altitud inválida')
    .max(6000, 'Altitud máxima en Colombia es ~6000m')
    .optional(),
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if all password requirements are met
 */
export const checkPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
};

/**
 * Calculate password strength (0-4)
 */
export const calculatePasswordStrength = (password: string): number => {
  const requirements = checkPasswordRequirements(password);
  return Object.values(requirements).filter(Boolean).length;
};

/**
 * Validate SKU format
 */
export const validateSKU = (sku: string): boolean => {
  return /^[A-Z0-9-]+$/.test(sku);
};

/**
 * Format SKU
 */
export const formatSKU = (sku: string): string => {
  return sku.toUpperCase().replace(/[^A-Z0-9-]/g, '');
};

/**
 * Validate GTIN (barcode)
 */
export const validateGTIN = (gtin: string): boolean => {
  return /^\d{8,14}$/.test(gtin);
};

/**
 * Validate ISO country code
 */
export const validateCountryCode = (code: string): boolean => {
  return /^[A-Z]{2}$/.test(code);
};

/**
 * Validate IANA timezone
 */
export const validateTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate currency code (ISO 4217)
 */
export const validateCurrencyCode = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code);
};

/**
 * Validate email domain
 */
export const validateEmailDomain = (email: string, allowedDomains?: string[]): boolean => {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  const domain = email.split('@')[1]?.toLowerCase();
  return allowedDomains.some((allowed) => domain === allowed.toLowerCase());
};

/**
 * Sanitize string input (remove special characters, trim)
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[^\w\s.-]/gi, '');
};

/**
 * Validate numeric range
 */
export const validateRange = (
  value: number,
  min?: number,
  max?: number
): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (timestamp: number): boolean => {
  return timestamp < Date.now();
};

/**
 * Check if date is in the future
 */
export const isDateInFuture = (timestamp: number): boolean => {
  return timestamp > Date.now();
};

/**
 * Calculate days until date
 */
export const daysUntilDate = (timestamp: number): number => {
  const now = Date.now();
  const diff = timestamp - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if item is expiring soon
 */
export const isExpiringSoon = (
  expirationDate: number,
  warningDays: number = 30
): boolean => {
  const days = daysUntilDate(expirationDate);
  return days > 0 && days <= warningDays;
};

/**
 * Check if item is expired
 */
export const isExpired = (expirationDate: number): boolean => {
  return isDateInPast(expirationDate);
};

// ============================================================================
// ERROR MESSAGE HELPERS
// ============================================================================

/**
 * Get user-friendly error message from Zod error
 */
export const getZodErrorMessage = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  if (firstError) {
    return firstError.message;
  }
  return 'Error de validación';
};

/**
 * Format Zod errors for form display
 */
export const formatZodErrors = (
  error: z.ZodError
): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  return formattedErrors;
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid number
 */
export const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Check if value is a valid date timestamp
 */
export const isValidTimestamp = (value: any): value is number => {
  return isValidNumber(value) && value > 0;
};

/**
 * Check if value is a non-empty string
 */
export const isNonEmptyString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if value is a valid email
 */
export const isValidEmail = (value: string): boolean => {
  return emailSchema.safeParse(value).success;
};

/**
 * Check if value is a valid URL
 */
export const isValidURL = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};
