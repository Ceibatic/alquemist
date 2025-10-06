/**
 * Validation Schemas
 * Zod schemas for forms - shared validation logic with backend
 */

import { z } from 'zod'

// Registration schema
export const RegisterSchema = z.object({
  firstName: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre es muy largo'),

  lastName: z.string()
    .min(1, 'El apellido es obligatorio')
    .max(100, 'El apellido es muy largo'),

  email: z.string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Correo electrónico inválido'),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es muy larga'),

  confirmPassword: z.string()
    .min(1, 'Debes confirmar tu contraseña'),

  companyName: z.string()
    .min(1, 'El nombre de la empresa es obligatorio')
    .max(200, 'El nombre de la empresa es muy largo'),

  businessEntityType: z.enum(['SAS', 'SA', 'LTDA', 'EU', 'PERSONA_NATURAL'], {
    errorMap: () => ({ message: 'Debes seleccionar un tipo de entidad' })
  }),

  department: z.string()
    .min(1, 'Debes seleccionar un departamento'),

  municipality: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export type RegisterFormData = z.infer<typeof RegisterSchema>

// Login schema
export const LoginSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Correo electrónico inválido'),

  password: z.string()
    .min(1, 'La contraseña es obligatoria')
})

export type LoginFormData = z.infer<typeof LoginSchema>
