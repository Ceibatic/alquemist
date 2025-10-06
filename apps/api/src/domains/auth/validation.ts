import { z } from 'zod'
import { BUSINESS_ENTITY_TYPES } from '@alquemist/types'

/**
 * Validation Schemas for Authentication
 *
 * Zod schemas for validating registration and login requests
 */

// Colombian departments (22 departments)
const COLOMBIAN_DEPARTMENTS = [
  'Antioquia',
  'Atlántico',
  'Bolívar',
  'Boyacá',
  'Caldas',
  'Caquetá',
  'Cauca',
  'Cesar',
  'Córdoba',
  'Cundinamarca',
  'Huila',
  'La Guajira',
  'Magdalena',
  'Meta',
  'Nariño',
  'Norte de Santander',
  'Putumayo',
  'Quindío',
  'Risaralda',
  'Santander',
  'Tolima',
  'Valle del Cauca'
] as const

// Registration schema
export const RegisterSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),

  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),

  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),

  companyName: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),

  businessEntityType: z.enum(BUSINESS_ENTITY_TYPES, {
    errorMap: () => ({ message: 'Tipo de entidad empresarial inválido' })
  }),

  department: z.enum(COLOMBIAN_DEPARTMENTS, {
    errorMap: () => ({ message: 'Departamento inválido' })
  }),

  municipality: z.string().optional()
})

// Login schema
export const LoginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'La contraseña es requerida')
})

// Type exports
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
