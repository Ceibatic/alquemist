/**
 * Seed Comprehensive Production State
 * Creates plant material products, batch inventory, activities, and production orders
 * to populate a realistic production environment.
 *
 * Run in order:
 *   npx convex run --push seedProductionState:seedPlantMaterialProducts '{"email":"..."}'
 *   npx convex run seedProductionState:seedBatchInventory '{"email":"..."}'
 *   npx convex run seedProductionState:seedBatchActivities '{"email":"..."}'
 *   npx convex run seedProductionState:seedProductionOrders '{"email":"..."}'
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const DAY_MS = 86_400_000;

// ── Shared helper: resolve user context ──────────────────────────────────────

async function resolveContext(ctx: any, email: string) {
  const users = await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", email))
    .collect();
  const user = users[0];
  if (!user || !user.company_id) return null;

  const facilities = await ctx.db
    .query("facilities")
    .withIndex("by_company", (q: any) => q.eq("company_id", user.company_id))
    .collect();
  const facility = facilities[0];
  if (!facility) return null;

  const cropTypes = await ctx.db.query("crop_types").collect();
  const cannabis = cropTypes.find((ct: any) => ct.name === "Cannabis");
  if (!cannabis) return null;

  return { user, facility, cannabis };
}

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 1: Plant Material Products (transformation chain)
// ════════════════════════════════════════════════════════════════════════════════

const PLANT_MATERIAL_CHAIN = [
  // Created in reverse order so transformation_produces_id can reference the next
  {
    sku: "PM-FINAL-001",
    name: "Flor Empacada Cannabis",
    category: "processed_plant",
    defaultUnit: "g",
    description: "Producto final empacado, listo para distribución",
    yieldPct: undefined as number | undefined,
    pricePerUnit: 45000,
  },
  {
    sku: "PM-TRIM-001",
    name: "Flor Trimmeada Cannabis",
    category: "processed_plant",
    defaultUnit: "g",
    description: "Flor seca manicurada, lista para empaque",
    yieldPct: 95,
    pricePerUnit: 40000,
  },
  {
    sku: "PM-DRY-001",
    name: "Flor Seca Cannabis",
    category: "harvest_dry",
    defaultUnit: "g",
    description: "Material vegetal secado (12-15% humedad)",
    yieldPct: 70,
    pricePerUnit: 35000,
  },
  {
    sku: "PM-WET-001",
    name: "Flor Húmeda Cannabis",
    category: "harvest_wet",
    defaultUnit: "g",
    description: "Material cosechado fresco, previo a secado",
    yieldPct: 25,
    pricePerUnit: 8000,
  },
  {
    sku: "PM-FLOR-001",
    name: "Planta en Floración",
    category: "plant_flowering",
    defaultUnit: "plants",
    description: "Planta cannabis en fase de floración",
    yieldPct: 100,
    pricePerUnit: 25000,
  },
  {
    sku: "PM-VEG-001",
    name: "Planta Vegetativa",
    category: "plant_vegetative",
    defaultUnit: "plants",
    description: "Planta cannabis en fase vegetativa",
    yieldPct: 97,
    pricePerUnit: 15000,
  },
  {
    sku: "PM-SEEDLING-001",
    name: "Plántula Cannabis",
    category: "seedling",
    defaultUnit: "plants",
    description: "Plántula en propagación, post-germinación",
    yieldPct: 95,
    pricePerUnit: 8000,
  },
  {
    sku: "PM-SEED-001",
    name: "Semilla Cannabis",
    category: "seed",
    defaultUnit: "seeds",
    description: "Semilla feminizada lista para germinación",
    yieldPct: 85,
    pricePerUnit: 5000,
  },
];

export const seedPlantMaterialProducts = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, cannabis } = context;
    const now = Date.now();
    const companyId = user.company_id!;

    // Idempotency: check if PM-SEED-001 already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    if (existing.some((p: any) => p.sku === "PM-SEED-001")) {
      return { success: true, message: "Plant material products already exist", count: 0 };
    }

    // Create in reverse order so each product can reference the next
    let nextProductId: Id<"products"> | undefined = undefined;
    const created: string[] = [];

    for (const def of PLANT_MATERIAL_CHAIN) {
      const productId: Id<"products"> = await ctx.db.insert("products", {
        company_id: companyId,
        sku: def.sku,
        name: def.name,
        description: def.description,
        category: def.category,
        default_unit: def.defaultUnit,
        applicable_crop_type_ids: [cannabis._id],
        regional_suppliers: [],
        regulatory_registered: false,
        organic_certified: false,
        default_price: def.pricePerUnit,
        price_currency: "COP",
        price_unit: "per_unit",
        procurement_type: "produced",
        lot_tracking: "required",
        transformation_produces_id: nextProductId,
        default_yield_pct: def.yieldPct,
        status: "active",
        created_at: now,
        updated_at: now,
      });
      nextProductId = productId;
      created.push(def.sku);
    }

    return {
      success: true,
      message: `Created ${created.length} plant material products`,
      count: created.length,
      products: created.reverse(), // Show in chain order
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 2: Batch Inventory (one item per active batch)
// ════════════════════════════════════════════════════════════════════════════════

const PHASE_TO_SKU: Record<string, string> = {
  germination: "PM-SEED-001",
  propagation: "PM-SEEDLING-001",
  vegetative: "PM-VEG-001",
  flowering: "PM-FLOR-001",
  drying: "PM-WET-001",
  curing: "PM-DRY-001",
};

const PHASE_TO_UNIT: Record<string, string> = {
  germination: "seeds",
  propagation: "plants",
  vegetative: "plants",
  flowering: "plants",
  drying: "g",
  curing: "g",
};

export const seedBatchInventory = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, facility } = context;
    const now = Date.now();
    const companyId = user.company_id!;

    // Get batches
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    if (batches.length === 0) {
      return { success: false, message: "No batches found. Run seedBatches first." };
    }

    // Idempotency: check if any batch-linked inventory exists
    const allInventory = await ctx.db.query("inventory_items").collect();
    const batchIds = new Set(batches.map((b: any) => b._id));
    const existingBatchInventory = allInventory.filter(
      (item: any) => item.source_batch_id && batchIds.has(item.source_batch_id)
    );
    if (existingBatchInventory.length > 0) {
      return {
        success: true,
        message: `Batch inventory already exists (${existingBatchInventory.length} items)`,
        count: 0,
      };
    }

    // Get products by SKU
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    const productBySku: Record<string, any> = {};
    for (const p of products) {
      productBySku[p.sku] = p;
    }

    let created = 0;
    for (const batch of batches) {
      const phase = batch.current_phase || "germination";
      const sku = PHASE_TO_SKU[phase];
      if (!sku) continue;

      const product = productBySku[sku];
      if (!product) continue;

      const unit = PHASE_TO_UNIT[phase] || "plants";
      // For drying phase, estimate grams (150g wet per plant)
      const qty =
        phase === "drying"
          ? batch.current_quantity * 150
          : phase === "curing"
            ? batch.current_quantity * 38 // ~25% of wet weight
            : batch.current_quantity;

      const itemId = await ctx.db.insert("inventory_items", {
        product_id: product._id,
        area_id: batch.area_id,
        quantity_available: qty,
        quantity_reserved: 0,
        quantity_committed: 0,
        quantity_unit: unit,
        batch_number: batch.batch_code,
        serial_numbers: [],
        received_date: batch.created_date,
        production_date: batch.created_date,
        certificates: [],
        source_type: "production",
        source_batch_id: batch._id,
        lot_status: "available",
        transformation_status: "active",
        last_movement_date: now,
        notes: `Inventario de producción - ${batch.batch_code}`,
        created_at: now,
        updated_at: now,
      });

      // Create receipt transaction
      await ctx.db.insert("inventory_transactions", {
        inventory_item_id: itemId,
        product_id: product._id,
        transaction_type: "receipt",
        quantity_change: qty,
        quantity_before: 0,
        quantity_after: qty,
        quantity_unit: unit,
        reason: "Registro inicial de producción",
        reference_type: "adjustment",
        batch_id: batch._id,
        zone_id: batch.area_id,
        crop_phase: phase,
        performed_by: user._id,
        performed_at: batch.created_date,
        created_at: now,
      });

      created++;
    }

    return {
      success: true,
      message: `Created ${created} inventory items with transactions`,
      count: created,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 3: Batch Activities (historical activity log)
// ════════════════════════════════════════════════════════════════════════════════

// Phase transition schedule (day in batch lifecycle when each transition happens)
const PHASE_TRANSITIONS: Array<{
  from: string;
  to: string;
  day: number;
  title: string;
}> = [
  { from: "germination", to: "propagation", day: 7, title: "Transición: Germinación → Propagación" },
  { from: "propagation", to: "vegetative", day: 21, title: "Transición: Propagación → Vegetativo" },
  { from: "vegetative", to: "flowering", day: 42, title: "Transición: Vegetativo → Floración" },
  { from: "flowering", to: "drying", day: 100, title: "Cosecha y paso a Secado" },
];

// Which phases a batch in X phase has already passed through
const PHASE_ORDER = ["germination", "propagation", "vegetative", "flowering", "drying", "curing"];

function getPastTransitions(currentPhase: string, daysInProduction: number) {
  const phaseIdx = PHASE_ORDER.indexOf(currentPhase);
  return PHASE_TRANSITIONS.filter(
    (t) => PHASE_ORDER.indexOf(t.to) <= phaseIdx && t.day < daysInProduction
  );
}

export const seedBatchActivities = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, facility } = context;
    const now = Date.now();
    const companyId = user.company_id!;

    // Get batches
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    if (batches.length === 0) {
      return { success: false, message: "No batches found" };
    }

    // Idempotency: check if activities already exist for these batches
    const existingActivities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    if (existingActivities.length > 0) {
      return {
        success: true,
        message: `Activities already exist (${existingActivities.length})`,
        count: 0,
      };
    }

    let totalCreated = 0;

    for (const batch of batches) {
      const phase = batch.current_phase || "germination";
      const days = batch.days_in_production || 1;
      const batchStart = batch.created_date;

      // ── Phase transitions ──
      const transitions = getPastTransitions(phase, days);
      for (const t of transitions) {
        const ts = batchStart + t.day * DAY_MS + 8 * 3_600_000; // 8am
        await ctx.db.insert("activities", {
          entity_type: "batch",
          entity_id: batch._id as string,
          activity_type: "phase_transition",
          performed_by: user._id,
          timestamp: ts,
          duration_minutes: 30,
          materials_consumed: [],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: { previous_phase: t.from, new_phase: t.to },
          notes: `${t.title} — ${batch.batch_code}`,
          created_at: ts,
          // V2 fields
          company_id: companyId,
          facility_id: facility._id,
          batch_id: batch._id,
          crop_phase: t.to,
          status: "completed",
          title: t.title,
        });
        totalCreated++;
      }

      // ── Loss record ──
      if (batch.lost_quantity > 0) {
        const lossDay = Math.floor(days * 0.6);
        const lossTs = batchStart + lossDay * DAY_MS + 10 * 3_600_000;
        const qtyBefore = batch.initial_quantity;
        const qtyAfter = batch.current_quantity;
        await ctx.db.insert("activities", {
          entity_type: "batch",
          entity_id: batch._id as string,
          activity_type: "loss_record",
          performed_by: user._id,
          timestamp: lossTs,
          duration_minutes: 15,
          quantity_before: qtyBefore,
          quantity_after: qtyAfter,
          materials_consumed: [],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            lost_quantity: batch.lost_quantity,
            reason: "environmental",
            description: "Pérdida por estrés ambiental",
          },
          notes: `Registro de pérdida: ${batch.lost_quantity} plantas — ${batch.batch_code}`,
          created_at: lossTs,
          company_id: companyId,
          facility_id: facility._id,
          batch_id: batch._id,
          crop_phase: phase,
          status: "completed",
          title: `Pérdida: ${batch.lost_quantity} plantas`,
        });
        totalCreated++;
      }

      // ── Regular activities (irrigation every 2d, fertigation every 7d, scouting every 7d) ──
      for (let d = 1; d <= days; d++) {
        const dayTs = batchStart + d * DAY_MS;

        // Irrigation every 2 days
        if (d % 2 === 0) {
          await ctx.db.insert("activities", {
            entity_type: "batch",
            entity_id: batch._id as string,
            activity_type: "irrigation",
            performed_by: user._id,
            timestamp: dayTs + 7 * 3_600_000, // 7am
            duration_minutes: 20,
            materials_consumed: [],
            equipment_used: [],
            photos: [],
            files: [],
            notes: `Riego — ${batch.batch_code}`,
            created_at: dayTs,
            company_id: companyId,
            facility_id: facility._id,
            batch_id: batch._id,
            crop_phase: phase,
            status: "completed",
            title: "Riego",
          });
          totalCreated++;
        }

        // Fertigation every 7 days
        if (d % 7 === 0) {
          await ctx.db.insert("activities", {
            entity_type: "batch",
            entity_id: batch._id as string,
            activity_type: "fertigation",
            performed_by: user._id,
            timestamp: dayTs + 9 * 3_600_000, // 9am
            duration_minutes: 30,
            materials_consumed: [],
            equipment_used: [],
            photos: [],
            files: [],
            notes: `Fertirrigación — ${batch.batch_code}`,
            created_at: dayTs,
            company_id: companyId,
            facility_id: facility._id,
            batch_id: batch._id,
            crop_phase: phase,
            status: "completed",
            title: "Fertirrigación",
          });
          totalCreated++;
        }

        // Scouting every 7 days (offset by 3 days from fertigation)
        if (d % 7 === 3) {
          await ctx.db.insert("activities", {
            entity_type: "batch",
            entity_id: batch._id as string,
            activity_type: "scouting",
            performed_by: user._id,
            timestamp: dayTs + 10 * 3_600_000, // 10am
            duration_minutes: 25,
            materials_consumed: [],
            equipment_used: [],
            photos: [],
            files: [],
            notes: `Monitoreo de plagas y enfermedades — ${batch.batch_code}`,
            created_at: dayTs,
            company_id: companyId,
            facility_id: facility._id,
            batch_id: batch._id,
            crop_phase: phase,
            status: "completed",
            title: "Monitoreo fitosanitario",
          });
          totalCreated++;
        }
      }
    }

    return {
      success: true,
      message: `Created ${totalCreated} activities across ${batches.length} batches`,
      count: totalCreated,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 4: Production Orders (linked to batches + 2 planned)
// ════════════════════════════════════════════════════════════════════════════════

export const seedProductionOrders = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, facility, cannabis } = context;
    const now = Date.now();
    const companyId = user.company_id!;

    // Idempotency: check if ORD-2026- orders already exist (from this seed)
    const existingOrders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    // Our orders use 3-digit seq (ORD-2026-001); onboarding uses 4-digit (ORD-2026-0001)
    const seedOrders = existingOrders.filter((o: any) =>
      /^ORD-2026-\d{3}$/.test(o.order_number)
    );
    if (seedOrders.length > 0) {
      return {
        success: true,
        message: `Seed orders already exist (${seedOrders.length})`,
        count: 0,
      };
    }

    // Get batches (only production type for orders, skip mother/research)
    const allBatches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    const productionBatches = allBatches.filter(
      (b: any) => b.batch_type === "production"
    );

    // Completion % by phase
    const phaseCompletion: Record<string, number> = {
      germination: 5,
      propagation: 15,
      vegetative: 35,
      flowering: 65,
      drying: 90,
      curing: 95,
    };

    // Get cultivars for planned orders
    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_crop_type", (q: any) => q.eq("crop_type_id", cannabis._id))
      .collect();
    const findCultivar = (partial: string) =>
      cultivars.find((c: any) => c.name.startsWith(partial));

    let orderSeq = 1;
    const createdOrders: string[] = [];

    // ── Orders linked to production batches ──
    for (const batch of productionBatches) {
      const orderNumber = `ORD-2026-${orderSeq.toString().padStart(3, "0")}`;
      const phase = batch.current_phase || "germination";
      const completion = phaseCompletion[phase] || 50;
      const priority =
        completion >= 65 ? "high" : "normal";

      const orderId = await ctx.db.insert("production_orders", {
        order_number: orderNumber,
        company_id: companyId,
        crop_type_id: cannabis._id,
        cultivar_id: batch.cultivar_id,
        order_type: "seed-to-harvest",
        source_type: batch.source_type,
        requested_quantity: batch.initial_quantity,
        unit_of_measure: "plants",
        enable_individual_tracking: false,
        target_facility_id: facility._id,
        target_area_id: batch.area_id,
        total_plants_planned: batch.initial_quantity,
        total_plants_actual: batch.current_quantity,
        planned_start_date: batch.created_date,
        actual_start_date: batch.created_date,
        estimated_completion_date: batch.created_date + 120 * DAY_MS,
        requested_by: user._id,
        approved_by: user._id,
        approval_date: batch.created_date,
        status: "active",
        priority,
        completion_percentage: completion,
        transport_manifest_required: false,
        phytosanitary_cert_required: false,
        regulatory_documentation: {},
        notes: `Orden de producción para lote ${batch.batch_code}`,
        created_at: batch.created_date,
        updated_at: now,
      });

      // Link batch to order
      await ctx.db.patch(batch._id, { production_order_id: orderId });

      createdOrders.push(orderNumber);
      orderSeq++;
    }

    // ── 2 Planned orders (not started) ──
    const plannedOrders = [
      { cultivarMatch: "White Widow", qty: 60, startOffset: 7, priority: "normal" as const },
      { cultivarMatch: "Critical Mass", qty: 45, startOffset: 14, priority: "high" as const },
    ];

    for (const planned of plannedOrders) {
      const orderNumber = `ORD-2026-${orderSeq.toString().padStart(3, "0")}`;
      const cultivar = findCultivar(planned.cultivarMatch);

      await ctx.db.insert("production_orders", {
        order_number: orderNumber,
        company_id: companyId,
        crop_type_id: cannabis._id,
        cultivar_id: cultivar?._id,
        order_type: "seed-to-harvest",
        source_type: "seed",
        requested_quantity: planned.qty,
        unit_of_measure: "plants",
        enable_individual_tracking: false,
        target_facility_id: facility._id,
        total_plants_planned: planned.qty,
        total_plants_actual: 0,
        planned_start_date: now + planned.startOffset * DAY_MS,
        estimated_completion_date: now + (planned.startOffset + 120) * DAY_MS,
        requested_by: user._id,
        status: "planning",
        priority: planned.priority,
        completion_percentage: 0,
        transport_manifest_required: false,
        phytosanitary_cert_required: false,
        regulatory_documentation: {},
        notes: `Orden planificada — ${planned.cultivarMatch}`,
        created_at: now,
        updated_at: now,
      });

      createdOrders.push(orderNumber);
      orderSeq++;
    }

    return {
      success: true,
      message: `Created ${createdOrders.length} production orders (${productionBatches.length} active + 2 planned)`,
      count: createdOrders.length,
      orders: createdOrders,
    };
  },
});
