import { beforeAll, afterAll, afterEach } from 'vitest'
import { PrismaClient } from '@alquemist/database'
import { cleanDatabase, waitForDatabase } from '@alquemist/database'

// Create test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.replace('alquemist_dev', 'alquemist_test'),
    },
  },
  log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
})

beforeAll(async () => {
  console.log('🧪 Setting up test database...')

  // Wait for database to be ready
  const isReady = await waitForDatabase(prisma, 10, 1000)

  if (!isReady) {
    throw new Error('Test database is not ready')
  }

  // Connect to test database
  await prisma.$connect()
  console.log('✅ Test database connected')

  // Ensure test database schema is up to date
  // In production, you might want to run migrations here
})

afterEach(async () => {
  // Clean database after each test to ensure isolation
  await cleanDatabase(prisma)
})

afterAll(async () => {
  console.log('🧹 Cleaning up test database...')
  await prisma.$disconnect()
  console.log('✅ Test database disconnected')
})

// Make prisma available globally in tests
;(global as any).testPrisma = prisma
