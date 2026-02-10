/**
 * Activity Types — Configurable catalog of activity types per company
 *
 * Each company has its own set of activity types. System types (is_system: true)
 * are seeded from DEFAULT_ACTIVITY_TYPES and cannot be archived.
 * Custom types (is_system: false) can be created, edited, and archived.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getActivityTypeByCode } from "./helpers";

// Inline seed data to avoid importing from lib/ (Convex server-side restriction)
const DEFAULT_SEED_TYPES = [
  // Cultivation (6)
  { code: "seeding", name: "Siembra", category: "cultivation", icon: "Sprout", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "transplant", name: "Trasplante", category: "cultivation", icon: "ArrowRightLeft", color: "green", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "irrigation", name: "Riego", category: "cultivation", icon: "Droplets", color: "blue", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "fertigation", name: "Fertirrigacion", category: "cultivation", icon: "Droplets", color: "teal", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "pruning", name: "Poda", category: "cultivation", icon: "Scissors", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "training", name: "Tutorado / Entrenamiento", category: "cultivation", icon: "GitBranch", color: "green", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Monitoring (4)
  { code: "scouting", name: "Monitoreo de plagas/enfermedades", category: "monitoring", icon: "Search", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "growth_check", name: "Medicion de crecimiento", category: "monitoring", icon: "Ruler", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "root_check", name: "Inspeccion radicular", category: "monitoring", icon: "Eye", color: "amber", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "environmental_check", name: "Lectura ambiental manual", category: "monitoring", icon: "Thermometer", color: "amber", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Transformation (3)
  { code: "phase_transition", name: "Cambio de fase", category: "transformation", icon: "RefreshCw", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "drying", name: "Secado", category: "transformation", icon: "Wind", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "curing", name: "Curado", category: "transformation", icon: "Timer", color: "violet", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_transformation", name: "Transformacion de inventario", category: "transformation", icon: "Combine", color: "violet", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  // Application (3)
  { code: "foliar_spray", name: "Aspersion foliar", category: "application", icon: "Spray", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "soil_drench", name: "Aplicacion al suelo (drench)", category: "application", icon: "FlaskConical", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "biocontrol_release", name: "Liberacion de biocontrol", category: "application", icon: "Bug", color: "red", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Movement (7)
  { code: "relocation", name: "Reubicacion de plantas", category: "movement", icon: "Move", color: "cyan", requires_zone: true, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_transfer", name: "Transferencia de inventario", category: "movement", icon: "ArrowLeftRight", color: "cyan", requires_zone: false, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_receipt", name: "Recepcion de inventario", category: "movement", icon: "PackagePlus", color: "cyan", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_consumption", name: "Consumo de inventario", category: "movement", icon: "PackageMinus", color: "cyan", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_return", name: "Devolucion de inventario", category: "movement", icon: "Undo2", color: "cyan", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "dispatch", name: "Despacho / Envio", category: "movement", icon: "Truck", color: "cyan", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Maintenance (3)
  { code: "equipment_maintenance", name: "Mantenimiento de equipo", category: "maintenance", icon: "Wrench", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "calibration", name: "Calibracion", category: "maintenance", icon: "Gauge", color: "slate", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "facility_repair", name: "Reparacion de instalacion", category: "maintenance", icon: "HardHat", color: "slate", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Quality (3)
  { code: "cleaning", name: "Limpieza", category: "quality", icon: "Sparkles", color: "rose", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "sanitization", name: "Sanitizacion", category: "quality", icon: "ShieldCheck", color: "rose", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "lab_sampling", name: "Toma de muestra para laboratorio", category: "quality", icon: "TestTube", color: "rose", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Harvest (2)
  { code: "harvest_cut", name: "Cosecha (corte)", category: "harvest", icon: "Scissors", color: "pink", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: true, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  { code: "weighing", name: "Pesaje", category: "harvest", icon: "Scale", color: "pink", requires_zone: false, requires_batch: true, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  // Post Harvest (3)
  { code: "trimming", name: "Manicurado / Trimming", category: "post_harvest", icon: "Scissors", color: "orange", requires_zone: true, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "extraction", name: "Extraccion", category: "post_harvest", icon: "FlaskConical", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: false },
  { code: "packaging", name: "Empaque", category: "post_harvest", icon: "Package", color: "orange", requires_zone: false, requires_batch: true, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: true, triggers_phase_change: true },
  // Administrative (5)
  { code: "note", name: "Nota general", category: "administrative", icon: "StickyNote", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "incident_report", name: "Reporte de incidente", category: "administrative", icon: "AlertTriangle", color: "gray", requires_zone: true, requires_batch: false, requires_resources: false, requires_photos: true, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "regulatory_report", name: "Reporte regulatorio", category: "administrative", icon: "FileText", color: "gray", requires_zone: false, requires_batch: false, requires_resources: false, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_correction", name: "Correccion de inventario", category: "administrative", icon: "ClipboardEdit", color: "gray", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
  { code: "inventory_waste", name: "Baja de inventario", category: "administrative", icon: "Trash2", color: "gray", requires_zone: true, requires_batch: false, requires_resources: true, requires_photos: false, requires_verification: false, triggers_transformation: false, triggers_phase_change: false },
];

const VALID_CATEGORIES = [
  "cultivation", "monitoring", "transformation", "application", "movement",
  "maintenance", "quality", "harvest", "post_harvest", "administrative",
];

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List activity types for a company, optionally filtered by category and/or status.
 * Ordered by sort_order.
 */
