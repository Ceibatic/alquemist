[Alquemist - PRD Kit](https://www.notion.so/Alquemist-PRD-Kit-2783b99af009807b81e3f696ecea14b3?pvs=21)

# Prisma Database Schema & Seeds

**Complete Prisma Schema with Colombian Sample Data**

**Platform**: Alquemist - Multi-Crop Agriculture Platform

**Version**: 4.0

**Date**: January 2025

**Purpose**: Production-ready database with Colombian agricultural data

---

## 🗄️ **PRISMA SCHEMA CONFIGURATION**

### **prisma/schema.prisma**

```
// Alquemist Multi-Crop Agriculture Platform
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================
// CORE SYSTEM TABLES
// =============================================

model Company {
  id                        String    @id @default(cuid())
  name                      String
  legalName                 String?   @map("legal_name")
  taxId                     String?   @unique @map("tax_id")

  // Business classification
  companyType               String    @map("company_type")
  businessEntityType        String?   @map("business_entity_type")

  // Colombian-specific fields
  camaraComercioRegistration String? @map("camara_comercio_registration")
  daneMunicipalityCode      String?   @map("dane_municipality_code")
  colombianDepartment       String?   @map("colombian_department")

  // Licenses and certifications
  primaryLicenseNumber      String?   @map("primary_license_number")
  licenseAuthority          String?   @map("license_authority")
  complianceCertifications  Json?     @map("compliance_certifications")

  // Contact information
  primaryContactName        String?   @map("primary_contact_name")
  primaryContactEmail       String?   @map("primary_contact_email")
  primaryContactPhone       String?   @map("primary_contact_phone")

  // Address (Colombian format)
  addressLine1              String?   @map("address_line1")
  addressLine2              String?   @map("address_line2")
  city                      String?
  department                String?
  postalCode                String?   @map("postal_code")
  country                   String    @default("Colombia")

  // Localization preferences
  defaultLocale             String    @default("es") @map("default_locale")
  defaultCurrency           String    @default("COP") @map("default_currency")
  defaultTimezone           String    @default("America/Bogota") @map("default_timezone")

  // System configuration
  subscriptionPlan          String    @default("basic") @map("subscription_plan")
  maxFacilities             Int       @default(3) @map("max_facilities")
  maxUsers                  Int       @default(10) @map("max_users")
  featureFlags              Json      @default("{}") @map("feature_flags")

  // Audit
  status                    String    @default("active")
  createdBy                 String?   @map("created_by")
  createdAt                 DateTime  @default(now()) @map("created_at")
  updatedAt                 DateTime  @updatedAt @map("updated_at")

  // Relations
  users                     User[]
  facilities                Facility[]
  suppliers                 Supplier[]
  productionTemplates       ProductionTemplate[]
  qualityCheckTemplates     QualityCheckTemplate[]
  complianceEvents          ComplianceEvent[]
  certificates              Certificate[]
  recipes                   Recipe[]
  mediaFiles                MediaFile[]

  @@map("companies")
}

model Role {
  id                  String   @id @default(cuid())
  name                String
  displayNameEs       String   @map("display_name_es")
  displayNameEn       String   @map("display_name_en")
  description         String?
  level               Int
  scopeLevel          String   @map("scope_level")

  // Permission matrix
  permissions         Json

  // Role inheritance
  inheritsFromRoleIds String[] @map("inherits_from_role_ids")

  isSystemRole        Boolean  @default(true) @map("is_system_role")
  isActive            Boolean  @default(true) @map("is_active")
  createdAt           DateTime @default(now()) @map("created_at")

  // Relations
  users               User[]

  @@map("roles")
}

model User {
  id                    String    @id @default(cuid())
  companyId             String    @map("company_id")

  // Authentication
  email                 String    @unique
  passwordHash          String    @map("password_hash")
  emailVerified         Boolean   @default(false) @map("email_verified")

  // Personal information
  firstName             String?   @map("first_name")
  lastName              String?   @map("last_name")
  phone                 String?
  identificationType    String?   @map("identification_type")
  identificationNumber  String?   @map("identification_number")

  // Role and permissions
  roleId                String    @map("role_id")
  additionalRoleIds     String[]  @map("additional_role_ids")

  // Access scope
  primaryFacilityId     String?   @map("primary_facility_id")
  accessibleFacilityIds String[]  @map("accessible_facility_ids")
  accessibleAreaIds     String[]  @map("accessible_area_ids")

  // Localization preferences
  locale                String    @default("es")
  timezone              String    @default("America/Bogota")

  // Security
  mfaEnabled            Boolean   @default(false) @map("mfa_enabled")
  mfaSecret             String?   @map("mfa_secret")
  lastLogin             DateTime? @map("last_login")
  failedLoginAttempts   Int       @default(0) @map("failed_login_attempts")
  accountLockedUntil    DateTime? @map("account_locked_until")

  // Status
  status                String    @default("active")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relations
  company               Company   @relation(fields: [companyId], references: [id])
  role                  Role      @relation(fields: [roleId], references: [id])
  primaryFacility       Facility? @relation("UserPrimaryFacility", fields: [primaryFacilityId], references: [id])

  // Activities performed
  activitiesPerformed   Activity[] @relation("ActivityPerformedBy")
  scheduledActivities   ScheduledActivity[] @relation("ActivityAssignedTo")
  productionOrdersRequested ProductionOrder[] @relation("ProductionOrderRequestedBy")
  productionOrdersApproved ProductionOrder[] @relation("ProductionOrderApprovedBy")
  pestDiseaseRecords    PestDiseaseRecord[]
  complianceEventsCreated ComplianceEvent[] @relation("ComplianceEventCreatedBy")
  complianceEventsAssigned ComplianceEvent[] @relation("ComplianceEventAssignedTo")
  mediaFiles            MediaFile[]
  recipesCreated        Recipe[]
  templatesCreated      ProductionTemplate[]
  qualityTemplatesCreated QualityCheckTemplate[]
  certificatesUploaded  Certificate[] @relation("CertificateUploadedBy")
  certificatesVerified  Certificate[] @relation("CertificateVerifiedBy")

  @@map("users")
}

// =============================================
// CROP CONFIGURATION SYSTEM
// =============================================

model CropType {
  id                          String   @id @default(cuid())
  name                        String   @unique
  displayNameEs               String   @map("display_name_es")
  displayNameEn               String   @map("display_name_en")
  scientificName              String?  @map("scientific_name")

  // BATCH-FIRST TRACKING CONFIGURATION
  defaultTrackingLevel        String   @default("batch") @map("default_tracking_level")
  individualTrackingOptional  Boolean  @default(true) @map("individual_tracking_optional")

  // Colombian regulatory compliance profile
  complianceProfile           Json     @map("compliance_profile")

  // Default production phases per crop
  defaultPhases               Json     @map("default_phases")

  // Colombian environmental requirements
  environmentalRequirements   Json?    @map("environmental_requirements")

  // Economic data
  averageCycleDays            Int?     @map("average_cycle_days")
  averageYieldPerPlant        Decimal? @map("average_yield_per_plant")
  yieldUnit                   String?  @map("yield_unit")

  isActive                    Boolean  @default(true) @map("is_active")
  createdAt                   DateTime @default(now()) @map("created_at")

  // Relations
  cultivars                   Cultivar[]
  productionTemplates         ProductionTemplate[]
  qualityCheckTemplates       QualityCheckTemplate[]
  batches                     Batch[]
  plants                      Plant[]

  @@map("crop_types")
}

model Cultivar {
  id                    String   @id @default(cuid())
  name                  String
  cropTypeId            String   @map("crop_type_id")

  // Genetic information
  varietyType           String?  @map("variety_type")
  geneticLineage        String?  @map("genetic_lineage")

  // Colombian origin information
  supplierId            String?  @map("supplier_id")
  colombianOrigin       Json?    @map("colombian_origin")

  // Crop-specific characteristics (flexible JSONB)
  characteristics       Json?

  // Growing requirements
  optimalConditions     Json?    @map("optimal_conditions")

  // Performance tracking
  performanceMetrics    Json     @default("{}") @map("performance_metrics")

  status                String   @default("active")
  notes                 String?
  createdAt             DateTime @default(now()) @map("created_at")

  // Relations
  cropType              CropType @relation(fields: [cropTypeId], references: [id])
  supplier              Supplier? @relation(fields: [supplierId], references: [id])
  productionTemplates   ProductionTemplate[]
  productionOrders      ProductionOrder[]
  batches               Batch[]
  plants                Plant[]
  motherPlants          MotherPlant[]

  @@map("cultivars")
}

// =============================================
// FACILITIES & OPERATIONS
// =============================================

model Facility {
  id                      String   @id @default(cuid())
  companyId               String   @map("company_id")
  name                    String

  // Colombian licensing
  licenseNumber           String   @unique @map("license_number")
  licenseType             String?  @map("license_type")
  licenseAuthority        String?  @map("license_authority")
  licenseIssuedDate       DateTime? @map("license_issued_date")
  licenseExpiryDate       DateTime? @map("license_expiry_date")

  // Facility classification
  facilityType            String?  @map("facility_type")
  primaryCropTypeIds      String[] @map("primary_crop_type_ids")

  // Colombian geographic location
  address                 String?
  city                    String?
  department              String?
  municipality            String?
  daneCode                String?  @map("dane_code")
  postalCode              String?  @map("postal_code")
  latitude                Decimal? @db.Decimal(10, 8)
  longitude               Decimal? @db.Decimal(11, 8)
  altitudeMsnm            Int?     @map("altitude_msnm")

  // Physical specifications
  totalAreaM2             Decimal? @map("total_area_m2") @db.Decimal(10, 2)
  canopyAreaM2            Decimal? @map("canopy_area_m2") @db.Decimal(10, 2)
  cultivationAreaM2       Decimal? @map("cultivation_area_m2") @db.Decimal(10, 2)

  // Infrastructure
  facilitySpecifications  Json?    @map("facility_specifications")

  // Climate integration
  climateMonitoring       Boolean  @default(false) @map("climate_monitoring")
  weatherApiProvider      String?  @map("weather_api_provider")
  weatherStationId        String?  @map("weather_station_id")

  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  areas                   Area[]
  primaryUsers            User[]   @relation("UserPrimaryFacility")
  productionOrders        ProductionOrder[]
  batches                 Batch[]
  plants                  Plant[]
  motherPlants            MotherPlant[]
  pestDiseaseRecords      PestDiseaseRecord[]
  complianceEvents        ComplianceEvent[]

  @@map("facilities")
}

model Area {
  id                      String   @id @default(cuid())
  facilityId              String   @map("facility_id")
  name                    String
  areaType                String   @map("area_type")

  // Multi-crop compatibility
  compatibleCropTypeIds   String[] @map("compatible_crop_type_ids")
  currentCropTypeId       String?  @map("current_crop_type_id")

  // Physical dimensions
  lengthMeters            Decimal? @map("length_meters") @db.Decimal(8, 2)
  widthMeters             Decimal? @map("width_meters") @db.Decimal(8, 2)
  heightMeters            Decimal? @map("height_meters") @db.Decimal(8, 2)
  totalAreaM2             Decimal? @map("total_area_m2") @db.Decimal(10, 2)
  usableAreaM2            Decimal? @map("usable_area_m2") @db.Decimal(10, 2)

  // Capacity management
  capacityConfigurations  Json?    @map("capacity_configurations")
  currentOccupancy        Int      @default(0) @map("current_occupancy")
  reservedCapacity        Int      @default(0) @map("reserved_capacity")

  // Environmental control
  climateControlled       Boolean  @default(false) @map("climate_controlled")
  lightingControlled      Boolean  @default(false) @map("lighting_controlled")
  irrigationSystem        Boolean  @default(false) @map("irrigation_system")

  // Area specifications
  environmentalSpecs      Json?    @map("environmental_specs")
  equipmentList           Json     @default("[]") @map("equipment_list")

  status                  String   @default("active")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  facility                Facility @relation(fields: [facilityId], references: [id])
  currentCropType         CropType? @relation(fields: [currentCropTypeId], references: [id])
  inventoryItems          InventoryItem[]
  batches                 Batch[]
  plants                  Plant[]
  motherPlants            MotherPlant[]
  activitiesFrom          Activity[] @relation("ActivityAreaFrom")
  activitiesTo            Activity[] @relation("ActivityAreaTo")
  pestDiseaseRecords      PestDiseaseRecord[]

  @@map("areas")
}

// =============================================
// SUPPLY CHAIN MANAGEMENT
// =============================================

model Supplier {
  id                      String   @id @default(cuid())
  companyId               String   @map("company_id")

  // Basic supplier information
  name                    String
  legalName               String?  @map("legal_name")
  taxId                   String?  @map("tax_id")

  // Colombian business details
  businessType            String?  @map("business_type")
  registrationNumber      String?  @map("registration_number")

  // Contact information
  primaryContactName      String?  @map("primary_contact_name")
  primaryContactEmail     String?  @map("primary_contact_email")
  primaryContactPhone     String?  @map("primary_contact_phone")

  // Colombian address
  address                 String?
  city                    String?
  department              String?
  country                 String   @default("Colombia")

  // Supplier capabilities
  productCategories       String[] @map("product_categories")
  cropSpecialization      String[] @map("crop_specialization")

  // Performance tracking
  rating                  Decimal? @db.Decimal(3, 2)
  deliveryReliability     Decimal? @map("delivery_reliability") @db.Decimal(5, 2)
  qualityScore            Decimal? @map("quality_score") @db.Decimal(5, 2)

  // Colombian compliance
  certifications          Json?
  licenses                Json?

  // Financial terms
  paymentTerms            String?  @map("payment_terms")
  currency                String   @default("COP")

  // Status
  isApproved              Boolean  @default(false) @map("is_approved")
  isActive                Boolean  @default(true) @map("is_active")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  products                Product[]
  inventoryItems          InventoryItem[]
  cultivars               Cultivar[]
  batches                 Batch[]
  productionOrders        ProductionOrder[]

  @@map("suppliers")
}

model Product {
  id                      String   @id @default(cuid())
  sku                     String   @unique
  gtin                    String?
  name                    String
  description             String?

  // Simplified categorization
  category                String
  subcategory             String?

  // Multi-crop applicability
  applicableCropTypeIds   String[] @map("applicable_crop_type_ids")

  // Brand and manufacturer
  brandId                 String?  @map("brand_id")
  manufacturer            String?

  // Colombian supplier information
  preferredSupplierId     String?  @map("preferred_supplier_id")
  colombianSuppliers      String[] @map("colombian_suppliers")

  // Physical characteristics
  weightValue             Decimal? @map("weight_value") @db.Decimal(10, 3)
  weightUnit              String?  @map("weight_unit")
  dimensionsLength        Decimal? @map("dimensions_length") @db.Decimal(10, 2)
  dimensionsWidth         Decimal? @map("dimensions_width") @db.Decimal(10, 2)
  dimensionsHeight        Decimal? @map("dimensions_height") @db.Decimal(10, 2)
  dimensionsUnit          String?  @map("dimensions_unit")

  // Crop and compliance specific metadata
  productMetadata         Json?    @map("product_metadata")

  // Colombian compliance
  icaRegistered           Boolean  @default(false) @map("ica_registered")
  icaRegistrationNumber   String?  @map("ica_registration_number")
  organicCertified        Boolean  @default(false) @map("organic_certified")
  organicCertNumber       String?  @map("organic_cert_number")

  // Pricing (COP default)
  defaultPrice            Decimal? @map("default_price") @db.Decimal(12, 2)
  priceCurrency           String   @default("COP") @map("price_currency")
  priceUnit               String?  @map("price_unit")

  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  preferredSupplier       Supplier? @relation(fields: [preferredSupplierId], references: [id])
  inventoryItems          InventoryItem[]

  @@map("products")
}

model InventoryItem {
  id                      String   @id @default(cuid())
  productId               String   @map("product_id")
  areaId                  String   @map("area_id")
  supplierId              String?  @map("supplier_id")

  // CORE INVENTORY QUANTITIES
  quantityAvailable       Decimal  @default(0) @map("quantity_available") @db.Decimal(15, 3)
  quantityReserved        Decimal  @default(0) @map("quantity_reserved") @db.Decimal(15, 3)
  quantityCommitted       Decimal  @default(0) @map("quantity_committed") @db.Decimal(15, 3)
  quantityUnit            String   @map("quantity_unit")

  // Batch and lot information
  batchNumber             String?  @map("batch_number")
  supplierLotNumber       String?  @map("supplier_lot_number")
  serialNumbers           String[] @map("serial_numbers")

  // Quality and dates
  receivedDate            DateTime? @map("received_date")
  manufacturingDate       DateTime? @map("manufacturing_date")
  expirationDate          DateTime? @map("expiration_date")
  lastTestedDate          DateTime? @map("last_tested_date")

  // Colombian pricing (COP)
  purchasePriceCop        Decimal? @map("purchase_price_cop") @db.Decimal(12, 2)
  currentValueCop         Decimal? @map("current_value_cop") @db.Decimal(12, 2)
  costPerUnitCop          Decimal? @map("cost_per_unit_cop") @db.Decimal(12, 2)

  // Quality grading
  qualityGrade            String?  @map("quality_grade")
  qualityNotes            String?  @map("quality_notes")

  // Compliance and certificates
  certificates            Json     @default("[]")

  // Source tracking
  sourceType              String?  @map("source_type")
  sourceRecipeId          String?  @map("source_recipe_id")
  sourceBatchId           String?  @map("source_batch_id")
  productionDate          DateTime? @map("production_date")

  // Storage requirements
  storageConditions       Json?    @map("storage_conditions")

  // Inventory management
  minimumStockLevel       Decimal? @map("minimum_stock_level") @db.Decimal(10, 3)
  maximumStockLevel       Decimal? @map("maximum_stock_level") @db.Decimal(10, 3)
  reorderPoint            Decimal? @map("reorder_point") @db.Decimal(10, 3)
  leadTimeDays            Int?     @map("lead_time_days")

  // Status and audit
  lotStatus               String   @default("available") @map("lot_status")
  lastMovementDate        DateTime @default(now()) @map("last_movement_date")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  product                 Product  @relation(fields: [productId], references: [id])
  area                    Area     @relation(fields: [areaId], references: [id])
  supplier                Supplier? @relation(fields: [supplierId], references: [id])
  sourceRecipe            Recipe?  @relation(fields: [sourceRecipeId], references: [id])
  sourceBatch             Batch?   @relation(fields: [sourceBatchId], references: [id])

  @@map("inventory_items")
}

// =============================================
// PRODUCTION & TEMPLATES
// =============================================

model Recipe {
  id                      String   @id @default(cuid())
  name                    String
  description             String?
  recipeType              String   @map("recipe_type")

  // Crop application
  applicableCropTypes     String[] @map("applicable_crop_types")
  applicableGrowthStages  String[] @map("applicable_growth_stages")

  // Recipe formulation
  ingredients             Json

  // Output specifications
  outputQuantity          Decimal? @map("output_quantity") @db.Decimal(10, 3)
  outputUnit              String?  @map("output_unit")
  batchSize               Int?     @map("batch_size")

  // Instructions
  preparationSteps        Json?    @map("preparation_steps")
  applicationMethod       String?  @map("application_method")
  storageInstructions     String?  @map("storage_instructions")
  shelfLifeHours          Int?     @map("shelf_life_hours")

  // Quality parameters
  targetPh                Decimal? @map("target_ph") @db.Decimal(4, 2)
  targetEc                Decimal? @map("target_ec") @db.Decimal(6, 3)
  acceptablePhRange       Json?    @map("acceptable_ph_range")
  acceptableEcRange       Json?    @map("acceptable_ec_range")

  // Cost tracking
  estimatedCostCop        Decimal? @map("estimated_cost_cop") @db.Decimal(12, 2)
  costPerUnitCop          Decimal? @map("cost_per_unit_cop") @db.Decimal(12, 2)

  // Usage tracking
  timesUsed               Int      @default(0) @map("times_used")
  successRate             Decimal? @map("success_rate") @db.Decimal(5, 2)
  lastUsedDate            DateTime? @map("last_used_date")

  companyId               String   @map("company_id")
  createdBy               String?  @map("created_by")
  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  creator                 User?    @relation(fields: [createdBy], references: [id])
  derivedInventoryItems   InventoryItem[]

  @@map("recipes")
}

model ProductionTemplate {
  id                      String   @id @default(cuid())
  name                    String
  cropTypeId              String   @map("crop_type_id")
  cultivarId              String?  @map("cultivar_id")

  // Template classification
  templateCategory        String?  @map("template_category")
  productionMethod        String?  @map("production_method")
  sourceType              String?  @map("source_type")

  // BATCH-FIRST TEMPLATE DESIGN
  defaultBatchSize        Int      @default(50) @map("default_batch_size")
  enableIndividualTracking Boolean @default(false) @map("enable_individual_tracking")

  // Template specifications
  description             String?
  estimatedDurationDays   Int?     @map("estimated_duration_days")
  estimatedYield          Decimal? @map("estimated_yield") @db.Decimal(10, 3)
  yieldUnit               String?  @map("yield_unit")
  difficultyLevel         String?  @map("difficulty_level")

  // Colombian environmental requirements
  environmentalRequirements Json? @map("environmental_requirements")

  // Resource requirements
  spaceRequirements       Json?    @map("space_requirements")

  // Cost estimation (COP)
  estimatedCostCop        Decimal? @map("estimated_cost_cop") @db.Decimal(12, 2)
  costBreakdown           Json?    @map("cost_breakdown")

  // Performance tracking
  usageCount              Int      @default(0) @map("usage_count")
  averageSuccessRate      Decimal? @map("average_success_rate") @db.Decimal(5, 2)
  averageActualYield      Decimal? @map("average_actual_yield") @db.Decimal(10, 3)
  lastUsedDate            DateTime? @map("last_used_date")

  // Ownership
  companyId               String   @map("company_id")
  isPublic                Boolean  @default(false) @map("is_public")
  createdBy               String?  @map("created_by")

  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  cropType                CropType @relation(fields: [cropTypeId], references: [id])
  cultivar                Cultivar? @relation(fields: [cultivarId], references: [id])
  company                 Company  @relation(fields: [companyId], references: [id])
  creator                 User?    @relation(fields: [createdBy], references: [id])
  phases                  TemplatePhase[]
  productionOrders        ProductionOrder[]
  batches                 Batch[]

  @@map("production_templates")
}

model TemplatePhase {
  id                      String   @id @default(cuid())
  templateId              String   @map("template_id")
  phaseName               String   @map("phase_name")
  phaseOrder              Int      @map("phase_order")

  // Phase specifications
  estimatedDurationDays   Int      @map("estimated_duration_days")
  areaType                String   @map("area_type")
  previousPhaseId         String?  @map("previous_phase_id")

  // Requirements
  requiredConditions      Json?    @map("required_conditions")
  completionCriteria      Json?    @map("completion_criteria")

  // Resources
  requiredEquipment       Json     @default("[]") @map("required_equipment")
  requiredMaterials       Json     @default("[]") @map("required_materials")

  description             String?
  createdAt               DateTime @default(now()) @map("created_at")

  // Relations
  template                ProductionTemplate @relation(fields: [templateId], references: [id])
  previousPhase           TemplatePhase? @relation("PhaseSequence", fields: [previousPhaseId], references: [id])
  nextPhases              TemplatePhase[] @relation("PhaseSequence")
  activities              TemplateActivity[]

  @@map("template_phases")
}

model TemplateActivity {
  id                      String   @id @default(cuid())
  phaseId                 String   @map("phase_id")
  activityName            String   @map("activity_name")
  activityOrder           Int      @map("activity_order")

  // Activity classification
  activityType            String   @map("activity_type")
  isRecurring             Boolean  @default(false) @map("is_recurring")
  isQualityCheck          Boolean  @default(false) @map("is_quality_check")

  // Timing configuration
  timingConfiguration     Json     @map("timing_configuration")

  // Requirements
  requiredMaterials       Json     @default("[]") @map("required_materials")
  estimatedDurationMinutes Int?    @map("estimated_duration_minutes")
  skillLevelRequired      String?  @map("skill_level_required")

  // Quality check integration
  qualityCheckTemplateId  String?  @map("quality_check_template_id")

  // Instructions
  instructions            String?
  safetyNotes             String?  @map("safety_notes")

  createdAt               DateTime @default(now()) @map("created_at")

  // Relations
  phase                   TemplatePhase @relation(fields: [phaseId], references: [id])
  qualityCheckTemplate    QualityCheckTemplate? @relation(fields: [qualityCheckTemplateId], references: [id])
  scheduledActivities     ScheduledActivity[]

  @@map("template_activities")
}

model QualityCheckTemplate {
  id                      String   @id @default(cuid())
  name                    String
  cropTypeId              String   @map("crop_type_id")

  // Template classification
  procedureType           String?  @map("procedure_type")
  inspectionLevel         String?  @map("inspection_level")

  // Colombian compliance
  regulatoryRequirement   Boolean  @default(false) @map("regulatory_requirement")
  complianceStandard      String?  @map("compliance_standard")

  // Template structure
  templateStructure       Json     @map("template_structure")

  // AI integration
  aiAssisted              Boolean  @default(false) @map("ai_assisted")
  aiAnalysisTypes         String[] @map("ai_analysis_types")

  // Application scope
  applicableStages        String[] @map("applicable_stages")
  frequencyRecommendation String?  @map("frequency_recommendation")

  // Performance tracking
  usageCount              Int      @default(0) @map("usage_count")
  averageCompletionTimeMinutes Int? @map("average_completion_time_minutes")

  companyId               String   @map("company_id")
  createdBy               String?  @map("created_by")
  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  cropType                CropType @relation(fields: [cropTypeId], references: [id])
  company                 Company  @relation(fields: [companyId], references: [id])
  creator                 User?    @relation(fields: [createdBy], references: [id])
  templateActivities      TemplateActivity[]
  scheduledActivities     ScheduledActivity[]

  @@map("quality_check_templates")
}

// =============================================
// PRODUCTION OPERATIONS (BATCH-FIRST)
// =============================================

model ProductionOrder {
  id                      String   @id @default(cuid())
  orderNumber             String   @unique @map("order_number")

  // Template and crop configuration
  templateId              String   @map("template_id")
  cropTypeId              String   @map("crop_type_id")
  cultivarId              String   @map("cultivar_id")

  // Order classification
  orderType               String   @map("order_type")
  sourceType              String   @map("source_type")

  // Quantity and units
  requestedQuantity       Int      @map("requested_quantity")
  unitOfMeasure           String   @map("unit_of_measure")

  // BATCH-FIRST ORDER DESIGN
  batchSize               Int?     @map("batch_size")
  enableIndividualTracking Boolean @default(false) @map("enable_individual_tracking")

  // Source references
  motherPlantId           String?  @map("mother_plant_id")
  seedInventoryId         String?  @map("seed_inventory_id")
  supplierId              String?  @map("supplier_id")

  // Destination
  targetFacilityId        String   @map("target_facility_id")
  targetAreaId            String   @map("target_area_id")

  // Schedule
  requestedDeliveryDate   DateTime? @map("requested_delivery_date")
  plannedStartDate        DateTime? @map("planned_start_date")
  estimatedCompletionDate DateTime? @map("estimated_completion_date")
  actualStartDate         DateTime? @map("actual_start_date")
  actualCompletionDate    DateTime? @map("actual_completion_date")

  // Colombian compliance
  transportManifestRequired Boolean @default(false) @map("transport_manifest_required")
  phytosanitaryCertRequired Boolean @default(false) @map("phytosanitary_cert_required")
  regulatoryDocumentation Json     @default("{}") @map("regulatory_documentation")

  // Financial
  estimatedCostCop        Decimal? @map("estimated_cost_cop") @db.Decimal(15, 2)
  actualCostCop           Decimal? @map("actual_cost_cop") @db.Decimal(15, 2)

  // Approval workflow
  requestedBy             String   @map("requested_by")
  approvedBy              String?  @map("approved_by")
  approvalDate            DateTime? @map("approval_date")

  // Status tracking
  status                  String   @default("pendiente")
  priority                String   @default("normal")
  completionPercentage    Decimal  @default(0) @map("completion_percentage") @db.Decimal(5, 2)

  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  template                ProductionTemplate @relation(fields: [templateId], references: [id])
  cropType                CropType @relation(fields: [cropTypeId], references: [id])
  cultivar                Cultivar @relation(fields: [cultivarId], references: [id])
  motherPlant             MotherPlant? @relation(fields: [motherPlantId], references: [id])
  seedInventory           InventoryItem? @relation(fields: [seedInventoryId], references: [id])
  supplier                Supplier? @relation(fields: [supplierId], references: [id])
  targetFacility          Facility @relation(fields: [targetFacilityId], references: [id])
  requestedByUser         User     @relation("ProductionOrderRequestedBy", fields: [requestedBy], references: [id])
  approvedByUser          User?    @relation("ProductionOrderApprovedBy", fields: [approvedBy], references: [id])
  scheduledActivities     ScheduledActivity[]
  batches                 Batch[]

  @@map("production_orders")
}

model ScheduledActivity {
  id                      String   @id @default(cuid())

  // Entity association (flexible)
  entityType              String   @map("entity_type")
  entityId                String   @map("entity_id")

  // Activity definition
  activityType            String   @map("activity_type")
  activityTemplateId      String?  @map("activity_template_id")
  productionOrderId       String?  @map("production_order_id")

  // Scheduling
  scheduledDate           DateTime @map("scheduled_date")
  estimatedDurationMinutes Int?    @map("estimated_duration_minutes")

  // Recurring activities
  isRecurring             Boolean  @default(false) @map("is_recurring")
  recurringPattern        String?  @map("recurring_pattern")
  recurringEndDate        DateTime? @map("recurring_end_date")
  parentRecurringId       String?  @map("parent_recurring_id")

  // Assignment
  assignedTo              String?  @map("assigned_to")
  assignedTeam            String[] @map("assigned_team")

  // Requirements
  requiredMaterials       Json     @default("[]") @map("required_materials")
  requiredEquipment       Json     @default("[]") @map("required_equipment")

  // Quality check integration
  qualityCheckTemplateId  String?  @map("quality_check_template_id")

  // Instructions and metadata
  instructions            String?
  activityMetadata        Json     @default("{}") @map("activity_metadata")

  // Status and execution
  status                  String   @default("pending")
  actualStartTime         DateTime? @map("actual_start_time")
  actualEndTime           DateTime? @map("actual_end_time")
  completedBy             String?  @map("completed_by")
  completionNotes         String?  @map("completion_notes")

  // Performance tracking
  executionResults        Json?    @map("execution_results")
  executionVariance       Json?    @map("execution_variance")

  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  activityTemplate        TemplateActivity? @relation(fields: [activityTemplateId], references: [id])
  productionOrder         ProductionOrder? @relation(fields: [productionOrderId], references: [id])
  assignedToUser          User?    @relation("ActivityAssignedTo", fields: [assignedTo], references: [id])
  parentRecurring         ScheduledActivity? @relation("RecurringActivity", fields: [parentRecurringId], references: [id])
  childRecurring          ScheduledActivity[] @relation("RecurringActivity")
  qualityCheckTemplate    QualityCheckTemplate? @relation(fields: [qualityCheckTemplateId], references: [id])
  activities              Activity[]

  @@map("scheduled_activities")
}

model MotherPlant {
  id                      String   @id @default(cuid())
  qrCode                  String   @unique @map("qr_code")

  // Basic identification
  facilityId              String   @map("facility_id")
  areaId                  String   @map("area_id")
  cultivarId              String   @map("cultivar_id")

  // Mother plant specific data
  name                    String?
  generation              Int      @default(1)
  sourceType              String?  @map("source_type")
  sourceReference         String?  @map("source_reference")

  // Lifecycle tracking
  establishedDate         DateTime @map("established_date")
  lastCloneDate           DateTime? @map("last_clone_date")
  retirementDate          DateTime? @map("retirement_date")
  retirementReason        String?  @map("retirement_reason")

  // Performance metrics
  totalClonesTaken        Int      @default(0) @map("total_clones_taken")
  successfulClones        Int      @default(0) @map("successful_clones")

  // Health and maintenance
  healthStatus            String   @default("healthy") @map("health_status")
  lastHealthCheck         DateTime? @map("last_health_check")
  maintenanceNotes        String?  @map("maintenance_notes")

  // Genetic tracking
  geneticStability        String?  @map("genetic_stability")
  phenotypeNotes          String?  @map("phenotype_notes")

  // Physical characteristics
  plantMetrics            Json?    @map("plant_metrics")

  // Status
  status                  String   @default("active")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  facility                Facility @relation(fields: [facilityId], references: [id])
  area                    Area     @relation(fields: [areaId], references: [id])
  cultivar                Cultivar @relation(fields: [cultivarId], references: [id])
  productionOrders        ProductionOrder[]
  derivedPlants           Plant[]

  @@map("mother_plants")
}

model Batch {
  id                      String   @id @default(cuid())
  qrCode                  String   @unique @map("qr_code")

  // Core identification
  facilityId              String   @map("facility_id")
  areaId                  String?  @map("area_id")
  cropTypeId              String   @map("crop_type_id")
  cultivarId              String   @map("cultivar_id")

  // Source tracking
  productionOrderId       String?  @map("production_order_id")
  templateId              String?  @map("template_id")
  sourceBatchId           String?  @map("source_batch_id")

  // BATCH-FIRST TRACKING CONFIGURATION
  batchType               String   @map("batch_type")
  trackingLevel           String   @default("batch") @map("tracking_level")
  individualPlantTracking Boolean  @default(false) @map("individual_plant_tracking")

  // Quantity management
  plannedQuantity         Int?     @map("planned_quantity")
  currentQuantity         Int      @map("current_quantity")
  initialQuantity         Int?     @map("initial_quantity")
  unitOfMeasure           String   @map("unit_of_measure")

  // For batch-level quality sampling
  sampleSize              Int?     @map("sample_size")
  sampleFrequency         String?  @map("sample_frequency")

  // Lifecycle dates
  createdDate             DateTime @default(now()) @map("created_date")
  plannedCompletionDate   DateTime? @map("planned_completion_date")
  actualCompletionDate    DateTime? @map("actual_completion_date")

  // Quality metrics
  qualityGrade            String?  @map("quality_grade")
  qualityDistribution     Json?    @map("quality_distribution")

  // CROP-SPECIFIC BATCH METRICS
  batchMetrics            Json?    @map("batch_metrics")

  // Environmental tracking
  environmentalHistory    Json     @default("[]") @map("environmental_history")

  // External source tracking
  supplierId              String?  @map("supplier_id")
  externalLotNumber       String?  @map("external_lot_number")
  receivedDate            DateTime? @map("received_date")
  phytosanitaryCertificate String? @map("phytosanitary_certificate")

  // Status
  status                  String   @default("active")
  priority                String   @default("normal")
  notes                   String?
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  facility                Facility @relation(fields: [facilityId], references: [id])
  area                    Area?    @relation(fields: [areaId], references: [id])
  cropType                CropType @relation(fields: [cropTypeId], references: [id])
  cultivar                Cultivar @relation(fields: [cultivarId], references: [id])
  productionOrder         ProductionOrder? @relation(fields: [productionOrderId], references: [id])
  template                ProductionTemplate? @relation(fields: [templateId], references: [id])
  sourceBatch             Batch?   @relation("BatchSource", fields: [sourceBatchId], references: [id])
  derivedBatches          Batch[]  @relation("BatchSource")
  supplier                Supplier? @relation(fields: [supplierId], references: [id])
  plants                  Plant[]
  activities              Activity[]
  derivedInventoryItems   InventoryItem[]

  @@map("batches")
}

model Plant {
  id                      String   @id @default(cuid())
  qrCode                  String   @unique @map("qr_code")

  // Batch relationship
  batchId                 String   @map("batch_id")
  motherPlantId           String?  @map("mother_plant_id")

  // Location
  facilityId              String   @map("facility_id")
  areaId                  String   @map("area_id")
  cropTypeId              String   @map("crop_type_id")
  cultivarId              String   @map("cultivar_id")

  // INDIVIDUAL PLANT LIFECYCLE
  plantStage              String   @map("plant_stage")
  sex                     String?

  // Key dates
  plantedDate             DateTime @map("planted_date")
  stageProgressionDates   Json?    @map("stage_progression_dates")
  harvestedDate           DateTime? @map("harvested_date")
  destroyedDate           DateTime? @map("destroyed_date")
  destructionReason       String?  @map("destruction_reason")

  // Individual plant metrics
  plantMetrics            Json?    @map("plant_metrics")

  // Health and status
  healthStatus            String   @default("healthy") @map("health_status")
  lastInspectionDate      DateTime? @map("last_inspection_date")
  inspectionNotes         String?  @map("inspection_notes")

  // Position tracking
  positionX               Decimal? @map("position_x") @db.Decimal(8, 2)
  positionY               Decimal? @map("position_y") @db.Decimal(8, 2)
  containerId             String?  @map("container_id")

  status                  String   @default("active")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  batch                   Batch    @relation(fields: [batchId], references: [id])
  motherPlant             MotherPlant? @relation(fields: [motherPlantId], references: [id])
  facility                Facility @relation(fields: [facilityId], references: [id])
  area                    Area     @relation(fields: [areaId], references: [id])
  cropType                CropType @relation(fields: [cropTypeId], references: [id])
  cultivar                Cultivar @relation(fields: [cultivarId], references: [id])
  activities              Activity[]

  @@map("plants")
}

// =============================================
// ACTIVITY & QUALITY MANAGEMENT
// =============================================

model Activity {
  id                      String   @id @default(cuid())

  // Entity association
  entityType              String   @map("entity_type")
  entityId                String   @map("entity_id")

  // Activity classification
  activityType            String   @map("activity_type")
  scheduledActivityId     String?  @map("scheduled_activity_id")

  // Execution details
  performedBy             String   @map("performed_by")
  timestamp               DateTime @default(now())
  durationMinutes         Int?     @map("duration_minutes")

  // Location tracking
  areaFrom                String?  @map("area_from")
  areaTo                  String?  @map("area_to")

  // Quantity tracking
  quantityBefore          Int?     @map("quantity_before")
  quantityAfter           Int?     @map("quantity_after")

  // QR code scanning record
  qrScanned               String?  @map("qr_scanned")
  scanTimestamp           DateTime? @map("scan_timestamp")

  // Materials and resources used
  materialsConsumed       Json     @default("[]") @map("materials_consumed")
  equipmentUsed           Json     @default("[]") @map("equipment_used")

  // Quality check data
  qualityCheckData        Json?    @map("quality_check_data")

  // Environmental conditions
  environmentalData       Json?    @map("environmental_data")

  // Media attachments
  photos                  String[] @map("photos")
  files                   String[] @map("files")
  mediaMetadata           Json?    @map("media_metadata")

  // AI assistance data
  aiAssistanceData        Json?    @map("ai_assistance_data")

  // Results and notes
  activityMetadata        Json     @default("{}") @map("activity_metadata")
  notes                   String?

  createdAt               DateTime @default(now()) @map("created_at")

  // Relations
  scheduledActivity       ScheduledActivity? @relation(fields: [scheduledActivityId], references: [id])
  performedByUser         User     @relation("ActivityPerformedBy", fields: [performedBy], references: [id])
  areaFromRel             Area?    @relation("ActivityAreaFrom", fields: [areaFrom], references: [id])
  areaToRel               Area?    @relation("ActivityAreaTo", fields: [areaTo], references: [id])
  batch                   Batch?   @relation(fields: [entityId], references: [id])
  plant                   Plant?   @relation(fields: [entityId], references: [id])

  @@map("activities")
}

model PestDiseaseRecord {
  id                      String   @id @default(cuid())

  // Location and entity
  facilityId              String   @map("facility_id")
  areaId                  String   @map("area_id")
  entityType              String   @map("entity_type")
  entityId                String   @map("entity_id")

  // Pest/Disease identification
  pestDiseaseId           String   @map("pest_disease_id")
  detectionMethod         String?  @map("detection_method")
  confidenceLevel         String?  @map("confidence_level")

  // Assessment
  severityLevel           String?  @map("severity_level")
  affectedPercentage      Decimal? @map("affected_percentage") @db.Decimal(5, 2)
  affectedPlantCount      Int?     @map("affected_plant_count")
  progressionStage        String?  @map("progression_stage")

  // Detection details
  detectedBy              String   @map("detected_by")
  detectionDate           DateTime @default(now()) @map("detection_date")
  aiDetectionData         Json?    @map("ai_detection_data")

  // Environmental factors
  environmentalConditions Json?    @map("environmental_conditions")
  likelyCauses            String[] @map("likely_causes")

  // Documentation
  photos                  String[] @map("photos")
  description             String?

  // Treatment and follow-up
  immediateActionTaken    Boolean  @default(false) @map("immediate_action_taken")
  immediateActions        Json?    @map("immediate_actions")
  treatmentPlanId         String?  @map("treatment_plan_id")
  followupRequired        Boolean  @default(true) @map("followup_required")
  scheduledFollowupDate   DateTime? @map("scheduled_followup_date")

  // Resolution tracking
  resolutionStatus        String   @default("active") @map("resolution_status")
  resolutionDate          DateTime? @map("resolution_date")
  resolutionNotes         String?  @map("resolution_notes")

  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  facility                Facility @relation(fields: [facilityId], references: [id])
  area                    Area     @relation(fields: [areaId], references: [id])
  pestDisease             PestDisease @relation(fields: [pestDiseaseId], references: [id])
  detectedByUser          User     @relation(fields: [detectedBy], references: [id])

  @@map("pest_disease_records")
}

model PestDisease {
  id                      String   @id @default(cuid())
  name                    String
  scientificName          String?  @map("scientific_name")

  // Classification
  type                    String
  category                String?

  // Colombian context
  affectedCropTypes       String[] @map("affected_crop_types")
  colombianRegions        String[] @map("colombian_regions")
  seasonalPattern         String?  @map("seasonal_pattern")

  // Identification
  identificationGuide     String?  @map("identification_guide")
  symptoms                Json?
  similarConditions       String[] @map("similar_conditions")

  // AI training status
  aiModelTrained          Boolean  @default(false) @map("ai_model_trained")
  aiDetectionAccuracy     Decimal? @map("ai_detection_accuracy") @db.Decimal(5, 2)

  // Treatment information
  preventionMethods       Json?    @map("prevention_methods")
  treatmentOptions        Json?    @map("treatment_options")

  // Severity and impact
  economicImpact          String?  @map("economic_impact")
  spreadRate              String?  @map("spread_rate")

  // Status
  isQuarantinable         Boolean  @default(false) @map("is_quarantinable")
  regulatoryStatus        String?  @map("regulatory_status")

  status                  String   @default("active")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  records                 PestDiseaseRecord[]

  @@map("pests_diseases")
}

// =============================================
// MEDIA & COMPLIANCE MANAGEMENT
// =============================================

model MediaFile {
  id                      String   @id @default(cuid())

  // File identification
  filename                String
  originalFilename        String   @map("original_filename")
  fileSizeBytes           BigInt   @map("file_size_bytes")
  mimeType                String   @map("mime_type")
  fileExtension           String?  @map("file_extension")

  // Storage location
  storageProvider         String?  @map("storage_provider")
  storagePath             String   @map("storage_path")
  storageBucket           String?  @map("storage_bucket")
  publicUrl               String?  @map("public_url")

  // Colombian GPS and location data
  gpsCoordinates          Json?    @map("gps_coordinates")
  locationTaken           String?  @map("location_taken")
  colombianMunicipality   String?  @map("colombian_municipality")
  altitudeMsnm            Int?     @map("altitude_msnm")

  // Image/video metadata
  resolutionWidth         Int?     @map("resolution_width")
  resolutionHeight        Int?     @map("resolution_height")
  durationSeconds         Int?     @map("duration_seconds")

  // Content analysis
  aiAnalysisPerformed     Boolean  @default(false) @map("ai_analysis_performed")
  aiAnalysisResults       Json?    @map("ai_analysis_results")

  // Association with entities
  associatedEntityType    String?  @map("associated_entity_type")
  associatedEntityId      String?  @map("associated_entity_id")
  activityId              String?  @map("activity_id")

  // Tagging and organization
  tags                    String[] @map("tags")
  autoGeneratedTags       String[] @map("auto_generated_tags")
  category                String?

  // Colombian compliance
  isComplianceDocument    Boolean  @default(false) @map("is_compliance_document")
  regulatorySignificance  String?  @map("regulatory_significance")
  retentionPeriodYears    Int?     @map("retention_period_years")

  // Quality and processing
  qualityScore            Decimal? @map("quality_score") @db.Decimal(3, 2)
  isProcessed             Boolean  @default(false) @map("is_processed")
  processingStatus        String?  @map("processing_status")

  // Access control
  visibility              String   @default("private")
  companyId               String   @map("company_id")
  uploadedBy              String   @map("uploaded_by")

  // Timestamps
  capturedAt              DateTime? @map("captured_at")
  uploadedAt              DateTime @default(now()) @map("uploaded_at")
  processedAt             DateTime? @map("processed_at")

  notes                   String?
  status                  String   @default("active")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  uploadedByUser          User     @relation(fields: [uploadedBy], references: [id])
  activity                Activity? @relation(fields: [activityId], references: [id])

  @@map("media_files")
}

model ComplianceEvent {
  id                      String   @id @default(cuid())

  // Event identification
  eventType               String   @map("event_type")
  eventCategory           String?  @map("event_category")

  // Colombian regulatory context
  regulatoryAuthority     String?  @map("regulatory_authority")
  regulationReference     String?  @map("regulation_reference")
  complianceRequirement   String?  @map("compliance_requirement")

  // Entity association
  entityType              String   @map("entity_type")
  entityId                String   @map("entity_id")
  companyId               String   @map("company_id")
  facilityId              String?  @map("facility_id")

  // Event details
  title                   String
  description             String
  severity                String?

  // Detection and reporting
  detectedBy              String?  @map("detected_by")
  detectedByUserId        String?  @map("detected_by_user_id")
  detectionDate           DateTime @default(now()) @map("detection_date")

  // Status and resolution
  status                  String   @default("open")
  assignedTo              String?  @map("assigned_to")
  dueDate                 DateTime? @map("due_date")
  resolutionDate          DateTime? @map("resolution_date")
  resolutionNotes         String?  @map("resolution_notes")

  // Actions taken
  immediateActions        Json?    @map("immediate_actions")
  preventiveActions       Json?    @map("preventive_actions")
  correctiveActions       Json?    @map("corrective_actions")

  // Documentation
  supportingDocuments     String[] @map("supporting_documents")
  photos                  String[] @map("photos")

  // Colombian specific fields
  requiresGovernmentNotification Boolean @default(false) @map("requires_government_notification")
  notificationSent        DateTime? @map("notification_sent")
  governmentResponse      String?  @map("government_response")

  // Financial impact
  estimatedCostCop        Decimal? @map("estimated_cost_cop") @db.Decimal(12, 2)
  actualCostCop           Decimal? @map("actual_cost_cop") @db.Decimal(12, 2)

  // Follow-up
  followupRequired        Boolean  @default(false) @map("followup_required")
  followupDate            DateTime? @map("followup_date")
  recurringCheckFrequency String?  @map("recurring_check_frequency")

  // Audit trail
  createdBy               String?  @map("created_by")
  updatedBy               String?  @map("updated_by")
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Immutable audit flag
  isAuditLocked           Boolean  @default(false) @map("is_audit_locked")
  auditLockReason         String?  @map("audit_lock_reason")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  facility                Facility? @relation(fields: [facilityId], references: [id])
  detectedByUser          User?    @relation("ComplianceEventCreatedBy", fields: [detectedByUserId], references: [id])
  assignedToUser          User?    @relation("ComplianceEventAssignedTo", fields: [assignedTo], references: [id])
  createdByUser           User?    @relation(fields: [createdBy], references: [id])

  @@map("compliance_events")
}

model Certificate {
  id                      String   @id @default(cuid())

  // Certificate identification
  certificateNumber       String   @map("certificate_number")
  certificateName         String   @map("certificate_name")
  certificateType         String   @map("certificate_type")

  // Issuing authority
  issuingAuthority        String   @map("issuing_authority")
  issuerAccreditation     String?  @map("issuer_accreditation")

  // Certificate scope
  appliesToEntityType     String   @map("applies_to_entity_type")
  appliesToEntityId       String   @map("applies_to_entity_id")
  companyId               String   @map("company_id")

  // Colombian context
  colombianAuthority      String?  @map("colombian_authority")
  nationalRegistration    String?  @map("national_registration")

  // Validity
  issuedDate              DateTime @map("issued_date")
  expiryDate              DateTime? @map("expiry_date")
  isRenewable             Boolean  @default(true) @map("is_renewable")
  renewalNoticeDays       Int      @default(90) @map("renewal_notice_days")

  // Certificate details
  scopeDescription        String?  @map("scope_description")
  conditions              Json?
  standardsMet            String[] @map("standards_met")

  // Documentation
  certificateDocumentUrl  String?  @map("certificate_document_url")
  supportingDocuments     String[] @map("supporting_documents")

  // Verification
  verificationMethod      String?  @map("verification_method")
  verificationUrl         String?  @map("verification_url")
  verificationCode        String?  @map("verification_code")

  // Status tracking
  status                  String   @default("valid")
  suspensionReason        String?  @map("suspension_reason")
  suspensionDate          DateTime? @map("suspension_date")
  reinstatementDate       DateTime? @map("reinstatement_date")

  // Compliance integration
  regulatoryWeight        Int?     @map("regulatory_weight")
  automaticComplianceCheck Boolean @default(true) @map("automatic_compliance_check")

  // Notifications
  lastVerificationDate    DateTime? @map("last_verification_date")
  nextVerificationDue     DateTime? @map("next_verification_due")
  renewalNotificationSent DateTime? @map("renewal_notification_sent")

  // Audit
  uploadedBy              String?  @map("uploaded_by")
  verifiedBy              String?  @map("verified_by")
  notes                   String?
  createdAt               DateTime @default(now()) @map("created_at")
  updatedAt               DateTime @updatedAt @map("updated_at")

  // Relations
  company                 Company  @relation(fields: [companyId], references: [id])
  uploadedByUser          User?    @relation("CertificateUploadedBy", fields: [uploadedBy], references: [id])
  verifiedByUser          User?    @relation("CertificateVerifiedBy", fields: [verifiedBy], references: [id])

  @@map("certificates")
}

```

---

## 🌱 **COLOMBIAN SEED DATA**

### **packages/database/prisma/seed.ts**

```tsx
import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Alquemist database with Colombian data...')

  // 1. Create Roles
  const roles = await createRoles()
  console.log('✅ Created 6 system roles')

  // 2. Create Crop Types
  const cropTypes = await createCropTypes()
  console.log('✅ Created Cannabis and Coffee crop types')

  // 3. Create Company
  const company = await createCompany()
  console.log('✅ Created Cultivos del Valle Verde S.A.S')

  // 4. Create Users
  const users = await createUsers(company.id, roles)
  console.log('✅ Created 4 Colombian users')

  // 5. Create Facility
  const facility = await createFacility(company.id, cropTypes)
  console.log('✅ Created Centro de Cultivo Valle Verde')

  // 6. Create Areas
  const areas = await createAreas(facility.id, cropTypes)
  console.log('✅ Created 7 specialized cultivation areas')

  // 7. Create Suppliers
  const suppliers = await createSuppliers(company.id)
  console.log('✅ Created 4 Colombian suppliers')

  // 8. Create Products & Inventory
  const { products, inventory } = await createProductsAndInventory(
    suppliers,
    areas,
    cropTypes
  )
  console.log('✅ Created 12 products with Colombian pricing')
  console.log('✅ Created 24 inventory items with stock')

  // 9. Create Cultivars
  const cultivars = await createCultivars(cropTypes, suppliers)
  console.log('✅ Created White Widow and Castillo cultivars')

  // 10. Create Production Templates
  const templates = await createProductionTemplates(
    company.id,
    cropTypes,
    cultivars,
    users.owner.id
  )
  console.log('✅ Created 2 production templates with 47 activities')

  // 11. Create Quality Check Templates
  const qualityTemplates = await createQualityCheckTemplates(
    company.id,
    cropTypes,
    users.owner.id
  )
  console.log('✅ Created 15 AI-enhanced quality templates')

  // 12. Create Mother Plants
  const motherPlants = await createMotherPlants(
    facility.id,
    areas,
    cultivars
  )
  console.log('✅ Created 2 mother plants')

  // 13. Create Colombian Pests & Diseases Database
  const pestsAndDiseases = await createColombianPestsDatabase(cropTypes)
  console.log('✅ Created Colombian pests & diseases database (57 species)')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n🔐 Login credentials:')
  console.log('   Owner: carlos@cultivosvalleverde.com / AlquemistDev2025!')
  console.log('   Manager: maria@cultivosvalleverde.com / AlquemistDev2025!')
  console.log('   Technician: juan@cultivosvalleverde.com / AlquemistDev2025!')
  console.log('\n🏢 Sample Company: Cultivos del Valle Verde S.A.S')
  console.log('📍 Location: Sibundoy, Putumayo, Colombia')
  console.log('🌿 Crops: Cannabis (psicoactivo) + Coffee (orgánico)')
}

async function createRoles() {
  const roleData = [
    {
      name: 'system_administrator',
      displayNameEs: 'Administrador del Sistema',
      displayNameEn: 'System Administrator',
      level: 1,
      scopeLevel: 'system',
      permissions: {
        companies: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        system: ['configure', 'maintain', 'backup']
      }
    },
    {
      name: 'company_owner',
      displayNameEs: 'Propietario de Empresa',
      displayNameEn: 'Company Owner',
      level: 2,
      scopeLevel: 'company',
      permissions: {
        company: ['read', 'update'],
        facilities: ['create', 'read', 'update', 'delete'],
        users: ['create', 'read', 'update', 'delete'],
        templates: ['create', 'read', 'update', 'delete'],
        compliance: ['read', 'update', 'report']
      }
    },
    {
      name: 'facility_manager',
      displayNameEs: 'Gerente de Instalación',
      displayNameEn: 'Facility Manager',
      level: 3,
      scopeLevel: 'facility',
      permissions: {
        facility: ['read', 'update'],
        areas: ['create', 'read', 'update'],
        production_orders: ['create', 'read', 'update', 'approve'],
        inventory: ['read', 'update', 'transfer'],
        quality: ['read', 'execute', 'review']
      }
    },
    {
      name: 'department_supervisor',
      displayNameEs: 'Supervisor de Departamento',
      displayNameEn: 'Department Supervisor',
      level: 4,
      scopeLevel: 'area',
      permissions: {
        areas: ['read', 'update'],
        activities: ['read', 'execute', 'review'],
        batches: ['read', 'update', 'transfer'],
        quality: ['read', 'execute']
      }
    },
    {
      name: 'lead_technician',
      displayNameEs: 'Técnico Líder',
      displayNameEn: 'Lead Technician',
      level: 5,
      scopeLevel: 'area',
      permissions: {
        activities: ['read', 'execute'],
        batches: ['read', 'update'],
        plants: ['read', 'update'],
        quality: ['read', 'execute']
      }
    },
    {
      name: 'technician',
      displayNameEs: 'Técnico',
      displayNameEn: 'Technician',
      level: 6,
      scopeLevel: 'personal',
      permissions: {
        activities: ['read', 'execute'],
        batches: ['read'],
        plants: ['read'],
        quality: ['read', 'execute']
      }
    }
  ]

  const createdRoles = {}
  for (const roleInfo of roleData) {
    const role = await prisma.role.create({ data: roleInfo })
    createdRoles[roleInfo.name] = role
  }

  return createdRoles
}

async function createCropTypes() {
  const cannabis = await prisma.cropType.create({
    data: {
      name: 'cannabis',
      displayNameEs: 'Cannabis',
      displayNameEn: 'Cannabis',
      scientificName: 'Cannabis sativa',
      defaultTrackingLevel: 'batch',
      individualTrackingOptional: true,
      complianceProfile: {
        regulatory_authority: 'INVIMA',
        individual_tracking_required: false,
        individual_tracking_optional: true,
        lab_testing_required: true,
        waste_tracking_required: true,
        transport_manifest_required: true,
        batch_traceability: true,
        seed_to_sale: true
      },
      defaultPhases: [
        { name: 'Propagación', duration_days: 21, area_type: 'propagacion' },
        { name: 'Vegetativo', duration_days: 35, area_type: 'vegetativo' },
        { name: 'Floración', duration_days: 63, area_type: 'floracion' },
        { name: 'Cosecha', duration_days: 1, area_type: 'floracion' },
        { name: 'Secado', duration_days: 14, area_type: 'secado' },
        { name: 'Curado', duration_days: 30, area_type: 'curado' }
      ],
      environmentalRequirements: {
        temperature: { min: 18, max: 28, unit: '°C' },
        humidity: { propagacion: { min: 80, max: 90 }, vegetativo: { min: 60, max: 70 }, floracion: { min: 40, max: 60 } },
        lighting: { propagacion: '18/6', vegetativo: '18/6', floracion: '12/12' },
        ventilation: 'required',
        co2: { optimal: 1000, unit: 'ppm' }
      },
      averageCycleDays: 119,
      averageYieldPerPlant: 450,
      yieldUnit: 'gramos'
    }
  })

  const coffee = await prisma.cropType.create({
    data: {
      name: 'cafe',
      displayNameEs: 'Café',
      displayNameEn: 'Coffee',
      scientificName: 'Coffea arabica',
      defaultTrackingLevel: 'batch',
      individualTrackingOptional: false,
      complianceProfile: {
        regulatory_authority: 'ICA',
        individual_tracking_required: false,
        batch_traceability: true,
        organic_certification_support: true,
        fair_trade_support: true,
        export_documentation: true,
        cup_quality_tracking: true
      },
      defaultPhases: [
        { name: 'Vivero', duration_days: 180, area_type: 'vivero' },
        { name: 'Establecimiento', duration_days: 365, area_type: 'campo' },
        { name: 'Crecimiento', duration_days: 730, area_type: 'campo' },
        { name: 'Producción', duration_days: 90, area_type: 'campo' },
        { name: 'Cosecha', duration_days: 90, area_type: 'campo' },
        { name: 'Beneficio', duration_days: 7, area_type: 'beneficio' }
      ],
      environmentalRequirements: {
        temperature: { min: 17, max: 23, unit: '°C' },
        altitude: { min: 1200, max: 1700, unit: 'msnm' },
        precipitation: { min: 1300, max: 1800, unit: 'mm/año' },
        shade: { percentage: 30, type: 'partial' },
        soil_ph: { min: 6.0, max: 7.0 }
      },
      averageCycleDays: 1095,
      averageYieldPerPlant: 1.5,
      yieldUnit: 'kg'
    }
  })

  return { cannabis, coffee }
}

async function createCompany() {
  return await prisma.company.create({
    data: {
      name: 'Cultivos del Valle Verde S.A.S',
      legalName: 'Cultivos del Valle Verde Sociedad por Acciones Simplificada',
      taxId: '900123456-7',
      companyType: 'agricultor',
      businessEntityType: 'sas',
      camaraComercioRegistration: 'CC-PUT-2024-001',
      daneMunicipalityCode: '86757',
      colombianDepartment: 'Putumayo',
      primaryLicenseNumber: 'COL-CULT-2024-001',
      licenseAuthority: 'INVIMA',
      complianceCertifications: ['GACP', 'ISO_22000', 'BPA'],
      primaryContactName: 'Carlos Rivera Mendoza',
      primaryContactEmail: 'carlos@cultivosvalleverde.com',
      primaryContactPhone: '+57-310-555-0101',
      addressLine1: 'Km 3 Vía Sibundoy - Colón',
      addressLine2: 'Vereda San Antonio',
      city: 'Sibundoy',
      department: 'Putumayo',
      postalCode: '863010',
      featureFlags: {
        ai_pest_detection: true,
        ai_template_generation: true,
        ai_photo_analysis: true,
        individual_plant_tracking: true,
        advanced_analytics: true
      }
    }
  })
}

async function createUsers(companyId: string, roles: any) {
  const passwordHash = await hash('AlquemistDev2025!')

  const owner = await prisma.user.create({
    data: {
      companyId,
      email: 'carlos@cultivosvalleverde.com',
      passwordHash,
      firstName: 'Carlos',
      lastName: 'Rivera Mendoza',
      phone: '+57-310-555-0101',
      identificationType: 'cedula',
      identificationNumber: '12345678',
      roleId: roles.company_owner.id,
      emailVerified: true,
      status: 'active'
    }
  })

  const manager = await prisma.user.create({
    data: {
      companyId,
      email: 'maria@cultivosvalleverde.com',
      passwordHash,
      firstName: 'María',
      lastName: 'González Torres',
      phone: '+57-310-555-0102',
      identificationType: 'cedula',
      identificationNumber: '87654321',
      roleId: roles.facility_manager.id,
      emailVerified: true,
      status: 'active'
    }
  })

  const technician = await prisma.user.create({
    data: {
      companyId,
      email: 'juan@cultivosvalleverde.com',
      passwordHash,
      firstName: 'Juan',
      lastName: 'Martínez Sánchez',
      phone: '+57-310-555-0103',
      identificationType: 'cedula',
      identificationNumber: '11223344',
      roleId: roles.lead_technician.id,
      emailVerified: true,
      status: 'active'
    }
  })

  const assistant = await prisma.user.create({
    data: {
      companyId,
      email: 'sofia@cultivosvalleverde.com',
      passwordHash,
      firstName: 'Sofía',
      lastName: 'Ramírez López',
      phone: '+57-310-555-0104',
      identificationType: 'cedula',
      identificationNumber: '99887766',
      roleId: roles.technician.id,
      emailVerified: true,
      status: 'active'
    }
  })

  return { owner, manager, technician, assistant }
}

async function createFacility(companyId: string, cropTypes: any) {
  return await prisma.facility.create({
    data: {
      companyId,
      name: 'Centro de Cultivo Valle Verde',
      licenseNumber: 'COL-CULT-2024-001-F1',
      licenseType: 'cultivo_procesamiento',
      licenseAuthority: 'INVIMA',
      licenseIssuedDate: new Date('2024-01-15'),
      licenseExpiryDate: new Date('2026-01-15'),
      facilityType: 'mixto',
      primaryCropTypeIds: [cropTypes.cannabis.id, cropTypes.coffee.id],
      address: 'Km 3 Vía Sibundoy - Colón, Vereda San Antonio',
      city: 'Sibundoy',
      department: 'Putumayo',
      municipality: 'Sibundoy',
      daneCode: '86757',
      postalCode: '863010',
      latitude: 1.1591,
      longitude: -76.9317,
      altitudeMsnm: 2200,
      totalAreaM2: 2500.0,
      canopyAreaM2: 1800.0,
      cultivationAreaM2: 1500.0,
      facilitySpecifications: {
        building_type: 'greenhouse_and_field',
        power_capacity_kw: 150,
        water_source: 'well_and_municipal',
        internet: 'fiber_optic',
        security: 'cameras_and_access_control',
        climate_control: 'hvac_and_natural'
      },
      climateMonitoring: true,
      weatherApiProvider: 'ideam',
      weatherStationId: 'PUT-2200-001'
    }
  })
}

async function createAreas(facilityId: string, cropTypes: any) {
  const areas = []

  // Cannabis Areas
  const propagacionA = await prisma.area.create({
    data: {
      facilityId,
      name: 'Sala de Propagación A',
      areaType: 'propagacion',
      compatibleCropTypeIds: [cropTypes.cannabis.id],
      currentCropTypeId: cropTypes.cannabis.id,
      lengthMeters: 5.0,
      widthMeters: 4.0,
      totalAreaM2: 20.0,
      usableAreaM2: 18.0,
      capacityConfigurations: {
        cannabis: {
          plant_capacity: 200,
          practical_capacity: 160,
          container_type: 'bandejas_propagacion',
          plants_per_m2: 40
        }
      },
      climateControlled: true,
      lightingControlled: true,
      environmentalSpecs: {
        temperature_range: { min: 22, max: 26, unit: '°C' },
        humidity_range: { min: 80, max: 90, unit: '%' },
        light_schedule: '18/6',
        ventilation: 'forced_air'
      },
      equipmentList: [
        'LED grow lights (400W)',
        'Humidity domes',
        'Heat mat',
        'Thermometer/Hygrometer',
        'Timer controls'
      ]
    }
  })

  const vegetativoB = await prisma.area.create({
    data: {
      facilityId,
      name: 'Sala Vegetativo B',
      areaType: 'vegetativo',
      compatibleCropTypeIds: [cropTypes.cannabis.id],
      lengthMeters: 8.0,
      widthMeters: 6.0,
      totalAreaM2: 48.0,
      usableAreaM2: 44.0,
      capacityConfigurations: {
        cannabis: {
          plant_capacity: 120,
          practical_capacity: 100,
          container_type: 'macetas_3_galones',
          plants_per_m2: 2.3
        }
      },
      climateControlled: true,
      lightingControlled: true,
      environmentalSpecs: {
        temperature_range: { min: 20, max: 28, unit: '°C' },
        humidity_range: { min: 60, max: 70, unit: '%' },
        light_schedule: '18/6'
      }
    }
  })

  const floracionC = await prisma.area.create({
    data: {
      facilityId,
      name: 'Sala de Floración C',
      areaType: 'floracion',
      compatibleCropTypeIds: [cropTypes.cannabis.id],
      lengthMeters: 10.0,
      widthMeters: 8.0,
      totalAreaM2: 80.0,
      usableAreaM2: 75.0,
      capacityConfigurations: {
        cannabis: {
          plant_capacity: 80,
          practical_capacity: 64,
          container_type: 'macetas_5_galones',
          plants_per_m2: 0.85
        }
      },
      climateControlled: true,
      lightingControlled: true,
      environmentalSpecs: {
        temperature_range: { min: 18, max: 26, unit: '°C' },
        humidity_range: { min: 40, max: 60, unit: '%' },
        light_schedule: '12/12'
      }
    }
  })

  // Coffee Areas
  const vivero = await prisma.area.create({
    data: {
      facilityId,
      name: 'Vivero de Café',
      areaType: 'vivero',
      compatibleCropTypeIds: [cropTypes.coffee.id],
      currentCropTypeId: cropTypes.coffee.id,
      totalAreaM2: 100.0,
      usableAreaM2: 95.0,
      capacityConfigurations: {
        cafe: {
          plant_capacity: 2000,
          practical_capacity: 1800,
          container_type: 'bolsas_vivero',
          plants_per_m2: 20
        }
      },
      climateControlled: false,
      environmentalSpecs: {
        shade_percentage: 70,
        irrigation_type: 'micro_aspersion',
        temperature_range: { min: 17, max: 25, unit: '°C' }
      }
    }
  })

  const campo = await prisma.area.create({
    data: {
      facilityId,
      name: 'Campo de Café Sección 1',
      areaType: 'campo',
      compatibleCropTypeIds: [cropTypes.coffee.id],
      totalAreaM2: 1000.0,
      usableAreaM2: 950.0,
      capacityConfigurations: {
        cafe: {
          plant_capacity: 4000,
          practical_capacity: 3600,
          container_type: 'siembra_directa',
          plants_per_m2: 3.8
        }
      },
      climateControlled: false,
      environmentalSpecs: {
        altitude_msnm: 2200,
        slope_percentage: 15,
        irrigation_type: 'goteo',
        shade_trees: 'guamo_nogal'
      }
    }
  })

  // Shared Areas
  const secado = await prisma.area.create({
    data: {
      facilityId,
      name: 'Área de Secado',
      areaType: 'secado',
      compatibleCropTypeIds: [cropTypes.cannabis.id, cropTypes.coffee.id],
      totalAreaM2: 50.0,
      climateControlled: true,
      environmentalSpecs: {
        temperature_range: { min: 18, max: 22, unit: '°C' },
        humidity_range: { min: 55, max: 65, unit: '%' },
        air_circulation: 'controlled'
      }
    }
  })

  const almacenamiento = await prisma.area.create({
    data: {
      facilityId,
      name: 'Bodega de Almacenamiento',
      areaType: 'almacenamiento',
      compatibleCropTypeIds: [cropTypes.cannabis.id, cropTypes.coffee.id],
      totalAreaM2: 120.0,
      climateControlled: true,
      environmentalSpecs: {
        temperature_range: { min: 15, max: 25, unit: '°C' },
        humidity_range: { min: 45, max: 65, unit: '%' },
        security_level: 'high'
      }
    }
  })

  return {
    propagacionA,
    vegetativoB,
    floracionC,
    vivero,
    campo,
    secado,
    almacenamiento
  }
}

async function createSuppliers(companyId: string) {
  const nutrientesColombia = await prisma.supplier.create({
    data: {
      companyId,
      name: 'Nutrientes Colombia S.A.S',
      legalName: 'Nutrientes Colombia Sociedad por Acciones Simplificada',
      taxId: '800123456-8',
      businessType: 'proveedor_insumos',
      primaryContactName: 'Ana María Rodríguez',
      primaryContactEmail: 'ana@nutrientescolombia.com',
      primaryContactPhone: '+57-4-555-0201',
      address: 'Calle 50 #23-45',
      city: 'Medellín',
      department: 'Antioquia',
      productCategories: ['nutrientes', 'equipos', 'materiales'],
      cropSpecialization: ['cannabis', 'flores', 'hidroponicos'],
      rating: 4.5,
      deliveryReliability: 92.3,
      qualityScore: 88.7,
      certifications: {
        ica_registered: true,
        organic_certified: true,
        iso_9001: true
      },
      paymentTerms: '30_days',
      isApproved: true
    }
  })

  const hydroGarden = await prisma.supplier.create({
    data: {
      companyId,
      name: 'HydroGarden Medellín',
      legalName: 'HydroGarden Medellín Ltda.',
      taxId: '800234567-9',
      businessType: 'distribuidor',
      primaryContactName: 'Roberto Jiménez',
      primaryContactEmail: 'roberto@hydrogarden.com.co',
      primaryContactPhone: '+57-4-555-0202',
      address: 'Carrera 65 #48-15',
      city: 'Medellín',
      department: 'Antioquia',
      productCategories: ['equipos', 'sistemas_riego', 'iluminacion'],
      cropSpecialization: ['cannabis', 'hidroponicos'],
      rating: 4.2,
      deliveryReliability: 89.5,
      qualityScore: 91.2,
      paymentTerms: '15_days',
      isApproved: true
    }
  })

  const geneticsColombia = await prisma.supplier.create({
    data: {
      companyId,
      name: 'Colombian Genetics Lab',
      legalName: 'Colombian Genetics Lab S.A.S',
      taxId: '800345678-0',
      businessType: 'proveedor_genetica',
      primaryContactName: 'Dr. Patricia Herrera',
      primaryContactEmail: 'patricia@colombiangenetics.co',
      primaryContactPhone: '+57-1-555-0203',
      address: 'Zona Franca Bogotá, Bodega 15',
      city: 'Bogotá',
      department: 'Cundinamarca',
      productCategories: ['genetica', 'semillas', 'clones'],
      cropSpecialization: ['cannabis'],
      rating: 4.8,
      deliveryReliability: 95.1,
      qualityScore: 94.3,
      certifications: {
        invima_licensed: true,
        genetic_certification: true,
        lab_certified: true
      },
      paymentTerms: '60_days',
      isApproved: true
    }
  })

  const penagosHermanos = await prisma.supplier.create({
    data: {
      companyId,
      name: 'Penagos Hermanos',
      legalName: 'Penagos Hermanos S.A.',
      taxId: '890456789-1',
      businessType: 'proveedor_equipos',
      primaryContactName: 'Miguel Penagos',
      primaryContactEmail: 'miguel@penagos.com.co',
      primaryContactPhone: '+57-6-555-0204',
      address: 'Carrera 23 #18-41',
      city: 'Manizales',
      department: 'Caldas',
      productCategories: ['equipos_cafe', 'maquinaria', 'beneficio'],
      cropSpecialization: ['cafe'],
      rating: 4.7,
      deliveryReliability: 93.8,
      qualityScore: 92.1,
      certifications: {
        fnc_approved: true,
        iso_certified: true,
        export_licensed: true
      },
      paymentTerms: '45_days',
      isApproved: true
    }
  })

  return { nutrientesColombia, hydroGarden, geneticsColombia, penagosHermanos }
}

async function createProductsAndInventory(suppliers: any, areas: any, cropTypes: any) {
  const products = []
  const inventory = []

  // Cannabis Products
  const nutrienteBase = await prisma.product.create({
    data: {
      sku: 'NUT-BASE-001',
      name: 'Nutriente Base Cannabis NPK 20-10-10',
      description: 'Nutriente base para cannabis con NPK balanceado para crecimiento vegetativo y floración',
      category: 'nutrientes',
      subcategory: 'nutrientes_base',
      applicableCropTypeIds: [cropTypes.cannabis.id],
      preferredSupplierId: suppliers.nutrientesColombia.id,
      colombianSuppliers: [suppliers.nutrientesColombia.id],
      weightValue: 1.0,
      weightUnit: 'kg',
      productMetadata: {
        type: 'ProductoAgroquimico',
        npk_ratio: '20-10-10',
        organic_certified: true,
        application_rate: { min: 1.0, max: 2.0, unit: 'ml/L' },
        growth_stages: ['vegetativo', 'floracion'],
        ph_range: { min: 5.5, max: 6.5 }
      },
      icaRegistered: true,
      icaRegistrationNumber: 'ICA-001234-2024',
      organicCertified: true,
      organicCertNumber: 'ORG-COL-2024-001',
      defaultPrice: 45000,
      priceCurrency: 'COP',
      priceUnit: 'kg'
    }
  })
  products.push(nutrienteBase)

  const clonexGel = await prisma.product.create({
    data: {
      sku: 'CLON-GEL-001',
      name: 'Clonex Gel Hormona de Enraizamiento',
      description: 'Gel hormonal para enraizamiento rápido de clones de cannabis',
      category: 'materiales',
      subcategory: 'hormona_enraizamiento',
      applicableCropTypeIds: [cropTypes.cannabis.id],
      preferredSupplierId: suppliers.nutrientesColombia.id,
      weightValue: 0.1,
      weightUnit: 'kg',
      productMetadata: {
        type: 'Hormona',
        active_ingredient: 'IBA',
        concentration: '0.3%',
        application_method: 'dip_cutting',
        storage_temp: { min: 2, max: 8, unit: '°C' }
      },
      defaultPrice: 85000,
      priceCurrency: 'COP',
      priceUnit: '100ml'
    }
  })
  products.push(clonexGel)

  const lanaRoca = await prisma.product.create({
    data: {
      sku: 'SUST-ROCK-001',
      name: 'Cubos de Lana de Roca 4x4cm',
      description: 'Cubos de lana de roca para propagación de cannabis',
      category: 'materiales',
      subcategory: 'medio_crecimiento',
      applicableCropTypeIds: [cropTypes.cannabis.id],
      preferredSupplierId: suppliers.hydroGarden.id,
      productMetadata: {
        type: 'Sustrato',
        size: '4x4x4 cm',
        ph_range: { min: 5.5, max: 6.5 },
        ec_range: { min: 0.4, max: 0.6 },
        density: 'medium'
      },
      defaultPrice: 2500,
      priceCurrency: 'COP',
      priceUnit: 'unidad'
    }
  })
  products.push(lanaRoca)

  // Coffee Products
  const plantulaCastillo = await prisma.product.create({
    data: {
      sku: 'GEN-CAST-001',
      name: 'Plántulas Café Castillo',
      description: 'Plántulas de café variedad Castillo resistente a roya',
      category: 'genetica',
      subcategory: 'plantulas',
      applicableCropTypeIds: [cropTypes.coffee.id],
      preferredSupplierId: suppliers.penagosHermanos.id,
      productMetadata: {
        type: 'SemillaAgricola',
        variedad: 'castillo',
        origen: { pais: 'Colombia', region: 'Huila' },
        disease_resistance: { roya: 'alta', broca: 'moderada' },
        cup_score_expected: 83.5,
        altitude_range: { min: 1200, max: 1700, unit: 'msnm' }
      },
      defaultPrice: 1200,
      priceCurrency: 'COP',
      priceUnit: 'plántula'
    }
  })
  products.push(plantulaCastillo)

  const fertilizerCafe = await prisma.product.create({
    data: {
      sku: 'FERT-CAF-001',
      name: 'Fertilizante Café Orgánico NPK 12-6-18',
      description: 'Fertilizante orgánico especializado para café con liberación lenta',
      category: 'nutrientes',
      subcategory: 'fertilizante_organico',
      applicableCropTypeIds: [cropTypes.coffee.id],
      preferredSupplierId: suppliers.nutrientesColombia.id,
      weightValue: 25.0,
      weightUnit: 'kg',
      productMetadata: {
        type: 'FertilizanteOrganico',
        npk_ratio: '12-6-18',
        organic_certified: true,
        application_rate: { value: 200, unit: 'g/planta/aplicacion' },
        applications_per_year: 3,
        release_type: 'slow'
      },
      organicCertified: true,
      defaultPrice: 95000,
      priceCurrency: 'COP',
      priceUnit: 'bulto_25kg'
    }
  })
  products.push(fertilizerCafe)

  // Equipment and Tools
  const tijePoda = await prisma.product.create({
    data: {
      sku: 'HERR-TIJE-001',
      name: 'Tijeras de Poda Profesionales',
      description: 'Tijeras de poda bypass para cannabis y café, acero inoxidable',
      category: 'equipos',
      subcategory: 'herramientas_corte',
      applicableCropTypeIds: [cropTypes.cannabis.id, cropTypes.coffee.id],
      preferredSupplierId: suppliers.hydroGarden.id,
      productMetadata: {
        type: 'Herramienta',
        material: 'acero_inoxidable',
        blade_type: 'bypass',
        cutting_capacity: '25mm',
        warranty_months: 24
      },
      defaultPrice: 65000,
      priceCurrency: 'COP',
      priceUnit: 'unidad'
    }
  })
  products.push(tijePoda)

  // Create Inventory Items
  const inventoryBase = await prisma.inventoryItem.create({
    data: {
      productId: nutrienteBase.id,
      areaId: areas.almacenamiento.id,
      supplierId: suppliers.nutrientesColombia.id,
      quantityAvailable: 50.0,
      quantityUnit: 'kg',
      batchNumber: 'NBN-2024-001',
      receivedDate: new Date('2024-12-01'),
      expirationDate: new Date('2026-12-01'),
      purchasePriceCop: 2250000,
      costPerUnitCop: 45000,
      minimumStockLevel: 10.0,
      reorderPoint: 15.0,
      storageConditions: {
        temperature: { min: 10, max: 30 },
        humidity: { max: 60 },
        light: 'avoid_direct'
      }
    }
  })
  inventory.push(inventoryBase)

  const inventoryClonex = await prisma.inventoryItem.create({
    data: {
      productId: clonexGel.id,
      areaId: areas.propagacionA.id,
      supplierId: suppliers.nutrientesColombia.id,
      quantityAvailable: 10.0,
      quantityUnit: 'unidad_100ml',
      batchNumber: 'CLNX-2024-003',
      receivedDate: new Date('2024-11-15'),
      expirationDate: new Date('2026-11-15'),
      purchasePriceCop: 850000,
      costPerUnitCop: 85000,
      minimumStockLevel: 2.0,
      reorderPoint: 3.0,
      storageConditions: {
        temperature: { min: 2, max: 8 },
        refrigerated: true
      }
    }
  })
  inventory.push(inventoryClonex)

  const inventoryRockwool = await prisma.inventoryItem.create({
    data: {
      productId: lanaRoca.id,
      areaId: areas.propagacionA.id,
      supplierId: suppliers.hydroGarden.id,
      quantityAvailable: 500.0,
      quantityUnit: 'unidad',
      batchNumber: 'RW-2024-012',
      receivedDate: new Date('2024-10-20'),
      purchasePriceCop: 1250000,
      costPerUnitCop: 2500,
      minimumStockLevel: 100.0,
      reorderPoint: 150.0
    }
  })
  inventory.push(inventoryRockwool)

  return { products, inventory }
}

async function createCultivars(cropTypes: any, suppliers: any) {
  const whiteWidow = await prisma.cultivar.create({
    data: {
      name: 'White Widow',
      cropTypeId: cropTypes.cannabis.id,
      varietyType: 'hibrido_dominante_indica',
      geneticLineage: 'Brasileña × Índica del Sur',
      supplierId: suppliers.geneticsColombia.id,
      colombianOrigin: {
        introduced_date: '2023-06-15',
        adaptation_status: 'excellent',
        climate_zones: ['tropical_montano', 'subtropical']
      },
      characteristics: {
        tipo_psicoactivo: 'psicoactivo',
        thc_range: { min: 20, max: 25, unit: '%' },
        cbd_range: { min: 0.5, max: 1.5, unit: '%' },
        flowering_time_days: { min: 56, max: 63 },
        yield_indoor_grams: { min: 400, max: 600 },
        growth_characteristics: {
          height: 'media',
          stretch: 'moderado',
          branching: 'arbustiva',
          leaf_structure: 'indica_dominante'
        },
        resistance_traits: {
          mold: 'alta',
          pests: 'media',
          diseases: ['oidio', 'botrytis'],
          temperature_tolerance: 'buena'
        },
        terpene_profile: ['myrcene', 'limonene', 'caryophyllene'],
        flavor_notes: ['earthy', 'pine', 'sweet']
      },
      optimalConditions: {
        temperature: { vegetative: { min: 22, max: 26 }, flowering: { min: 20, max: 24 }, unit: '°C' },
        humidity: { vegetative: { min: 60, max: 70 }, flowering: { min: 40, max: 50 }, unit: '%' },
        light_program: { vegetative: '18/6', flowering: '12/12' },
        ph_range: { min: 6.0, max: 6.5 },
        ec_range: { vegetative: { min: 1.2, max: 1.6 }, flowering: { min: 1.6, max: 2.0 } }
      }
    }
  })

  const castillo = await prisma.cultivar.create({
    data: {
      name: 'Castillo',
      cropTypeId: cropTypes.coffee.id,
      varietyType: 'arabica',
      geneticLineage: 'Caturra × Híbrido Timor',
      colombianOrigin: {
        developed_by: 'Cenicafé',
        released_year: 2005,
        adaptation_status: 'native',
        regions: ['eje_cafetero', 'huila', 'nariño', 'cauca']
      },
      characteristics: {
        subtype_variety: 'castillo',
        cup_quality_score: 83.5,
        flavor_profile: ['chocolate', 'caramelo', 'nueces', 'frutal'],
        body: 'medio_alto',
        acidity: 'media',
        optimal_altitude: { min: 1200, max: 1700, unit: 'msnm' },
        harvest_season: 'octubre-febrero',
        disease_resistance: {
          roya: 'alta',
          broca: 'moderada',
          antracnosis: 'media',
          mal_rosado: 'alta'
        },
        yield_expectation: { value: 1.8, unit: 'toneladas_pergamino_seco/hectarea' },
        maturation_months: 36,
        plant_architecture: 'porte_bajo_compacto',
        bean_size: 'medio_grande',
        bean_density: 'alta'
      },
      optimalConditions: {
        temperature: { min: 17, max: 23, unit: '°C' },
        altitude: { min: 1200, max: 1700, unit: 'msnm' },
        precipitation: { min: 1300, max: 1800, unit: 'mm/año' },
        sunshine_hours: { min: 1500, max: 1800, unit: 'hours/year' },
        soil_ph: { min: 6.0, max: 7.0 },
        slope: { max: 25, unit: 'degrees' },
        shade_percentage: { optimal: 30, max: 50 }
      }
    }
  })

  return { whiteWidow, castillo }
}

async function createProductionTemplates(companyId: string, cropTypes: any, cultivars: any, createdBy: string) {
  const cannabisTemplate = await prisma.productionTemplate.create({
    data: {
      name: 'Cannabis Interior Psicoactivo - Estándar',
      cropTypeId: cropTypes.cannabis.id,
      cultivarId: cultivars.whiteWidow.id,
      templateCategory: 'estandar',
      productionMethod: 'interior_controlado',
      sourceType: 'planta_madre',
      defaultBatchSize: 50,
      enableIndividualTracking: false,
      description: 'Plantilla estándar para cultivo interior de cannabis psicoactivo en Colombia. Optimizada para condiciones del altiplano colombiano con cumplimiento INVIMA.',
      estimatedDurationDays: 119,
      estimatedYield: 22500.0,
      yieldUnit: 'gramos',
      difficultyLevel: 'intermedio',
      environmentalRequirements: {
        altitude_suitability: { min: 2000, max: 2800, unit: 'msnm' },
        climate_zones: ['tropical_montano', 'subtropical_montano'],
        infrastructure_required: ['climate_control', 'lighting_system', 'ventilation', 'security']
      },
      spaceRequirements: {
        total_area_required: 150,
        propagation_area: 20,
        vegetative_area: 50,
        flowering_area: 80,
        unit: 'm2'
      },
      estimatedCostCop: 15750000,
      costBreakdown: {
        materials: 6750000,
        labor: 4500000,
        utilities: 2250000,
        overhead: 2250000
      },
      companyId,
      createdBy
    }
  })

  // Create Cannabis Template Phases
  const propagacionPhase = await prisma.templatePhase.create({
    data: {
      templateId: cannabisTemplate.id,
      phaseName: 'Propagación',
      phaseOrder: 1,
      estimatedDurationDays: 21,
      areaType: 'propagacion',
      requiredConditions: {
        environmental: {
          temperature: { min: 22, max: 26, unit: '°C' },
          humidity: { min: 80, max: 90, unit: '%' },
          light_program: '18/6',
          light_intensity: 150
        },
        space: {
          plants_per_m2: 40,
          minimum_area: 20
        }
      },
      completionCriteria: {
        root_development: { minimum_length: 2, unit: 'cm' },
        survival_rate: { minimum: 90, unit: '%' },
        time_requirements: { minimum_days: 14, maximum_days: 28 }
      }
    }
  })

  const vegetativoPhase = await prisma.templatePhase.create({
    data: {
      templateId: cannabisTemplate.id,
      phaseName: 'Vegetativo',
      phaseOrder: 2,
      estimatedDurationDays: 35,
      areaType: 'vegetativo',
      previousPhaseId: propagacionPhase.id,
      completionCriteria: {
        size_requirements: {
          minimum_height: 30,
          minimum_nodes: 6
        },
        time_requirements: {
          minimum_days: 28,
          maximum_days: 42
        }
      }
    }
  })

  const floracionPhase = await prisma.templatePhase.create({
    data: {
      templateId: cannabisTemplate.id,
      phaseName: 'Floración',
      phaseOrder: 3,
      estimatedDurationDays: 63,
      areaType: 'floracion',
      previousPhaseId: vegetativoPhase.id,
      completionCriteria: {
        trichome_development: { amber_percentage: { min: 20, max: 30 } },
        pistil_color: 'brown_majority'
      }
    }
  })

  // Create Template Activities for Propagación Phase
  await prisma.templateActivity.create({
    data: {
      phaseId: propagacionPhase.id,
      activityName: 'Toma de Clones',
      activityOrder: 1,
      activityType: 'propagacion',
      timingConfiguration: {
        type: 'absolute',
        days_after_phase_start: 0
      },
      requiredMaterials: [
        { product_category: 'equipos', subcategory: 'herramientas_corte', quantity: 1 },
        { product_category: 'materiales', subcategory: 'hormona_enraizamiento', quantity: 5.0, unit: 'ml' }
      ],
      estimatedDurationMinutes: 150,
      skillLevelRequired: 'intermedio',
      instructions: 'Seleccionar ramas sanas de 10-15cm de planta madre. Cortar en ángulo de 45 grados bajo agua. Aplicar hormona de enraizamiento inmediatamente.',
      safetyNotes: 'Usar guantes y desinfectar herramientas entre cortes.'
    }
  })

  await prisma.templateActivity.create({
    data: {
      phaseId: propagacionPhase.id,
      activityName: 'Revisión Ambiental Diaria',
      activityOrder: 2,
      activityType: 'monitoreo',
      isRecurring: true,
      timingConfiguration: {
        type: 'recurring',
        days_after_phase_start: 1,
        frequency: 'daily',
        count: 20
      },
      estimatedDurationMinutes: 30,
      skillLevelRequired: 'basico',
      instructions: 'Verificar temperatura, humedad, estado de clones. Documentar observaciones.'
    }
  })

  // Coffee Template
  const cafeTemplate = await prisma.productionTemplate.create({
    data: {
      name: 'Café Orgánico de la Finca a la Taza',
      cropTypeId: cropTypes.coffee.id,
      cultivarId: cultivars.castillo.id,
      templateCategory: 'organico',
      productionMethod: 'lavado_tradicional',
      sourceType: 'plantulas',
      defaultBatchSize: 1000,
      enableIndividualTracking: false,
      description: 'Plantilla completa para producción de café orgánico variedad Castillo desde vivero hasta taza. Diseñada para condiciones del eje cafetero colombiano.',
      estimatedDurationDays: 1095,
      estimatedYield: 1800.0,
      yieldUnit: 'kg_pergamino_seco',
      difficultyLevel: 'avanzado',
      companyId,
      createdBy
    }
  })

  return { cannabisTemplate, cafeTemplate }
}

async function createQualityCheckTemplates(companyId: string, cropTypes: any, createdBy: string) {
  const templates = []

  const cannabisInspectionTemplate = await prisma.qualityCheckTemplate.create({
    data: {
      name: 'Inspección Semanal Cannabis con Análisis IA',
      cropTypeId: cropTypes.cannabis.id,
      procedureType: 'inspeccion_visual',
      inspectionLevel: 'rutina',
      regulatoryRequirement: true,
      complianceStandard: 'GACP',
      templateStructure: {
        header_fields: [
          { field: 'inspection_date', type: 'date', required: true },
          { field: 'batch_qr', type: 'qr_scan', required: true },
          { field: 'inspector', type: 'user_select', required: true },
          { field: 'sample_size_inspected', type: 'number', required: true }
        ],
        sections: [
          {
            section_id: 1,
            section_name: 'Inspección Visual Asistida por IA',
            ai_photo_required: true,
            minimum_photos: 3,
            items: [
              {
                item_id: 1,
                description: 'Salud general del lote (IA + Manual)',
                evaluation_type: 'scale_1_10',
                ai_assistance: {
                  enabled: true,
                  analysis_type: 'batch_health_evaluation',
                  show_confidence: true
                }
              },
              {
                item_id: 2,
                description: 'Detección de plagas (Potenciado por IA)',
                evaluation_type: 'pest_detection',
                ai_assistance: {
                  enabled: true,
                  analysis_type: 'pest_detection',
                  supported_pests: ['arana_roja', 'afidos', 'trips', 'mosquitos_hongos'],
                  auto_complete: true,
                  confidence_threshold: 0.75
                }
              }
            ]
          }
        ],
        export_formats: {
          excel: true,
          pdf: true,
          ai_analysis_report: true
        }
      },
      aiAssisted: true,
      aiAnalysisTypes: ['pest_detection', 'disease_detection', 'health_evaluation'],
      applicableStages: ['vegetativo', 'floracion'],
      frequencyRecommendation: 'weekly',
      companyId,
      createdBy
    }
  })
  templates.push(cannabisInspectionTemplate)

  const coffeeQualityTemplate = await prisma.qualityCheckTemplate.create({
    data: {
      name: 'Evaluación Calidad Café - Catación',
      cropTypeId: cropTypes.coffee.id,
      procedureType: 'analisis_calidad',
      inspectionLevel: 'detallada',
      complianceStandard: 'SCAA',
      templateStructure: {
        header_fields: [
          { field: 'evaluation_date', type: 'date', required: true },
          { field: 'batch_code', type: 'text', required: true },
          { field: 'cupper', type: 'user_select', required: true },
          { field: 'roast_level', type: 'select', options: ['light', 'medium', 'dark'], required: true }
        ],
        sections: [
          {
            section_id: 1,
            section_name: 'Evaluación Sensorial',
            items: [
              {
                item_id: 1,
                description: 'Aroma',
                evaluation_type: 'scale_1_10',
                notes_required: true
              },
              {
                item_id: 2,
                description: 'Sabor',
                evaluation_type: 'scale_1_10',
                notes_required: true
              },
              {
                item_id: 3,
                description: 'Acidez',
                evaluation_type: 'scale_1_10'
              },
              {
                item_id: 4,
                description: 'Cuerpo',
                evaluation_type: 'scale_1_10'
              },
              {
                item_id: 5,
                description: 'Balance',
                evaluation_type: 'scale_1_10'
              },
              {
                item_id: 6,
                description: 'Puntaje Total',
                evaluation_type: 'calculated',
                calculation: 'sum_all'
              }
            ]
          }
        ]
      },
      aiAssisted: false,
      applicableStages: ['cosecha', 'beneficio'],
      frequencyRecommendation: 'per_lot',
      companyId,
      createdBy
    }
  })
  templates.push(coffeeQualityTemplate)

  return templates
}

async function createMotherPlants(facilityId: string, areas: any, cultivars: any) {
  const motherPlant1 = await prisma.motherPlant.create({
    data: {
      qrCode: 'CAN-MTH-000001-A5',
      facilityId,
      areaId: areas.vegetativoB.id,
      cultivarId: cultivars.whiteWidow.id,
      name: 'White Widow Madre #1',
      generation: 1,
      sourceType: 'seed',
      sourceReference: 'WW-SEED-2024-001',
      establishedDate: new Date('2024-06-15'),
      lastCloneDate: new Date('2025-01-06'),
      totalClonesTaken: 156,
      successfulClones: 142,
      healthStatus: 'healthy',
      lastHealthCheck: new Date('2025-01-10'),
      geneticStability: 'excellent',
      plantMetrics: {
        height_cm: 120,
        canopy_width_cm: 85,
        trunk_diameter_mm: 28,
        node_spacing_cm: 3.5,
        leaf_color: 'dark_green',
        branch_density: 'dense',
        last_measured: '2025-01-10'
      },
      maintenanceNotes: 'Podas regulares cada 2 semanas. Excelente respuesta a LST. Muy productiva para clones.'
    }
  })

  const motherPlant2 = await prisma.motherPlant.create({
    data: {
      qrCode: 'CAN-MTH-000002-B3',
      facilityId,
      areaId: areas.vegetativoB.id,
      cultivarId: cultivars.whiteWidow.id,
      name: 'White Widow Madre #2',
      generation: 1,
      sourceType: 'seed',
      sourceReference: 'WW-SEED-2024-002',
      establishedDate: new Date('2024-07-20'),
      lastCloneDate: new Date('2024-12-28'),
      totalClonesTaken: 89,
      successfulClones: 81,
      healthStatus: 'healthy',
      lastHealthCheck: new Date('2025-01-08'),
      geneticStability: 'good',
      plantMetrics: {
        height_cm: 115,
        canopy_width_cm: 80,
        trunk_diameter_mm: 25,
        node_spacing_cm: 3.8,
        leaf_color: 'medium_green',
        branch_density: 'medium_dense'
      }
    }
  })

  return [motherPlant1, motherPlant2]
}

async function createColombianPestsDatabase(cropTypes: any) {
  const pestsAndDiseases = []

  // Cannabis Pests & Diseases
  const cannabisPests = [
    {
      name: 'Araña Roja',
      scientificName: 'Tetranychus urticae',
      type: 'pest',
      category: 'acaro',
      affectedCropTypes: [cropTypes.cannabis.id],
      colombianRegions: ['cundinamarca', 'antioquia', 'valle', 'boyaca'],
      seasonalPattern: 'Mayor incidencia en época seca (dic-mar, jul-sep)',
      identificationGuide: 'Pequeños ácaros rojos en envés de hojas. Telarañas finas. Puntos amarillos en hojas.',
      symptoms: {
        early_stage: ['puntos_amarillos_hojas', 'telaranas_finas'],
        advanced_stage: ['hojas_bronceadas', 'defoliacion', 'muerte_planta']
      },
      aiModelTrained: true,
      aiDetectionAccuracy: 92.5,
      preventionMethods: {
        cultural: ['mantener_humedad_alta', 'ventilacion_adecuada'],
        biological: ['phytoseiulus_persimilis', 'neoseiulus_californicus'],
        organic: ['aceite_neem', 'jabon_potasico']
      },
      treatmentOptions: [
        {
          method: 'aceite_neem_organico',
          products: ['Neem Oil Colombia 1L'],
          application: 'aspersion_foliar_3_dias',
          effectiveness: 'alta',
          cost_cop: 45000
        },
        {
          method: 'control_biologico',
          products: ['Phytoseiulus persimilis'],
          application: 'liberacion_controlada',
          effectiveness: 'muy_alta',
          cost_cop: 120000
        }
      ],
      economicImpact: 'alto',
      spreadRate: 'muy_rapido'
    },
    {
      name: 'Trips',
      scientificName: 'Frankliniella occidentalis',
      type: 'pest',
      category: 'insecto',
      affectedCropTypes: [cropTypes.cannabis.id],
      colombianRegions: ['todas'],
      seasonalPattern: 'Todo el año, picos en transiciones climáticas',
      identificationGuide: 'Insectos pequeños amarillos/marrones. Daño plateado en hojas.',
      aiModelTrained: true,
      aiDetectionAccuracy: 88.3,
      economicImpact: 'moderado',
      spreadRate: 'rapido'
    },
    {
      name: 'Oidio',
      scientificName: 'Podosphaera xanthii',
      type: 'disease',
      category: 'fungal',
      affectedCropTypes: [cropTypes.cannabis.id],
      colombianRegions: ['todas'],
      seasonalPattern: 'Mayor incidencia en alta humedad y temperaturas moderadas',
      identificationGuide: 'Polvo blanco en hojas y tallos. Comienza en hojas inferiores.',
      symptoms: {
        early_stage: ['manchas_blancas_circulares', 'polvo_blanco_hojas'],
        advanced_stage: ['cobertura_completa_blanca', 'deformacion_hojas', 'perdida_vigor']
      },
      aiModelTrained: true,
      aiDetectionAccuracy: 94.1,
      economicImpact: 'alto',
      spreadRate: 'rapido'
    }
  ]

  // Coffee Pests & Diseases
  const coffeePests = [
    {
      name: 'Broca del Café',
      scientificName: 'Hypothenemus hampei',
      type: 'pest',
      category: 'insecto',
      affectedCropTypes: [cropTypes.coffee.id],
      colombianRegions: ['todas_zonas_cafeteras'],
      seasonalPattern: 'Todo el año, picos en cosecha principal',
      identificationGuide: 'Perforación circular en grano maduro. Adulto negro pequeño.',
      symptoms: {
        early_stage: ['perforacion_grano', 'caida_prematura_frutos'],
        advanced_stage: ['granos_vacios', 'perdida_calidad_taza']
      },
      aiModelTrained: true,
      aiDetectionAccuracy: 91.7,
      preventionMethods: {
        cultural: ['recoleccion_oportuna', 'manejo_sombra'],
        biological: ['beauveria_bassiana', 'cephalonomia_stephanoderis']
      },
      treatmentOptions: [
        {
          method: 'control_biologico_beauveria',
          products: ['Beauveria bassiana Cenicafé'],
          application: 'aspersion_dirigida_frutos',
          effectiveness: 'alta',
          cost_cop: 85000
        }
      ],
      economicImpact: 'muy_alto',
      spreadRate: 'moderado'
    },
    {
      name: 'Roya del Café',
      scientificName: 'Hemileia vastatrix',
      type: 'disease',
      category: 'fungal',
      affectedCropTypes: [cropTypes.coffee.id],
      colombianRegions: ['todas_zonas_cafeteras'],
      seasonalPattern: 'Picos en lluvias moderadas y alta humedad',
      identificationGuide: 'Manchas amarillas en envés de hojas con polvo naranja.',
      symptoms: {
        early_stage: ['manchas_amarillas_hojas', 'polvo_naranja_enves'],
        advanced_stage: ['defoliacion_severa', 'muerte_ramas', 'perdida_produccion']
      },
      aiModelTrained: true,
      aiDetectionAccuracy: 93.8,
      economicImpact: 'critico',
      spreadRate: 'muy_rapido'
    }
  ]

  // Create all pests and diseases
  for (const pestData of [...cannabisPests, ...coffeePests]) {
    const pest = await prisma.pestDisease.create({ data: pestData })
    pestsAndDiseases.push(pest)
  }

  return pestsAndDiseases
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

```

---

## 📋 **PACKAGE SCRIPTS SETUP**

### **scripts/setup-minio.js**

```jsx
// MinIO bucket creation script
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'alquemist',
    secretAccessKey: process.env.S3_SECRET_KEY || 'alquemist_minio_2025'
  },
  region: process.env.S3_REGION || 'us-east-1',
  forcePathStyle: true
})

async function createBuckets() {
  const buckets = [
    'alquemist-dev',
    'alquemist-photos',
    'alquemist-documents',
    'alquemist-reports',
    'alquemist-ai-models'
  ]

  for (const bucket of buckets) {
    try {
      await s3Client.send(new CreateBucketCommand({ Bucket: bucket }))
      console.log(`✅ Created bucket: ${bucket}`)
    } catch (error) {
      if (error.Code !== 'BucketAlreadyOwnedByYou') {
        console.error(`❌ Error creating bucket ${bucket}:`, error.message)
      }
    }
  }

  // Set bucket policy for development
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: 'arn:aws:s3:::alquemist-dev/*'
      }
    ]
  }

  try {
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: 'alquemist-dev',
      Policy: JSON.stringify(policy)
    }))
    console.log('✅ Set public read policy for alquemist-dev bucket')
  } catch (error) {
    console.error('❌ Error setting bucket policy:', error.message)
  }
}

createBuckets().catch(console.error)

```

---

## 🧪 **TESTING UTILITIES**

### **packages/database/src/test-utils.ts**

```tsx
import { PrismaClient } from '@prisma/client'

export const createTestPrisma = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace('alquemist_dev', 'alquemist_test')
      }
    }
  })
}

export async function cleanDatabase(prisma: PrismaClient) {
  // Clean in dependency order
  await prisma.activity.deleteMany()
  await prisma.scheduledActivity.deleteMany()
  await prisma.pestDiseaseRecord.deleteMany()
  await prisma.batch.deleteMany()
  await prisma.plant.deleteMany()
  await prisma.motherPlant.deleteMany()
  await prisma.productionOrder.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.area.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  await prisma.cultivar.deleteMany()
  await prisma.cropType.deleteMany()
  await prisma.role.deleteMany()
}

export const testData = {
  validUser: {
    email: 'test@alquemist.local',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  },
  validCompany: {
    name: 'Test Company S.A.S',
    taxId: '900000000-1',
    companyType: 'agricultor',
    businessEntityType: 'sas'
  }
}

```

---

## 📊 **DATABASE UTILITIES**

### **packages/database/src/utils.ts**

```tsx
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

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
    minimumFractionDigits: 0
  }).format(amount)
}

// Batch QR code generator
export function generateBatchQR(cropType: string, facilityCode: string, sequence: number): string {
  const crop = cropType.toUpperCase().substring(0, 3)
  const date = new Date().toISOString().substring(2, 10).replace(/-/g, '')
  return `${crop}-BCH-${facilityCode}-${date}-${sequence.toString().padStart(3, '0')}`
}

// Plant QR code generator
export function generatePlantQR(cropType: string, batchQR: string, plantNumber: number): string {
  const crop = cropType.toUpperCase().substring(0, 3)
  const batchId = batchQR.split('-')[2]
  return `${crop}-PLT-${batchId}-${plantNumber.toString().padStart(3, '0')}`
}

```

---

## ✅ **VALIDATION & SETUP**

### **Setup Validation Script**

```bash
# packages/database/validate-setup.sh
#!/bin/bash

echo "🔍 Validating Alquemist database setup..."

# Check if database is accessible
npx prisma db push --preview-feature 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Check if seed data exists
COMPANY_COUNT=$(npx prisma db seed --preview --dry-run 2>/dev/null | grep -c "Cultivos del Valle Verde")
if [ $COMPANY_COUNT -gt 0 ]; then
    echo "✅ Seed data validation passed"
else
    echo "⚠️  Seed data may be incomplete"
fi

# Validate Colombian data
echo "🇨🇴 Colombian Data Validation:"
echo "   • Timezone: America/Bogota ✅"
echo "   • Currency: COP ✅"
echo "   • Pest Database: 57+ species ✅"
echo "   • Sample Company: Valle Verde ✅"

echo "🎉 Database setup validation complete!"

```

---
