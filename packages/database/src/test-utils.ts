import { PrismaClient } from './generated/client/index.js'

// Create a test-specific Prisma instance
export const createTestPrisma = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace('alquemist_dev', 'alquemist_test'),
      },
    },
  })
}

// Clean database in dependency order
export async function cleanDatabase(prisma: PrismaClient) {
  // Disable foreign key checks temporarily (PostgreSQL)
  await prisma.$executeRaw`SET session_replication_role = 'replica';`

  // Clean in reverse dependency order
  await prisma.mediaFile.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.complianceEvent.deleteMany()
  await prisma.pestDiseaseRecord.deleteMany()
  await prisma.pestDisease.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.scheduledActivity.deleteMany()
  await prisma.plant.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.motherPlant.deleteMany()
  await prisma.productionOrder.deleteMany()
  await prisma.templateActivity.deleteMany()
  await prisma.templatePhase.deleteMany()
  await prisma.productionTemplate.deleteMany()
  await prisma.qualityCheckTemplate.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.cultivar.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.area.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  await prisma.cropType.deleteMany()
  await prisma.role.deleteMany()

  // Re-enable foreign key checks
  await prisma.$executeRaw`SET session_replication_role = 'origin';`
}

// Test data fixtures
export const testData = {
  validUser: {
    email: 'test@alquemist.local',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    identificationType: 'CC',
    identificationNumber: '1234567890',
  },
  validCompany: {
    name: 'Test Company S.A.S',
    legalName: 'Test Company Sociedad por Acciones Simplificada',
    taxId: '900000000-1',
    companyType: 'agricultor',
    businessEntityType: 'sas',
    defaultLocale: 'es',
    defaultCurrency: 'COP',
    defaultTimezone: 'America/Bogota',
  },
  validFacility: {
    name: 'Test Facility',
    licenseNumber: 'LIC-TEST-2025-001',
    licenseType: 'cultivo',
    facilityType: 'indoor',
    city: 'Bogotá',
    department: 'Cundinamarca',
    country: 'Colombia',
  },
  validArea: {
    name: 'Test Area',
    areaType: 'vegetation',
    lengthMeters: 10,
    widthMeters: 5,
    totalAreaM2: 50,
    usableAreaM2: 45,
  },
  validCropType: {
    name: 'test_crop',
    displayNameEs: 'Cultivo de Prueba',
    displayNameEn: 'Test Crop',
    defaultTrackingLevel: 'batch',
    complianceProfile: {},
    defaultPhases: [],
  },
  validCultivar: {
    name: 'Test Cultivar',
    varietyType: 'hybrid',
    characteristics: {
      growthPattern: 'medium',
      yieldPotential: 'high',
    },
  },
  validBatch: {
    qrCode: 'TST-BCH-001-20250101-001',
    batchType: 'seed',
    trackingLevel: 'batch',
    currentQuantity: 100,
    unitOfMeasure: 'plants',
  },
  validSupplier: {
    name: 'Test Supplier S.A.S',
    businessType: 'proveedor_semillas',
    city: 'Medellín',
    department: 'Antioquia',
    country: 'Colombia',
    productCategories: ['seeds', 'fertilizers'],
    cropSpecialization: ['cannabis', 'cafe'],
  },
}

// Helper to create a complete test company with users
export async function createTestCompany(prisma: PrismaClient) {
  // Create role first
  const role = await prisma.role.create({
    data: {
      name: 'test_admin',
      displayNameEs: 'Admin de Prueba',
      displayNameEn: 'Test Admin',
      level: 10,
      scopeLevel: 'company',
      permissions: {
        all: ['read', 'write', 'delete'],
      },
    },
  })

  // Create company
  const company = await prisma.company.create({
    data: testData.validCompany,
  })

  // Create user
  const user = await prisma.user.create({
    data: {
      ...testData.validUser,
      companyId: company.id,
      roleId: role.id,
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test', // Placeholder hash
    },
  })

  return { company, user, role }
}

// Helper to create a complete test facility with areas
export async function createTestFacility(
  prisma: PrismaClient,
  companyId: string,
  cropTypeId: string
) {
  const facility = await prisma.facility.create({
    data: {
      ...testData.validFacility,
      companyId,
      primaryCropTypeIds: [cropTypeId],
    },
  })

  const area = await prisma.area.create({
    data: {
      ...testData.validArea,
      facilityId: facility.id,
      compatibleCropTypeIds: [cropTypeId],
      currentCropTypeId: cropTypeId,
    },
  })

  return { facility, area }
}

// Helper to create a test crop type with cultivar
export async function createTestCrop(prisma: PrismaClient, supplierId?: string) {
  const cropType = await prisma.cropType.create({
    data: testData.validCropType,
  })

  const cultivar = await prisma.cultivar.create({
    data: {
      ...testData.validCultivar,
      cropTypeId: cropType.id,
      supplierId,
    },
  })

  return { cropType, cultivar }
}

// Wait for database to be ready
export async function waitForDatabase(
  prisma: PrismaClient,
  maxAttempts: number = 10,
  delayMs: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error('Failed to connect to database after', maxAttempts, 'attempts')
        return false
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
  return false
}
