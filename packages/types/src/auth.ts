/**
 * Authentication Types for Alquemist
 *
 * Shared types between frontend and backend for authentication flows
 */

// User interface (simplified for auth responses)
export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  companyId: string
  roleId: string
  locale: string
  timezone: string
  status: string
  createdAt: Date
}

// Company interface (simplified for auth responses)
export interface Company {
  id: string
  name: string
  businessEntityType: string | null
  colombianDepartment: string | null
  daneMunicipalityCode: string | null
  defaultLocale: string
  defaultCurrency: string
  defaultTimezone: string
  subscriptionPlan: string
  status: string
}

// Role interface
export interface Role {
  id: string
  name: string
  displayNameEs: string
  displayNameEn: string
  level: number
  permissions: any
}

// Session interface
export interface Session {
  id: string
  userId: string
  expiresAt: Date
}

// Colombian business entity types
export const BUSINESS_ENTITY_TYPES = [
  'SAS',  // S.A.S - Sociedad por Acciones Simplificada
  'SA',   // S.A. - Sociedad Anónima
  'LTDA', // Ltda - Sociedad Limitada
  'EU',   // E.U. - Empresa Unipersonal
  'PERSONA_NATURAL' // Persona Natural
] as const

export type BusinessEntityType = typeof BUSINESS_ENTITY_TYPES[number]

// Registration request payload
export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  companyName: string
  businessEntityType: BusinessEntityType
  department: string
  municipality?: string
}

// Login request payload
export interface LoginRequest {
  email: string
  password: string
}

// Auth response with user, company, and session
export interface AuthResponse {
  user: User
  company: Company
  role: Role
  session: Session
}

// Current user response (for /me endpoint)
export interface CurrentUserResponse {
  user: User
  company: Company
  role: Role
}
