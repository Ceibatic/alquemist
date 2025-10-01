// Tipos base para Alquemist
export type Locale = 'es' | 'en'
export type Currency = 'COP' | 'USD'

// Tipos de cultivos
export type CropType = 'cannabis' | 'cafe' | 'cacao' | 'flores'

// Tipos de tracking
export type TrackingLevel = 'batch' | 'individual_plant'

// Tipos colombianos
export interface ColombianAddress {
  address: string
  city: string
  department: string
  municipality?: string
  daneCode?: string
  postalCode?: string
}

// Re-export tipos de Prisma
export type {
  Company,
  User,
  Facility,
  Batch,
  Activity
} from '@prisma/client'
