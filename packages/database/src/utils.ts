import { PrismaClient } from './generated/client/index.js'

// Prisma singleton instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database connection helpers
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to Alquemist database')
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw error
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
}

// Colombian timezone helper
export function toColombianTime(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Bogota' }))
}

// COP currency formatter
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Batch QR code generator
export function generateBatchQR(
  cropType: string,
  facilityCode: string,
  sequence: number
): string {
  const crop = cropType.toUpperCase().substring(0, 3)
  const date = new Date().toISOString().substring(2, 10).replace(/-/g, '')
  return `${crop}-BCH-${facilityCode}-${date}-${sequence.toString().padStart(3, '0')}`
}

// Plant QR code generator
export function generatePlantQR(
  cropType: string,
  batchQR: string,
  plantNumber: number
): string {
  const crop = cropType.toUpperCase().substring(0, 3)
  const batchId = batchQR.split('-')[2]
  return `${crop}-PLT-${batchId}-${plantNumber.toString().padStart(4, '0')}`
}

// Mother plant QR code generator
export function generateMotherPlantQR(
  cropType: string,
  facilityCode: string,
  sequence: number
): string {
  const crop = cropType.toUpperCase().substring(0, 3)
  const date = new Date().toISOString().substring(2, 10).replace(/-/g, '')
  return `${crop}-MOM-${facilityCode}-${date}-${sequence.toString().padStart(3, '0')}`
}

// Colombian DANE code validator
export function isValidDANECode(code: string): boolean {
  // DANE codes are 5 digits for municipalities, 2 for departments
  return /^\d{2,5}$/.test(code)
}

// Colombian NIT validator (basic)
export function isValidNIT(nit: string): boolean {
  // Basic NIT format: XXXXXXXXX-X
  return /^\d{9}-\d$/.test(nit)
}

// Convert Colombian peso to USD (approximate, should use real-time rates in production)
export function copToUsd(copAmount: number, exchangeRate: number = 4000): number {
  return copAmount / exchangeRate
}

// Calculate Colombian IVA (Value Added Tax)
export function calculateIVA(amount: number, rate: number = 0.19): number {
  return amount * rate
}

// Format Colombian phone number
export function formatColombianPhone(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Format as +57 XXX XXX XXXX
  if (cleaned.length === 10) {
    return `+57 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`
  }

  return phone
}

// Get Colombian department from DANE code
export function getDepartmentFromDANE(daneCode: string): string | null {
  const deptCode = daneCode.substring(0, 2)
  const departments: Record<string, string> = {
    '05': 'Antioquia',
    '08': 'Atlántico',
    '11': 'Bogotá D.C.',
    '13': 'Bolívar',
    '15': 'Boyacá',
    '17': 'Caldas',
    '18': 'Caquetá',
    '19': 'Cauca',
    '20': 'Cesar',
    '23': 'Córdoba',
    '25': 'Cundinamarca',
    '27': 'Chocó',
    '41': 'Huila',
    '44': 'La Guajira',
    '47': 'Magdalena',
    '50': 'Meta',
    '52': 'Nariño',
    '54': 'Norte de Santander',
    '63': 'Quindío',
    '66': 'Risaralda',
    '68': 'Santander',
    '70': 'Sucre',
    '73': 'Tolima',
    '76': 'Valle del Cauca',
    '81': 'Arauca',
    '85': 'Casanare',
    '86': 'Putumayo',
    '88': 'San Andrés',
    '91': 'Amazonas',
    '94': 'Guainía',
    '95': 'Guaviare',
    '97': 'Vaupés',
    '99': 'Vichada',
  }

  return departments[deptCode] || null
}
