import { PrismaClient } from '../src/generated/client/index.js'
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
