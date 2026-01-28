/**
 * Settings Validation Schemas
 *
 * Zod schemas for facility settings, account settings, and notification preferences
 */

import { z } from 'zod';

// ============================================================================
// FACILITY SETTINGS SCHEMA
// ============================================================================

export const workdaySchema = z.enum(
  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  {
    errorMap: () => ({ message: 'Día de la semana inválido' }),
  }
);

// Time format validation (HH:MM in 24-hour format)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)');

export const facilitySettingsSchema = z
  .object({
    timezone: z
      .string()
      .min(1, 'Zona horaria es requerida')
      .default('America/Bogota'),
    workday_start: timeSchema.default('08:00'),
    workday_end: timeSchema.default('17:00'),
    workdays: z
      .array(workdaySchema)
      .min(1, 'Debes seleccionar al menos un día laboral')
      .max(7, 'No puedes seleccionar más de 7 días')
      .default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    default_activity_duration: z
      .number()
      .int('Duración debe ser un número entero')
      .min(5, 'Duración mínima es 5 minutos')
      .max(480, 'Duración máxima es 480 minutos (8 horas)')
      .default(60),
    auto_scheduling: z.boolean().default(false),
    notifications_enabled: z.boolean().default(true),
    low_stock_alert_enabled: z.boolean().default(true),
    overdue_activity_alert_enabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validate workday_end is after workday_start
      const [startHour, startMinute] = data.workday_start.split(':').map(Number);
      const [endHour, endMinute] = data.workday_end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      return endTime > startTime;
    },
    {
      message: 'Hora de fin debe ser posterior a hora de inicio',
      path: ['workday_end'],
    }
  );

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
// NOTIFICATION PREFERENCES SCHEMA
// ============================================================================

export const notificationPreferencesSchema = z.object({
  // Global toggles
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(false),

  // Specific notification types
  notification_types: z.object({
    low_stock: z.boolean().default(true),
    overdue_activities: z.boolean().default(true),
    compliance_alerts: z.boolean().default(true),
    system_updates: z.boolean().default(true),
    team_mentions: z.boolean().default(true),
    batch_status_changes: z.boolean().default(true),
    quality_check_reminders: z.boolean().default(true),
    harvest_reminders: z.boolean().default(true),
    license_expiration: z.boolean().default(true),
    pest_disease_alerts: z.boolean().default(true),
  }),

  // Notification delivery preferences
  notification_delivery: z.object({
    immediate: z.boolean().default(true),
    daily_digest: z.boolean().default(false),
    weekly_digest: z.boolean().default(false),
    digest_time: timeSchema.default('08:00'), // Time to send digests
  }),

  // Quiet hours
  quiet_hours_enabled: z.boolean().default(false),
  quiet_hours_start: timeSchema.default('20:00'),
  quiet_hours_end: timeSchema.default('08:00'),
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
// ALERT THRESHOLD SETTINGS SCHEMA
// ============================================================================

export const alertThresholdSettingsSchema = z.object({
  low_stock_threshold_percent: z
    .number()
    .int('Porcentaje debe ser un número entero')
    .min(1, 'Porcentaje mínimo es 1%')
    .max(50, 'Porcentaje máximo es 50%')
    .default(20),
  critical_stock_threshold_percent: z
    .number()
    .int('Porcentaje debe ser un número entero')
    .min(1, 'Porcentaje mínimo es 1%')
    .max(25, 'Porcentaje máximo es 25%')
    .default(10),
  expiring_soon_days: z
    .number()
    .int('Días debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(90, 'Máximo 90 días')
    .default(30),
  license_expiration_warning_days: z
    .number()
    .int('Días debe ser un número entero')
    .min(1, 'Mínimo 1 día')
    .max(365, 'Máximo 365 días')
    .default(90),
  overdue_activity_hours: z
    .number()
    .int('Horas debe ser un número entero')
    .min(1, 'Mínimo 1 hora')
    .max(168, 'Máximo 168 horas (7 días)')
    .default(24),
}).refine(
  (data) => {
    return data.critical_stock_threshold_percent < data.low_stock_threshold_percent;
  },
  {
    message: 'Umbral crítico debe ser menor que umbral bajo',
    path: ['critical_stock_threshold_percent'],
  }
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type FacilitySettingsInput = z.infer<typeof facilitySettingsSchema>;
export type AccountSettingsInput = z.infer<typeof accountSettingsSchema>;
export type UserProfileSettingsInput = z.infer<typeof userProfileSettingsSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AlertThresholdSettingsInput = z.infer<typeof alertThresholdSettingsSchema>;
export type Workday = z.infer<typeof workdaySchema>;