export const list = query({
  args: {
    companyId: v.id("companies"),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { companyId, category, status }) => {
    let types;
    if (category) {
      types = await ctx.db
        .query("activity_types")
        .withIndex("by_company_category", (q) =>
          q.eq("company_id", companyId).eq("category", category)
        )
        .collect();
    } else {
      types = await ctx.db
        .query("activity_types")
        .withIndex("by_company", (q) => q.eq("company_id", companyId))
        .collect();
    }

    if (status) {
      types = types.filter((t) => t.status === status);
    }

    return types.sort((a, b) => a.sort_order - b.sort_order);
  },
});

/**
 * Get a single activity type by ID.
 */
export const getById = query({
  args: {
    typeId: v.id("activity_types"),
  },
  handler: async (ctx, { typeId }) => {
    return await ctx.db.get(typeId);
  },
});

/**
 * Get a single activity type by company + code.
 */
export const getByCode = query({
  args: {
    companyId: v.id("companies"),
    code: v.string(),
  },
  handler: async (ctx, { companyId, code }) => {
    return await ctx.db
      .query("activity_types")
      .withIndex("by_company_code", (q) =>
        q.eq("company_id", companyId).eq("code", code)
      )
      .first();
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Seed default activity types for a company.
 * Creates ~33 system types with is_system: true.
 * Idempotent: skips types whose code already exists for the company.
 */
export const seedDefaults = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const now = Date.now();
    let created = 0;

    for (let i = 0; i < DEFAULT_SEED_TYPES.length; i++) {
      const t = DEFAULT_SEED_TYPES[i];

      // Check if type already exists for this company
      const existing = await ctx.db
        .query("activity_types")
        .withIndex("by_company_code", (q) =>
          q.eq("company_id", companyId).eq("code", t.code)
        )
        .first();

      if (existing) continue;

      await ctx.db.insert("activity_types", {
        company_id: companyId,
        category: t.category,
        code: t.code,
        name: t.name,
        icon: t.icon,
        color: t.color,
        requires_zone: t.requires_zone,
        requires_batch: t.requires_batch,
        requires_resources: t.requires_resources,
        requires_photos: t.requires_photos,
        requires_verification: t.requires_verification,
        triggers_transformation: t.triggers_transformation,
        triggers_phase_change: t.triggers_phase_change,
        is_system: true,
        status: "active",
        sort_order: i * 10,
        created_at: now,
        updated_at: now,
      });
      created++;
    }

    return { created, total: DEFAULT_SEED_TYPES.length };
  },
});

/**
 * Create a custom activity type.
 * Validates code uniqueness within the company and category validity.
 */
export const create = mutation({
  args: {
    companyId: v.id("companies"),
    category: v.string(),
    code: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    requires_zone: v.boolean(),
    requires_batch: v.boolean(),
    requires_resources: v.boolean(),
    requires_photos: v.boolean(),
    requires_verification: v.boolean(),
    triggers_transformation: v.boolean(),
    triggers_phase_change: v.boolean(),
    metadata_schema: v.optional(v.any()),
    default_resources: v.optional(v.array(v.any())),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate category
    if (!VALID_CATEGORIES.includes(args.category)) {
      throw new Error(`Categoria invalida: "${args.category}". Valores validos: ${VALID_CATEGORIES.join(", ")}`);
    }

    // Validate code uniqueness within company
    const existing = await ctx.db
      .query("activity_types")
      .withIndex("by_company_code", (q) =>
        q.eq("company_id", args.companyId).eq("code", args.code)
      )
      .first();

    if (existing) {
      throw new Error(`Ya existe un tipo de actividad con el codigo "${args.code}" en esta empresa`);
    }

    const now = Date.now();
    return await ctx.db.insert("activity_types", {
      company_id: args.companyId,
      category: args.category,
      code: args.code,
      name: args.name,
      description: args.description,
      icon: args.icon,
      color: args.color,
      requires_zone: args.requires_zone,
      requires_batch: args.requires_batch,
      requires_resources: args.requires_resources,
      requires_photos: args.requires_photos,
      requires_verification: args.requires_verification,
      triggers_transformation: args.triggers_transformation,
      triggers_phase_change: args.triggers_phase_change,
      metadata_schema: args.metadata_schema,
      default_resources: args.default_resources,
      is_system: false,
      status: "active",
      sort_order: args.sort_order ?? 1000,
      created_at: now,
      updated_at: now,
    });
  },
});

