import { PrismaClient } from '@alquemist/database'

/**
 * Prisma Client Singleton
 *
 * Ensures only one instance of Prisma Client exists throughout the application.
 * This prevents connection pool exhaustion in development with hot reload.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
