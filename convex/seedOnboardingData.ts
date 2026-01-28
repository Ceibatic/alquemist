/**
 * Onboarding Sample Data Generator
 * Generates example data when a user completes registration
 * Includes: Areas, Cultivars, Suppliers, Products, Inventory, Production Template
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

// ============================================================================
// CROP CONFIGURATIONS
// ============================================================================

interface AreaConfig {
  name: string;
  type: string;
  climate_controlled: boolean;
  lighting_controlled: boolean;
  irrigation_system: boolean;
  environmental_specs: {
    temperature_min: number;
    temperature_max: number;
    humidity_min: number;
    humidity_max: number;
    light_hours?: number;
  };
}

interface CultivarConfig {
  name: string;
  variety_type: string;
  genetic_lineage: string;
  flowering_time_days?: number;
  thc_min?: number;
  thc_max?: number;
  cbd_min?: number;
  cbd_max?: number;
  notes?: string;
}

interface SupplierConfig {
  name: string;
  categories: string[];
  contact_name: string;
  contact_email: string;
}

interface ProductConfig {
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  weight_value: number;
  weight_unit: string;
  price: number;
  supplier_category: string;
}

interface PhaseConfig {
  name: string;
  duration_days: number;
  area_type: string;
  activities: ActivityConfig[];
}

interface ActivityConfig {
  name: string;
  type: string;
  is_recurring: boolean;
  frequency?: string;
  days_from_start: number;
  duration_minutes: number;
  instructions?: string;
}

interface CropConfig {
  areas: AreaConfig[];
  cultivars: CultivarConfig[];
  suppliers: SupplierConfig[];
  products: ProductConfig[];
  template: {
    name: string;
    category: string;
    method: string;
    source_type: string;
    batch_size: number;
    difficulty: string;
  };
  phases: PhaseConfig[];
}

// Cannabis Configuration (Primary - Complete Implementation)
const cannabisConfig: CropConfig = {
  areas: [
    {
      name: "Almacén (Demo)",
      type: "storage",
      climate_controlled: true,
      lighting_controlled: false,
      irrigation_system: false,
      environmental_specs: {
        temperature_min: 15,
        temperature_max: 22,
        humidity_min: 50,
        humidity_max: 60,
      },
    },
    {
      name: "Propagación (Demo)",
      type: "propagation",
      climate_controlled: true,
      lighting_controlled: true,
      irrigation_system: true,
      environmental_specs: {
        temperature_min: 22,
        temperature_max: 26,
        humidity_min: 70,
        humidity_max: 85,
        light_hours: 18,
      },
    },
    {
      name: "Vegetativo (Demo)",
      type: "vegetative",
      climate_controlled: true,
      lighting_controlled: true,
      irrigation_system: true,
      environmental_specs: {
        temperature_min: 22,
        temperature_max: 28,
        humidity_min: 55,
        humidity_max: 70,
        light_hours: 18,
      },
    },
    {
      name: "Floración (Demo)",
      type: "flowering",
      climate_controlled: true,
      lighting_controlled: true,
      irrigation_system: true,
      environmental_specs: {
        temperature_min: 20,
        temperature_max: 26,
        humidity_min: 40,
        humidity_max: 55,
        light_hours: 12,
      },
    },
    {
      name: "Secado (Demo)",
      type: "drying",
      climate_controlled: true,
      lighting_controlled: false,
      irrigation_system: false,
      environmental_specs: {
        temperature_min: 18,
        temperature_max: 21,
        humidity_min: 55,
        humidity_max: 65,
      },
    },
    {
      name: "Curado (Demo)",
      type: "curing",
      climate_controlled: true,
      lighting_controlled: false,
      irrigation_system: false,
      environmental_specs: {
        temperature_min: 16,
        temperature_max: 20,
        humidity_min: 58,
        humidity_max: 65,
      },
    },
  ],
  cultivars: [
    {
      name: "Blue Dream (Demo)",
      variety_type: "hybrid",
      genetic_lineage: "Blueberry x Haze",
      flowering_time_days: 65,
      thc_min: 17,
      thc_max: 24,
      cbd_min: 0.1,
      cbd_max: 0.2,
      notes: "Aromas: blueberry, sweet, herbal. Rendimiento: 500-600g/m².",
    },
    {
      name: "OG Kush (Demo)",
      variety_type: "indica",
      genetic_lineage: "Hindu Kush x Chemdawg",
      flowering_time_days: 56,
      thc_min: 20,
      thc_max: 26,
      cbd_min: 0.1,
      cbd_max: 0.3,
      notes: "Aromas: pine, fuel, earthy. Genética estable.",
    },
    {
      name: "Colombian Gold (Demo)",
      variety_type: "sativa",
      genetic_lineage: "Landrace Colombiana (Santa Marta)",
      flowering_time_days: 84,
      thc_min: 16,
      thc_max: 20,
      cbd_min: 0.5,
      cbd_max: 1,
      notes: "Genética nativa colombiana, perfectamente adaptada al clima local.",
    },
    {
      name: "White Widow (Demo)",
      variety_type: "hybrid",
      genetic_lineage: "Brazilian Sativa x South Indian Indica",
      flowering_time_days: 60,
      thc_min: 18,
      thc_max: 25,
      cbd_min: 0.1,
      cbd_max: 0.2,
      notes: "Aromas: earthy, woody, pungent. Alta resina, ideal para extracción.",
    },
    {
      name: "Critical Mass (Demo)",
      variety_type: "indica",
      genetic_lineage: "Afghani x Skunk #1",
      flowering_time_days: 50,
      thc_min: 19,
      thc_max: 22,
      cbd_min: 5,
      cbd_max: 8,
      notes: "Alto CBD, ideal para uso medicinal. Rendimiento muy alto: 600-750g/m².",
    },
  ],
  suppliers: [
    {
      name: "NutriCultivos (Demo)",
      categories: ["nutrients", "fertilizers"],
      contact_name: "Carlos Demo",
      contact_email: "demo@nutricultivos.co",
    },
    {
      name: "GeneSemillas (Demo)",
      categories: ["seeds", "genetics"],
      contact_name: "María Demo",
      contact_email: "demo@genesemillas.co",
    },
    {
      name: "AgroEquipos (Demo)",
      categories: ["equipment", "irrigation", "lighting"],
      contact_name: "Andrés Demo",
      contact_email: "demo@agroequipos.co",
    },
    {
      name: "BioProtect (Demo)",
      categories: ["pesticides", "biological_control"],
      contact_name: "Juliana Demo",
      contact_email: "demo@bioprotect.co",
    },
  ],
  products: [
    // Nutrients (5)
    { sku: "DEMO-NUT-A", name: "Nutriente Base A (Demo)", category: "nutrient", subcategory: "base", weight_value: 1, weight_unit: "L", price: 85000, supplier_category: "nutrients" },
    { sku: "DEMO-NUT-B", name: "Nutriente Base B (Demo)", category: "nutrient", subcategory: "base", weight_value: 1, weight_unit: "L", price: 85000, supplier_category: "nutrients" },
    { sku: "DEMO-BLOOM-A", name: "Floración A (Demo)", category: "nutrient", subcategory: "bloom", weight_value: 1, weight_unit: "L", price: 95000, supplier_category: "nutrients" },
    { sku: "DEMO-BLOOM-B", name: "Floración B (Demo)", category: "nutrient", subcategory: "bloom", weight_value: 1, weight_unit: "L", price: 95000, supplier_category: "nutrients" },
    { sku: "DEMO-CALMAG", name: "Cal-Mag Plus (Demo)", category: "nutrient", subcategory: "supplement", weight_value: 1, weight_unit: "L", price: 65000, supplier_category: "nutrients" },
    // Substrates (3)
    { sku: "DEMO-COCO", name: "Fibra de Coco (Demo)", category: "substrate", subcategory: "coco", weight_value: 70, weight_unit: "L", price: 45000, supplier_category: "nutrients" },
    { sku: "DEMO-PERLITE", name: "Perlita (Demo)", category: "substrate", subcategory: "amendment", weight_value: 100, weight_unit: "L", price: 55000, supplier_category: "nutrients" },
    { sku: "DEMO-MIX", name: "Sustrato Cannabis Mix (Demo)", category: "substrate", subcategory: "mix", weight_value: 50, weight_unit: "L", price: 65000, supplier_category: "nutrients" },
    // Pesticides (2)
    { sku: "DEMO-NEEM", name: "Aceite de Neem (Demo)", category: "pesticide", subcategory: "organic", weight_value: 1, weight_unit: "L", price: 75000, supplier_category: "pesticides" },
    { sku: "DEMO-BT", name: "Bacillus thuringiensis (Demo)", category: "pesticide", subcategory: "biological", weight_value: 500, weight_unit: "g", price: 180000, supplier_category: "pesticides" },
    // Equipment (2)
    { sku: "DEMO-LED", name: "LED 600W (Demo)", category: "equipment", subcategory: "lighting", weight_value: 1, weight_unit: "units", price: 2800000, supplier_category: "equipment" },
    { sku: "DEMO-FAN", name: "Ventilador (Demo)", category: "equipment", subcategory: "climate", weight_value: 1, weight_unit: "units", price: 180000, supplier_category: "equipment" },
    // Tools (2)
    { sku: "DEMO-TRIM", name: "Tijeras Poda (Demo)", category: "tool", subcategory: "cutting", weight_value: 1, weight_unit: "units", price: 45000, supplier_category: "equipment" },
    { sku: "DEMO-PHEC", name: "Medidor pH/EC (Demo)", category: "tool", subcategory: "measuring", weight_value: 1, weight_unit: "units", price: 650000, supplier_category: "equipment" },
  ],
  template: {
    name: "Cannabis Indoor Estándar (Demo)",
    category: "seed-to-harvest",
    method: "indoor",
    source_type: "clone",
    batch_size: 50,
    difficulty: "intermediate",
  },
  phases: [
    {
      name: "Propagación",
      duration_days: 14,
      area_type: "propagation",
      activities: [
        { name: "Preparación de esquejes", type: "planting", is_recurring: false, days_from_start: 0, duration_minutes: 120, instructions: "Cortar esquejes de 10-15cm, aplicar hormona enraizante y colocar en sustrato húmedo." },
        { name: "Riego", type: "watering", is_recurring: true, frequency: "daily", days_from_start: 1, duration_minutes: 20, instructions: "Mantener sustrato húmedo pero no encharcado." },
        { name: "Inspección", type: "inspection", is_recurring: true, frequency: "every_3_days", days_from_start: 3, duration_minutes: 30, instructions: "Verificar desarrollo de raíces y estado general de los esquejes." },
      ],
    },
    {
      name: "Vegetativo",
      duration_days: 28,
      area_type: "vegetative",
      activities: [
        { name: "Riego", type: "watering", is_recurring: true, frequency: "daily", days_from_start: 0, duration_minutes: 30, instructions: "Regar hasta obtener 10-20% de escurrimiento." },
        { name: "Fertilización", type: "feeding", is_recurring: true, frequency: "every_3_days", days_from_start: 3, duration_minutes: 45, instructions: "Aplicar nutrientes de crecimiento según tabla del fabricante." },
        { name: "Poda de formación", type: "pruning", is_recurring: true, frequency: "weekly", days_from_start: 7, duration_minutes: 60, instructions: "Realizar topping o LST según técnica elegida." },
        { name: "Inspección", type: "inspection", is_recurring: true, frequency: "weekly", days_from_start: 7, duration_minutes: 45, instructions: "Revisar plagas, deficiencias y estado general." },
      ],
    },
    {
      name: "Floración",
      duration_days: 56,
      area_type: "flowering",
      activities: [
        { name: "Riego", type: "watering", is_recurring: true, frequency: "daily", days_from_start: 0, duration_minutes: 30, instructions: "Mantener riego consistente, evitar fluctuaciones." },
        { name: "Fertilización floración", type: "feeding", is_recurring: true, frequency: "every_3_days", days_from_start: 1, duration_minutes: 45, instructions: "Cambiar a nutrientes de floración altos en P y K." },
        { name: "Inspección de madurez", type: "inspection", is_recurring: true, frequency: "every_2_days", days_from_start: 35, duration_minutes: 45, instructions: "Revisar tricomas con lupa, buscar 70% ámbar para cosecha." },
      ],
    },
    {
      name: "Secado",
      duration_days: 14,
      area_type: "drying",
      activities: [
        { name: "Corte y colgado", type: "harvest", is_recurring: false, days_from_start: 0, duration_minutes: 180, instructions: "Cortar plantas, remover hojas grandes y colgar boca abajo en área oscura." },
        { name: "Control de secado", type: "inspection", is_recurring: true, frequency: "daily", days_from_start: 1, duration_minutes: 30, instructions: "Verificar humedad (55-65%) y temperatura (18-21°C). Tallos deben crujir." },
      ],
    },
    {
      name: "Curado",
      duration_days: 21,
      area_type: "curing",
      activities: [
        { name: "Almacenamiento en frascos", type: "movement", is_recurring: false, days_from_start: 0, duration_minutes: 120, instructions: "Colocar flores secas en frascos herméticos de vidrio, llenados al 75%." },
        { name: "Burping (apertura)", type: "inspection", is_recurring: true, frequency: "daily", days_from_start: 1, duration_minutes: 15, instructions: "Abrir frascos 10-15 minutos para liberar humedad. Más frecuente la primera semana." },
      ],
    },
  ],
};

// Function to get crop configuration
function getCropConfig(cropName: string): CropConfig | null {
  const name = cropName.toLowerCase();
  if (name === "cannabis") {
    return cannabisConfig;
  }
  // Future: Add coffee, cocoa, flowers configs
  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function seedOnboardingAreas(
  ctx: MutationCtx,
  facilityId: Id<"facilities">,
  cropTypeId: Id<"crop_types">,
  config: CropConfig
): Promise<{ success: boolean; count: number; ids: Id<"areas">[]; storageAreaId?: Id<"areas">; areasByType: Record<string, Id<"areas">> }> {
  const now = Date.now();
  const areaIds: Id<"areas">[] = [];
  const areasByType: Record<string, Id<"areas">> = {};
  let storageAreaId: Id<"areas"> | undefined;

  for (const areaConfig of config.areas) {
    const areaId = await ctx.db.insert("areas", {
      facility_id: facilityId,
      name: areaConfig.name,
      area_type: areaConfig.type,
      compatible_crop_type_ids: [cropTypeId],
      current_crop_type_id: areaConfig.type !== "storage" ? cropTypeId : undefined,
      length_meters: 10,
      width_meters: 8,
      height_meters: 3,
      total_area_m2: 80,
      usable_area_m2: 70,
      capacity_configurations: { max_capacity: 200 },
      current_occupancy: 0,
      reserved_capacity: 0,
      climate_controlled: areaConfig.climate_controlled,
      lighting_controlled: areaConfig.lighting_controlled,
      irrigation_system: areaConfig.irrigation_system,
      environmental_specs: areaConfig.environmental_specs,
      equipment_list: [],
      status: "active",
      notes: `Área de ejemplo para ${areaConfig.type}`,
      created_at: now,
      updated_at: now,
    });

    areaIds.push(areaId);
    areasByType[areaConfig.type] = areaId;

    if (areaConfig.type === "storage") {
      storageAreaId = areaId;
    }
  }

  return { success: true, count: areaIds.length, ids: areaIds, storageAreaId, areasByType };
}

async function seedOnboardingCultivars(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  cropTypeId: Id<"crop_types">,
  config: CropConfig
): Promise<{ success: boolean; count: number; ids: Id<"cultivars">[]; firstCultivarId?: Id<"cultivars"> }> {
  const now = Date.now();
  const cultivarIds: Id<"cultivars">[] = [];

  for (const cultivarConfig of config.cultivars) {
    const cultivarId = await ctx.db.insert("cultivars", {
      company_id: companyId,
      crop_type_id: cropTypeId,
      name: cultivarConfig.name,
      variety_type: cultivarConfig.variety_type,
      genetic_lineage: cultivarConfig.genetic_lineage,
      flowering_time_days: cultivarConfig.flowering_time_days,
      thc_min: cultivarConfig.thc_min,
      thc_max: cultivarConfig.thc_max,
      cbd_min: cultivarConfig.cbd_min,
      cbd_max: cultivarConfig.cbd_max,
      performance_metrics: {},
      status: "active",
      notes: cultivarConfig.notes,
      created_at: now,
      updated_at: now,
    });
    cultivarIds.push(cultivarId);
  }

  return {
    success: true,
    count: cultivarIds.length,
    ids: cultivarIds,
    firstCultivarId: cultivarIds[0],
  };
}

async function seedOnboardingSuppliers(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  config: CropConfig
): Promise<{ success: boolean; count: number; suppliersByCategory: Record<string, Id<"suppliers">> }> {
  const now = Date.now();
  const suppliersByCategory: Record<string, Id<"suppliers">> = {};

  for (const supplierConfig of config.suppliers) {
    const supplierId = await ctx.db.insert("suppliers", {
      company_id: companyId,
      name: supplierConfig.name,
      legal_name: supplierConfig.name.replace(" (Demo)", " S.A.S. (Demo)"),
      tax_id: `900${Math.floor(Math.random() * 900000 + 100000)}-${Math.floor(Math.random() * 9)}`,
      business_type: "S.A.S.",
      primary_contact_name: supplierConfig.contact_name,
      primary_contact_email: supplierConfig.contact_email,
      primary_contact_phone: "+57 300 000 0000",
      address: "Dirección de ejemplo",
      city: "Bogotá",
      administrative_division_1: "Cundinamarca",
      country: "CO",
      product_categories: supplierConfig.categories,
      crop_specialization: ["cannabis"],
      rating: 4.5,
      delivery_reliability: 90,
      quality_score: 90,
      certifications: [],
      payment_terms: "Net 30",
      currency: "COP",
      is_approved: true,
      is_active: true,
      notes: "Proveedor de ejemplo generado automáticamente",
      created_at: now,
      updated_at: now,
    });

    // Map all categories to this supplier
    for (const category of supplierConfig.categories) {
      suppliersByCategory[category] = supplierId;
    }
  }

  return { success: true, count: config.suppliers.length, suppliersByCategory };
}

async function seedOnboardingProducts(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  cropTypeId: Id<"crop_types">,
  suppliersByCategory: Record<string, Id<"suppliers">>,
  config: CropConfig
): Promise<{ success: boolean; count: number; productIds: Id<"products">[] }> {
  const now = Date.now();
  const productIds: Id<"products">[] = [];

  for (const productConfig of config.products) {
    const supplierId = suppliersByCategory[productConfig.supplier_category];

    const productId = await ctx.db.insert("products", {
      company_id: companyId,
      sku: productConfig.sku,
      name: productConfig.name,
      description: `Producto de ejemplo: ${productConfig.name}`,
      category: productConfig.category,
      subcategory: productConfig.subcategory,
      applicable_crop_type_ids: [cropTypeId],
      preferred_supplier_id: supplierId,
      regional_suppliers: supplierId ? [supplierId] : [],
      weight_value: productConfig.weight_value,
      weight_unit: productConfig.weight_unit,
      regulatory_registered: false,
      organic_certified: false,
      default_price: productConfig.price,
      price_currency: "COP",
      price_unit: "per_unit",
      status: "active",
      created_at: now,
      updated_at: now,
    });
    productIds.push(productId);
  }

  return { success: true, count: productIds.length, productIds };
}

async function seedOnboardingInventory(
  ctx: MutationCtx,
  storageAreaId: Id<"areas">,
  productIds: Id<"products">[],
  suppliersByCategory: Record<string, Id<"suppliers">>
): Promise<{ success: boolean; count: number }> {
  const now = Date.now();
  let count = 0;

  for (const productId of productIds) {
    const product = await ctx.db.get(productId);
    if (!product) continue;

    // Determine quantity based on category
    let quantity = 10;
    let minStock = 5;
    let reorderPoint = 10;

    switch (product.category) {
      case "nutrient":
        quantity = Math.floor(Math.random() * 10) + 5;
        minStock = 3;
        reorderPoint = 5;
        break;
      case "substrate":
        quantity = Math.floor(Math.random() * 20) + 10;
        minStock = 10;
        reorderPoint = 15;
        break;
      case "pesticide":
        quantity = Math.floor(Math.random() * 5) + 2;
        minStock = 2;
        reorderPoint = 4;
        break;
      case "equipment":
      case "tool":
        quantity = Math.floor(Math.random() * 3) + 1;
        minStock = 1;
        reorderPoint = 2;
        break;
    }

    const supplierId = suppliersByCategory[product.category === "nutrient" || product.category === "substrate" ? "nutrients" : product.category === "pesticide" ? "pesticides" : "equipment"];

    await ctx.db.insert("inventory_items", {
      product_id: productId,
      area_id: storageAreaId,
      supplier_id: supplierId,
      quantity_available: quantity,
      quantity_reserved: 0,
      quantity_committed: 0,
      quantity_unit: product.weight_unit || "units",
      batch_number: `DEMO-${product.sku}-${Date.now().toString(36).toUpperCase()}`,
      received_date: now - 7 * 24 * 60 * 60 * 1000,
      purchase_price: (product.default_price || 50000) * quantity,
      current_value: (product.default_price || 50000) * quantity,
      cost_per_unit: product.default_price || 50000,
      quality_grade: "A",
      lot_status: "available",
      minimum_stock_level: minStock,
      reorder_point: reorderPoint,
      serial_numbers: [],
      certificates: [],
      last_movement_date: now,
      notes: `Inventario inicial de ejemplo`,
      created_at: now,
      updated_at: now,
    });
    count++;
  }

  return { success: true, count };
}

async function seedOnboardingTemplate(
  ctx: MutationCtx,
  companyId: Id<"companies">,
  cropTypeId: Id<"crop_types">,
  cultivarId: Id<"cultivars"> | undefined,
  config: CropConfig
): Promise<{ success: boolean; templateId?: Id<"production_templates">; phasesCount: number; activitiesCount: number }> {
  const now = Date.now();

  // Calculate total duration
  const totalDuration = config.phases.reduce((sum, phase) => sum + phase.duration_days, 0);

  // Create template
  const templateId = await ctx.db.insert("production_templates", {
    company_id: companyId,
    name: config.template.name,
    crop_type_id: cropTypeId,
    cultivar_id: cultivarId,
    template_category: config.template.category,
    production_method: config.template.method,
    source_type: config.template.source_type,
    default_batch_size: config.template.batch_size,
    enable_individual_tracking: false,
    description: "Plantilla de producción de ejemplo generada automáticamente. Incluye todas las fases desde propagación hasta curado.",
    estimated_duration_days: totalDuration,
    estimated_yield: 100,
    yield_unit: "g",
    difficulty_level: config.template.difficulty,
    environmental_requirements: {},
    space_requirements: {},
    estimated_cost: 5000000,
    cost_breakdown: {},
    usage_count: 0,
    is_public: false,
    status: "active",
    created_at: now,
    updated_at: now,
  });

  let phasesCount = 0;
  let activitiesCount = 0;
  let previousPhaseId: Id<"template_phases"> | undefined;

  // Create phases and activities
  for (let phaseIndex = 0; phaseIndex < config.phases.length; phaseIndex++) {
    const phaseConfig = config.phases[phaseIndex];

    const phaseId = await ctx.db.insert("template_phases", {
      template_id: templateId,
      phase_name: phaseConfig.name,
      phase_order: phaseIndex + 1,
      estimated_duration_days: phaseConfig.duration_days,
      area_type: phaseConfig.area_type,
      previous_phase_id: previousPhaseId,
      required_conditions: {},
      completion_criteria: {},
      required_equipment: [],
      required_materials: [],
      description: `Fase de ${phaseConfig.name.toLowerCase()} - ${phaseConfig.duration_days} días`,
      created_at: now,
    });

    phasesCount++;
    previousPhaseId = phaseId;

    // Create activities for this phase
    for (let activityIndex = 0; activityIndex < phaseConfig.activities.length; activityIndex++) {
      const activityConfig = phaseConfig.activities[activityIndex];

      await ctx.db.insert("template_activities", {
        phase_id: phaseId,
        activity_name: activityConfig.name,
        activity_order: activityIndex + 1,
        activity_type: activityConfig.type,
        is_recurring: activityConfig.is_recurring,
        is_quality_check: activityConfig.type === "inspection",
        timing_configuration: {
          days_from_phase_start: activityConfig.days_from_start,
          time_of_day: "08:00",
          ...(activityConfig.is_recurring && activityConfig.frequency && {
            frequency: activityConfig.frequency,
            recurring_until: "phase_end",
          }),
        },
        required_materials: [],
        estimated_duration_minutes: activityConfig.duration_minutes,
        skill_level_required: "beginner",
        instructions: activityConfig.instructions || "",
        safety_notes: "",
        created_at: now,
      });

      activitiesCount++;
    }
  }

  return { success: true, templateId, phasesCount, activitiesCount };
}

// ============================================================================
// MAIN MUTATIONS
// ============================================================================

/**
 * Generate sample data for a new company after onboarding
 */
