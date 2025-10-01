// Export Prisma client and utilities
export * from './utils'
export * from './test-utils'
export { PrismaClient, Prisma } from './generated/client/index.js'

// Re-export commonly used types
export type {
  Company,
  User,
  Role,
  Facility,
  Area,
  CropType,
  Cultivar,
  Batch,
  Plant,
  MotherPlant,
  Activity,
  ScheduledActivity,
  ProductionOrder,
  ProductionTemplate,
  TemplatePhase,
  TemplateActivity,
  QualityCheckTemplate,
  Supplier,
  Product,
  InventoryItem,
  Recipe,
  PestDisease,
  PestDiseaseRecord,
  MediaFile,
  ComplianceEvent,
  Certificate,
} from './generated/client/index.js'