/**
 * Update an activity type's editable fields.
 */
export const update = mutation({
  args: {
    typeId: v.id("activity_types"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    requires_zone: v.optional(v.boolean()),
    requires_batch: v.optional(v.boolean()),
    requires_resources: v.optional(v.boolean()),
    requires_photos: v.optional(v.boolean()),
    requires_verification: v.optional(v.boolean()),
    triggers_transformation: v.optional(v.boolean()),
    triggers_phase_change: v.optional(v.boolean()),
    metadata_schema: v.optional(v.any()),
    default_resources: v.optional(v.array(v.any())),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, { typeId, ...fields }) => {
    const type = await ctx.db.get(typeId);
    if (!type) throw new Error("Tipo de actividad no encontrado");

    // Build patch with only provided fields
    const patch: Record<string, unknown> = { updated_at: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    await ctx.db.patch(typeId, patch);
    return typeId;
  },
});

/**
 * Archive an activity type. System types cannot be archived.
 */
export const archive = mutation({
  args: {
    typeId: v.id("activity_types"),
  },
  handler: async (ctx, { typeId }) => {
    const type = await ctx.db.get(typeId);
    if (!type) throw new Error("Tipo de actividad no encontrado");

    if (type.is_system) {
      throw new Error("Los tipos de sistema no se pueden archivar");
    }

    await ctx.db.patch(typeId, {
      status: "archived",
      updated_at: Date.now(),
    });
    return typeId;
  },
});

/**
 * Restore an archived activity type to active status.
 */
export const restore = mutation({
  args: {
    typeId: v.id("activity_types"),
  },
  handler: async (ctx, { typeId }) => {
    const type = await ctx.db.get(typeId);
    if (!type) throw new Error("Tipo de actividad no encontrado");

    if (type.status !== "archived") {
      throw new Error("Solo se pueden restaurar tipos archivados");
    }

    await ctx.db.patch(typeId, {
      status: "active",
      updated_at: Date.now(),
    });
    return typeId;
  },
});

// ============================================================================
// DATA MIGRATION
// ============================================================================

/**
 * Mapping from legacy activity_type strings to catalog codes.
 */
const LEGACY_TYPE_TO_CODE: Record<string, string> = {
  movement: "relocation",
  loss_record: "incident_report",
  harvest: "harvest_cut",
  phase_transition: "phase_transition",
  watering: "irrigation",
  feeding: "fertigation",
  pruning: "pruning",
  inspection: "scouting",
  treatment: "foliar_spray",
  recipe_execution: "extraction",
  batch_split: "note",
  batch_merge: "note",
  inventory_receipt: "inventory_receipt",
  inventory_consumption: "inventory_consumption",
  inventory_correction: "inventory_correction",
  inventory_waste: "inventory_waste",
  inventory_transfer: "inventory_transfer",
  inventory_return: "inventory_return",
  inventory_transformation: "inventory_transformation",
};

/**
 * Migrate existing activities to the new v2 model.
 * - Adds type_id, category, company_id, status to activities without type_id
 * - Creates activity_resources from materials_consumed / materials_produced
 * - Idempotent: skips activities that already have type_id + resources
 * - Processes in batches of 50 to stay within Convex mutation limits
 *
 * Returns { processed, skipped, resourcesCreated }
 */
export const migrateActivitiesToNewModel = mutation({
  args: {
    companyId: v.id("companies"),
    cursor: v.optional(v.string()), // Optional cursor for pagination
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const BATCH_SIZE = 50;
    let processed = 0;
    let skipped = 0;
    let resourcesCreated = 0;

    // Get company facilities for facility_id resolution
    const facilities = await ctx.db
      .query("facilities")
      .filter((q) => q.eq(q.field("company_id"), args.companyId))
      .collect();
    const facilityIds = new Set(facilities.map((f) => f._id));

    // Get all areas for facility lookup
    const areas = await ctx.db.query("areas").collect();
    const areaToFacility = new Map<string, string>();
    for (const area of areas) {
      if (facilityIds.has(area.facility_id)) {
        areaToFacility.set(area._id, area.facility_id);
      }
    }

    // Get all batches for batch → facility resolution
    const batches = await ctx.db.query("batches").collect();
    const batchMap = new Map<string, typeof batches[0]>();
    for (const b of batches) {
      if (b.company_id === args.companyId) {
        batchMap.set(b._id, b);
      }
    }

    // Fetch activities that might belong to this company
    // We check by entity_type = "batch" and cross-reference,
    // or by activities that already have company_id set
    const allActivities = await ctx.db.query("activities").collect();

    // Filter to activities that belong to this company
    const companyActivities = allActivities.filter((a) => {
      // Already tagged with company
      if (a.company_id === args.companyId) return true;
      // Check batch ownership
      if (a.entity_type === "batch" && a.entity_id) {
        const batch = batchMap.get(a.entity_id);
        return batch?.company_id === args.companyId;
      }
      // Check via area → facility → company
      if (a.area_from) {
        const facilityId = areaToFacility.get(a.area_from);
        if (facilityId) return true;
      }
      return false;
    });

    // Sort for deterministic processing and apply cursor-based pagination
    const sorted = companyActivities.sort((a, b) => a._creationTime - b._creationTime);
    let startIndex = 0;
    if (args.cursor) {
      startIndex = sorted.findIndex((a) => a._id === args.cursor);
      if (startIndex === -1) startIndex = 0;
      else startIndex += 1; // Start after cursor
    }

    const batch = sorted.slice(startIndex, startIndex + BATCH_SIZE);

    for (const activity of batch) {
      // Check if already migrated (has type_id)
      if (activity.type_id) {
        // Check if activity_resources already exist
        const existingResources = await ctx.db
          .query("activity_resources")
          .withIndex("by_activity", (q) => q.eq("activity_id", activity._id))
          .first();

        if (existingResources) {
          skipped++;
          continue;
        }
      }

      // Resolve type_id from legacy activity_type
      if (!activity.type_id) {
        const code = LEGACY_TYPE_TO_CODE[activity.activity_type];
        if (code) {
          const actType = await getActivityTypeByCode(ctx, args.companyId, code);
          if (actType) {
            const patchData: any = {
              type_id: actType._id,
              category: actType.category,
              company_id: args.companyId,
              status: activity.status || "completed",
            };

            // Resolve facility_id and batch_id
            if (activity.entity_type === "batch" && activity.entity_id) {
              patchData.batch_id = activity.entity_id;
              const batchDoc = batchMap.get(activity.entity_id);
              if (batchDoc) {
                patchData.facility_id = batchDoc.facility_id;
                patchData.crop_phase = batchDoc.current_phase;
              }
            }

            await ctx.db.patch(activity._id, patchData);
          }
        }
      }

      // Create activity_resources from materials_consumed
      const consumed = activity.materials_consumed as any[] | undefined;
      if (consumed && Array.isArray(consumed) && consumed.length > 0) {
        for (const m of consumed) {
          if (m.product_id && m.quantity) {
            await ctx.db.insert("activity_resources", {
              activity_id: activity._id,
              product_id: m.product_id,
              inventory_item_id: m.inventory_item_id,
              direction: "consumed",
              quantity: m.quantity,
              quantity_unit: m.quantity_unit || "und",
              cost_per_unit: m.cost_per_unit,
              batch_number: m.batch_number,
              created_at: now,
            });
            resourcesCreated++;
          }
        }
      }

      // Create activity_resources from materials_produced
      const produced = activity.materials_produced as any[] | undefined;
      if (produced && Array.isArray(produced) && produced.length > 0) {
        for (const m of produced) {
          if (m.product_id && m.quantity) {
            await ctx.db.insert("activity_resources", {
              activity_id: activity._id,
              product_id: m.product_id,
              inventory_item_id: m.inventory_item_id,
              direction: "produced",
              quantity: m.quantity,
              quantity_unit: m.quantity_unit || "und",
              created_at: now,
            });
            resourcesCreated++;
          }
        }
      }

      processed++;
    }

    const lastId = batch.length > 0 ? batch[batch.length - 1]._id : undefined;
    const hasMore = startIndex + BATCH_SIZE < sorted.length;

    return {
      processed,
      skipped,
      resourcesCreated,
      nextCursor: hasMore ? lastId : undefined,
      totalRemaining: hasMore ? sorted.length - (startIndex + BATCH_SIZE) : 0,
    };
  },
});