export const generateSampleDataForNewCompany = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
    userId: v.id("users"),
    cropTypeId: v.id("crop_types"),
  },
  handler: async (ctx, args) => {
    const results = {
      areas: { success: false, count: 0, error: null as string | null },
      cultivars: { success: false, count: 0, error: null as string | null },
      suppliers: { success: false, count: 0, error: null as string | null },
      products: { success: false, count: 0, error: null as string | null },
      inventory: { success: false, count: 0, error: null as string | null },
      template: { success: false, phases: 0, activities: 0, error: null as string | null },
    };

    // Get crop type to determine configuration
    const cropType = await ctx.db.get(args.cropTypeId);
    if (!cropType) {
      throw new Error("Crop type not found");
    }

    // Get crop-specific configuration
    const config = getCropConfig(cropType.name);
    if (!config) {
      return {
        success: false,
        skipped: true,
        message: `No sample data configuration available for crop type: ${cropType.name}. Only Cannabis is currently supported.`,
        results,
      };
    }

    // Check idempotency - if demo areas exist, skip all seeding
    const existingAreas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const hasDemoAreas = existingAreas.some((a) => a.name.includes("(Demo)"));
    if (hasDemoAreas) {
      return {
        success: true,
        skipped: true,
        message: "Sample data already exists for this facility",
        results,
      };
    }

    // 1. Seed Areas
    try {
      const areasResult = await seedOnboardingAreas(ctx, args.facilityId, args.cropTypeId, config);
      results.areas = { success: true, count: areasResult.count, error: null };

      // 2. Seed Cultivars
      try {
        const cultivarsResult = await seedOnboardingCultivars(ctx, args.companyId, args.cropTypeId, config);
        results.cultivars = { success: true, count: cultivarsResult.count, error: null };

        // 3. Seed Suppliers
        try {
          const suppliersResult = await seedOnboardingSuppliers(ctx, args.companyId, config);
          results.suppliers = { success: true, count: suppliersResult.count, error: null };

          // 4. Seed Products
          try {
            const productsResult = await seedOnboardingProducts(ctx, args.companyId, args.cropTypeId, suppliersResult.suppliersByCategory, config);
            results.products = { success: true, count: productsResult.count, error: null };

            // 5. Seed Inventory (requires storage area and products)
            if (areasResult.storageAreaId) {
              try {
                const inventoryResult = await seedOnboardingInventory(ctx, areasResult.storageAreaId, productsResult.productIds, suppliersResult.suppliersByCategory);
                results.inventory = { success: true, count: inventoryResult.count, error: null };
              } catch (error) {
                results.inventory.error = error instanceof Error ? error.message : "Unknown error";
              }
            }

            // 6. Seed Production Template
            try {
              const templateResult = await seedOnboardingTemplate(ctx, args.companyId, args.cropTypeId, cultivarsResult.firstCultivarId, config);
              results.template = { success: true, phases: templateResult.phasesCount, activities: templateResult.activitiesCount, error: null };
            } catch (error) {
              results.template.error = error instanceof Error ? error.message : "Unknown error";
            }

          } catch (error) {
            results.products.error = error instanceof Error ? error.message : "Unknown error";
          }
        } catch (error) {
          results.suppliers.error = error instanceof Error ? error.message : "Unknown error";
        }
      } catch (error) {
        results.cultivars.error = error instanceof Error ? error.message : "Unknown error";
      }
    } catch (error) {
      results.areas.error = error instanceof Error ? error.message : "Unknown error";
    }

    return {
      success: true,
      skipped: false,
      message: `Sample data generated: ${results.areas.count} areas, ${results.cultivars.count} cultivars, ${results.suppliers.count} suppliers, ${results.products.count} products, ${results.inventory.count} inventory items, ${results.template.phases} phases with ${results.template.activities} activities`,
      results,
    };
  },
});

