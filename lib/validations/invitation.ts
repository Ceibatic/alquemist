/**
 * Invitation Validation Schemas
 *
 * Zod schemas for user invitation management in Phase 2
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const invitationStatusSchema = z.enum(
  ['pending', 'accepted', 'rejected', 'expired'],
  {
    errorMap: () => ({ message: 'Estado de invitación inválido' }),
  }
);

// ============================================================================
// CREATE INVITATION SCHEMA
// ============================================================================

export const createInvitationSchema = z.object({
  email: z
    .string()
    .email('Correo electrónico inválido')
    .toLowerCase()
    .trim(),
  role_id: z.string().min(1, 'Debes seleccionar un rol'),
  facility_ids: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos una instalación')
    .max(50, 'No puedes seleccionar más de 50 instalaciones'),
  message: z
    .string()
    .max(1000, 'Mensaje no puede exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// BULK INVITATION SCHEMA
// ============================================================================

export const bulkInvitationSchema = z.object({
  invitations: z
    .array(
      z.object({
        email: z.string().email('Correo electrónico inválido').toLowerCase().trim(),
        role_id: z.string().min(1, 'Rol es requerido'),
        facility_ids: z.array(z.string()).min(1, 'Al menos una instalación es requerida'),
      })
    )
    .min(1, 'Debes agregar al menos una invitación')
    .max(100, 'No puedes enviar más de 100 invitaciones a la vez'),
  message: z
    .string()
    .max(1000, 'Mensaje no puede exceder 1000 caracteres')
    .optional(),
}).refine(
  (data) => {
    // Check for duplicate emails
    const emails = data.invitations.map((inv) => inv.email);
    const uniqueEmails = new Set(emails);
    return emails.length === uniqueEmails.size;
  },
  {
    message: 'No puedes enviar múltiples invitaciones al mismo correo electrónico',
    path: ['invitations'],
  }
);

// ============================================================================
// RESEND INVITATION SCHEMA
// ============================================================================

export const resendInvitationSchema = z.object({
  invitation_id: z.string().min(1, 'ID de invitación es requerido'),
  message: z
    .string()
    .max(1000, 'Mensaje no puede exceder 1000 caracteres')
    .optional(),
});

// ============================================================================
// CANCEL INVITATION SCHEMA
// ============================================================================

export const cancelInvitationSchema = z.object({
  invitation_id: z.string().min(1, 'ID de invitación es requerido'),
  reason: z
    .string()
    .max(500, 'Razón no puede exceder 500 caracteres')
    .optional(),
});

// ============================================================================
// ACCEPT INVITATION SCHEMA
// ============================================================================

// Password validation schema (reusable)
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos 1 letra mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos 1 número')
  .regex(
    /[^A-Za-z0-9]/,
    'Debe contener al menos 1 carácter especial (!@#$%^&*)'
  );

// Colombian phone validation (optional)
const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
  .optional()
  .or(z.literal(''));

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(1, 'Token de invitación es requerido'),
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
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema,
    preferred_language: z.enum(['es', 'en']).default('es'),
    timezone: z.string().default('America/Bogota'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// ============================================================================
// REJECT INVITATION SCHEMA
// ============================================================================

export const rejectInvitationSchema = z.object({
  token: z.string().min(1, 'Token de invitación es requerido'),
  reason: z
    .string()
    .max(500, 'Razón no puede exceder 500 caracteres')
    .optional(),
});

// ============================================================================
// INVITATION FILTER SCHEMA
// ============================================================================

export const invitationFilterSchema = z.object({
  status: invitationStatusSchema.optional(),
  role_id: z.string().optional(),
  facility_id: z.string().optional(),
  invited_by: z.string().optional(),
  search: z.string().optional(), // Search by email
  from_date: z.number().positive().optional(),
  to_date: z.number().positive().optional(),
}).refine(
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

// ============================================================================
// UPDATE INVITATION SCHEMA
// ============================================================================

export const updateInvitationSchema = z.object({
  invitation_id: z.string().min(1, 'ID de invitación es requerido'),
  role_id: z.string().min(1, 'Rol es requerido').optional(),
  facility_ids: z
    .array(z.string())
    .min(1, 'Al menos una instalación es requerida')
    .max(50, 'No puedes seleccionar más de 50 instalaciones')
    .optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type BulkInvitationInput = z.infer<typeof bulkInvitationSchema>;
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;
export type CancelInvitationInput = z.infer<typeof cancelInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitationInput = z.infer<typeof rejectInvitationSchema>;
export type InvitationFilterInput = z.infer<typeof invitationFilterSchema>;
export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;
export type InvitationStatus = z.infer<typeof invitationStatusSchema>;