/**
 * Check if sample data exists for a facility
 */
export const hasSampleData = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const facility = await ctx.db.get(args.facilityId);
    if (!facility) {
      return { exists: false, counts: {} };
    }

    // Check for demo areas
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();
    const demoAreas = areas.filter((a) => a.name.includes("(Demo)"));

    // Check for demo suppliers
    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", facility.company_id))
      .collect();
    const demoSuppliers = suppliers.filter((s) => s.name.includes("(Demo)"));

    // Check for demo templates
    const templates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", facility.company_id))
      .collect();
    const demoTemplates = templates.filter((t) => t.name.includes("(Demo)"));

    return {
      exists: demoAreas.length > 0 || demoSuppliers.length > 0 || demoTemplates.length > 0,
      counts: {
        areas: demoAreas.length,
        suppliers: demoSuppliers.length,
        templates: demoTemplates.length,
      },
    };
  },
});

/**
 * Clear all sample data for a facility
 */
export const clearSampleData = mutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    const deleted = {
      areas: 0,
      inventory: 0,
      suppliers: 0,
      products: 0,
      cultivars: 0,
      templates: 0,
      phases: 0,
      activities: 0,
    };

    // 1. Delete demo areas and their inventory
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    for (const area of areas) {
      if (area.name.includes("(Demo)")) {
        // Delete inventory in this area first
        const inventory = await ctx.db
          .query("inventory_items")
          .withIndex("by_area", (q) => q.eq("area_id", area._id))
          .collect();
        for (const item of inventory) {
          await ctx.db.delete(item._id);
          deleted.inventory++;
        }
        await ctx.db.delete(area._id);
        deleted.areas++;
      }
    }

    // 2. Delete demo suppliers
    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    for (const supplier of suppliers) {
      if (supplier.name.includes("(Demo)")) {
        await ctx.db.delete(supplier._id);
        deleted.suppliers++;
      }
    }

    // 3. Delete demo products
    const products = await ctx.db.query("products").collect();
    for (const product of products) {
      if (product.name.includes("(Demo)") || product.sku.startsWith("DEMO-")) {
        await ctx.db.delete(product._id);
        deleted.products++;
      }
    }

    // 4. Delete demo cultivars (cultivars don't have Demo suffix but we can identify by name pattern)
    // Note: We don't delete cultivars by default as they might be real varieties the user wants to keep

    // 5. Delete demo templates with phases and activities
    const templates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", args.companyId))
      .collect();

    for (const template of templates) {
      if (template.name.includes("(Demo)")) {
        // Delete phases and activities
        const phases = await ctx.db
          .query("template_phases")
          .withIndex("by_template", (q) => q.eq("template_id", template._id))
          .collect();

        for (const phase of phases) {
          const activities = await ctx.db
            .query("template_activities")
            .withIndex("by_phase", (q) => q.eq("phase_id", phase._id))
            .collect();
          for (const activity of activities) {
            await ctx.db.delete(activity._id);
            deleted.activities++;
          }
          await ctx.db.delete(phase._id);
          deleted.phases++;
        }
        await ctx.db.delete(template._id);
        deleted.templates++;
      }
    }

    return {
      success: true,
      message: "Sample data cleared",
      deleted,
    };
  },
});
