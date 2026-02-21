/**
 * Seed Showcase Data
 * Enriches existing seed data to fully populate the batch detail analytics
 * and the ActivitySchedule component.
 *
 * Prerequisites (must run first):
 *   - seedPhase4Data: templates, orders, batches, plants, activities
 *   - seedProductionState: products, inventory, enriched activities, production orders
 *   - activityTypes.seedDefaults: 33 system activity types
 *
 * Run all at once:
 *   npx convex run seedShowcase:seedShowcaseData '{"email":"christiangoye@gmail.com"}'
 *
 * Or individually:
 *   npx convex run seedShowcase:seedOrderPhases '{"email":"..."}'
 *   npx convex run seedShowcase:seedBatchLosses '{"email":"..."}'
 *   npx convex run seedShowcase:seedEnrichedActivities '{"email":"..."}'
 *   npx convex run seedShowcase:seedActivityResources '{"email":"..."}'
 *   npx convex run seedShowcase:seedEnrichedScheduledActivities '{"email":"..."}'
 */

import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ── Constants ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** Standard cannabis phase durations (days) */
const PHASE_DEFS = [
  { name: "Propagación", order: 1, days: 14 },
  { name: "Vegetativo", order: 2, days: 28 },
  { name: "Floración", order: 3, days: 56 },
  { name: "Secado", order: 4, days: 14 },
  { name: "Curado", order: 5, days: 21 },
] as const;

/** Map batch current_phase (Spanish or English) to a phase index */
const PHASE_INDEX: Record<string, number> = {
  Propagación: 0, propagation: 0,
  Vegetativo: 1, vegetative: 1,
  Floración: 2, flowering: 2,
  Secado: 3, drying: 3,
  Curado: 4, curing: 4,
};

/** Map legacy activity_type strings to activity_types.code + category */
const LEGACY_TYPE_MAP: Record<string, { code: string; category: string }> = {
  irrigation: { code: "irrigation", category: "cultivation" },
  fertigation: { code: "fertigation", category: "cultivation" },
  scouting: { code: "scouting", category: "monitoring" },
  phase_transition: { code: "phase_transition", category: "transformation" },
  loss_record: { code: "incident_report", category: "administrative" },
  watering: { code: "irrigation", category: "cultivation" },
  feeding: { code: "fertigation", category: "cultivation" },
  pruning: { code: "pruning", category: "cultivation" },
  inspection: { code: "scouting", category: "monitoring" },
};

/** Duration estimates by activity code (minutes) */
const DURATION_MAP: Record<string, number> = {
  irrigation: 20,
  fertigation: 30,
  pruning: 60,
  scouting: 45,
  foliar_spray: 40,
  growth_check: 25,
};

// ── Shared helpers ───────────────────────────────────────────────────────────

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

  return { user, facility, cannabis, companyId: user.company_id as Id<"companies"> };
}

/** Build a lookup map: activity_types.code -> activity_type record */
async function buildActivityTypeMap(ctx: any, companyId: Id<"companies">) {
  const types = await ctx.db
    .query("activity_types")
    .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
    .collect();
  const map = new Map<string, any>();
  for (const t of types) {
    map.set(t.code, t);
  }
  return map;
}

// ── Internal query for orchestrator ──────────────────────────────────────────

export const resolveCompanyId = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", args.email))
      .collect();
    const user = users[0];
    if (!user || !user.company_id) return null;
    return { companyId: user.company_id as Id<"companies"> };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 1: Order Phases
// ════════════════════════════════════════════════════════════════════════════════

export const seedOrderPhases = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, facility, companyId } = context;
    const now = Date.now();

    // Get active orders
    const orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    const activeOrders = orders.filter((o: any) => o.status === "active");

    if (activeOrders.length === 0) {
      return { success: false, message: "No active production orders found" };
    }

    // Get batches to determine progress
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();

    // Get template phases (for template_phase_id linkage)
    const templatePhases = await ctx.db.query("template_phases").collect();

    let totalCreated = 0;

    for (const order of activeOrders) {
      // Idempotency: skip if order_phases already exist for this order
      const existing = await ctx.db
        .query("order_phases")
        .withIndex("by_order", (q: any) => q.eq("order_id", order._id))
        .collect();
      if (existing.length > 0) continue;

      // Find linked batch
      const batch = batches.find((b: any) => b.production_order_id === order._id);
      const batchPhase = batch?.current_phase as string | undefined;
      const batchPhaseIdx = batchPhase ? (PHASE_INDEX[batchPhase] ?? -1) : -1;

      const baseDate = order.planned_start_date || order.actual_start_date || (now - 60 * DAY_MS);
      let cumulativeOffset = 0;

      for (let i = 0; i < PHASE_DEFS.length; i++) {
        const phaseDef = PHASE_DEFS[i];
        const plannedStart = baseDate + cumulativeOffset * DAY_MS;
        const plannedEnd = plannedStart + phaseDef.days * DAY_MS;

        // Match template_phase_id if available
        const tPhase = templatePhases.find(
          (tp: any) => tp.phase_order === phaseDef.order && order.template_id && tp.template_id === order.template_id
        );

        // Determine status and actual dates based on batch progress
        let status: string;
        let actual_start_date: number | undefined;
        let actual_end_date: number | undefined;
        let completion_notes: string | undefined;

        if (i < batchPhaseIdx) {
          // Completed phase
          status = "completed";
          actual_start_date = plannedStart + Math.floor(Math.random() * 2) * DAY_MS;
          actual_end_date = plannedEnd - Math.floor(Math.random() * 2) * DAY_MS;
          completion_notes = "Fase completada exitosamente";
        } else if (i === batchPhaseIdx) {
          // Current phase
          status = "in_progress";
          actual_start_date = plannedStart + Math.floor(Math.random() * 3) * DAY_MS;
        } else {
          // Future phase
          status = "pending";
        }

        await ctx.db.insert("order_phases", {
          order_id: order._id,
          template_phase_id: tPhase?._id,
          phase_name: phaseDef.name,
          phase_order: phaseDef.order,
          planned_start_date: plannedStart,
          planned_end_date: plannedEnd,
          actual_start_date,
          actual_end_date,
          area_id: (i <= batchPhaseIdx && batch) ? batch.area_id : undefined,
          status,
          completion_notes,
          created_at: now,
        });
        totalCreated++;

        cumulativeOffset += phaseDef.days;
      }
    }

    return {
      success: true,
      message: `Created ${totalCreated} order phases for ${activeOrders.length} orders`,
      count: totalCreated,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 2: Batch Losses
// ════════════════════════════════════════════════════════════════════════════════

const LOSS_TEMPLATES = [
  { reason: "environmental", description: "Estrés por temperatura alta en semana 3" },
  { reason: "pest", description: "Daño por ácaro detectado en inspección semanal" },
  { reason: "environmental", description: "Marchitamiento por exceso de humedad" },
  { reason: "genetic", description: "Debilidad genética, planta no prosperó" },
  { reason: "disease", description: "Presencia de Botrytis en hojas inferiores" },
  { reason: "accident", description: "Daño mecánico durante reubicación" },
];

export const seedBatchLosses = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, companyId } = context;
    const now = Date.now();

    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();

    let totalCreated = 0;

    for (const batch of batches) {
      if (!batch.lost_quantity || batch.lost_quantity <= 0) continue;

      // Idempotency: skip if losses already exist
      const existing = await ctx.db
        .query("batch_losses")
        .withIndex("by_batch", (q: any) => q.eq("batch_id", batch._id))
        .collect();
      if (existing.length > 0) continue;

      const batchAge = batch.days_in_production || Math.floor((now - batch.created_date) / DAY_MS);
      const lostQty = batch.lost_quantity;

      // Distribute losses: 2 records for small losses, 3 for larger
      const numRecords = lostQty >= 4 ? 3 : 2;
      const quantities: number[] = [];
      let remaining = lostQty;
      for (let i = 0; i < numRecords - 1; i++) {
        const qty = Math.max(1, Math.floor(remaining / (numRecords - i)));
        quantities.push(qty);
        remaining -= qty;
      }
      quantities.push(remaining);

      // Pick loss templates (cycle through them based on batch index)
      const batchIdx = batches.indexOf(batch);

      for (let i = 0; i < quantities.length; i++) {
        if (quantities[i] <= 0) continue;
        const template = LOSS_TEMPLATES[(batchIdx * 2 + i) % LOSS_TEMPLATES.length];
        // Spread detection dates across batch lifetime (30%-70% of batch age)
        const dayFraction = 0.3 + (i * 0.4) / Math.max(1, quantities.length - 1);
        const detectionDay = Math.max(1, Math.floor(batchAge * dayFraction));
        const detectionDate = batch.created_date + detectionDay * DAY_MS + 10 * HOUR_MS;

        await ctx.db.insert("batch_losses", {
          batch_id: batch._id,
          quantity: quantities[i],
          reason: template.reason,
          description: template.description,
          detection_date: detectionDate,
          photos: [],
          recorded_by: user._id,
          created_at: detectionDate + 2 * HOUR_MS,
        });
        totalCreated++;
      }
    }

    return {
      success: true,
      message: `Created ${totalCreated} batch loss records`,
      count: totalCreated,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 3: Enrich Existing Activities
// ════════════════════════════════════════════════════════════════════════════════

export const seedEnrichedActivities = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { companyId } = context;

    // Build activity type lookup
    const typeMap = await buildActivityTypeMap(ctx, companyId);
    if (typeMap.size === 0) {
      return { success: false, message: "No activity types found. Run activityTypes.seedDefaults first." };
    }

    // Get all activities for the company
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();

    if (activities.length === 0) {
      return { success: false, message: "No activities found. Run seedBatchActivities first." };
    }

    // Check idempotency: if first activity already has type_id, skip
    const alreadyEnriched = activities.filter((a: any) => a.type_id).length;
    if (alreadyEnriched > activities.length * 0.5) {
      return {
        success: true,
        message: `Activities already enriched (${alreadyEnriched}/${activities.length} have type_id)`,
        count: 0,
      };
    }

    // Get batch losses for quantity tracking timeline
    const allLosses = await ctx.db.query("batch_losses").collect();
    // Group losses by batch
    const lossesByBatch = new Map<string, Array<{ date: number; qty: number }>>();
    for (const loss of allLosses) {
      const key = loss.batch_id as string;
      if (!lossesByBatch.has(key)) lossesByBatch.set(key, []);
      lossesByBatch.get(key)!.push({ date: loss.detection_date, qty: loss.quantity });
    }
    // Sort losses by date
    for (const [, losses] of lossesByBatch) {
      losses.sort((a, b) => a.date - b.date);
    }

    // Get batches for initial quantities
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    const batchMap = new Map<string, any>();
    for (const b of batches) batchMap.set(b._id as string, b);

    let patched = 0;

    // Group activities by batch for quantity tracking
    const activitiesByBatch = new Map<string, any[]>();
    for (const a of activities) {
      const batchId = a.batch_id as string;
      if (!batchId) continue;
      if (!activitiesByBatch.has(batchId)) activitiesByBatch.set(batchId, []);
      activitiesByBatch.get(batchId)!.push(a);
    }

    for (const [batchId, batchActivities] of activitiesByBatch) {
      const batch = batchMap.get(batchId);
      if (!batch) continue;

      // Sort by timestamp
      batchActivities.sort((a: any, b: any) => a.timestamp - b.timestamp);

      // Build quantity timeline from losses
      const losses = lossesByBatch.get(batchId) || [];
      let currentQty = batch.initial_quantity || batch.current_quantity;

      for (const activity of batchActivities) {
        // Skip already enriched
        if (activity.type_id) continue;

        // Map legacy type to code + category
        const mapping = LEGACY_TYPE_MAP[activity.activity_type];
        const code = mapping?.code || activity.activity_type;
        const category = mapping?.category;
        const actType = typeMap.get(code);

        // Calculate quantity at this point in time
        // Check if any losses occurred before this activity's timestamp
        while (losses.length > 0 && losses[0].date <= activity.timestamp) {
          currentQty -= losses[0].qty;
          losses.shift();
        }

        const patch: Record<string, any> = {};
        if (actType) {
          patch.type_id = actType._id;
        }
        if (category) {
          patch.category = category;
        }

        // Add quantity tracking for activities that should show on survival curve
        // (irrigation, fertigation, and loss_record types)
        if (
          !activity.quantity_before &&
          !activity.quantity_after &&
          ["irrigation", "fertigation", "scouting", "loss_record"].includes(activity.activity_type)
        ) {
          if (activity.activity_type === "loss_record") {
            // Loss activities: quantity_after is already set by seedProductionState
            // but add quantity tracking if missing
            patch.quantity_before = currentQty + (batch.lost_quantity || 0);
            patch.quantity_after = currentQty;
          } else {
            // Regular activities: carry forward current quantity
            patch.quantity_before = currentQty;
            patch.quantity_after = currentQty;
          }
        }

        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(activity._id, patch);
          patched++;
        }
      }
    }

    return {
      success: true,
      message: `Enriched ${patched} activities with type_id, category, and quantity tracking`,
      count: patched,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 4: Activity Resources
// ════════════════════════════════════════════════════════════════════════════════

export const seedActivityResources = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { companyId } = context;
    const now = Date.now();

    // Get activities
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();

    if (activities.length === 0) {
      return { success: false, message: "No activities found" };
    }

    // Idempotency: check if any activity_resources exist for the first activity
    const fertigationActivities = activities.filter(
      (a: any) => a.activity_type === "fertigation"
    );
    if (fertigationActivities.length > 0) {
      const existingResources = await ctx.db
        .query("activity_resources")
        .withIndex("by_activity", (q: any) => q.eq("activity_id", fertigationActivities[0]._id))
        .collect();
      if (existingResources.length > 0) {
        return { success: true, message: "Activity resources already exist", count: 0 };
      }
    }

    // Get products for resources
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();

    // Try to find nutrient products by various SKU patterns
    const findProduct = (skuPatterns: string[]) => {
      for (const pattern of skuPatterns) {
        const p = products.find((p: any) => p.sku === pattern);
        if (p) return p;
      }
      // Fallback: find by category/name keyword
      return null;
    };

    const nutrientA = findProduct(["NUT-BASE-A-001", "DEMO-NUT-A"]) ||
      products.find((p: any) => p.name?.includes("Base A") || p.name?.includes("Nutriente A"));
    const nutrientB = findProduct(["NUT-BASE-B-001", "DEMO-NUT-B"]) ||
      products.find((p: any) => p.name?.includes("Base B") || p.name?.includes("Nutriente B"));
    const calMag = findProduct(["NUT-CALMAG-001", "DEMO-CALMAG"]) ||
      products.find((p: any) => p.name?.includes("Cal-Mag") || p.name?.includes("Calcio"));

    // If no nutrient products found, try any product as fallback
    const anyNutrient = products.find((p: any) =>
      p.category === "nutrient" || p.category === "fertilizer" || p.category === "base_nutrient"
    );

    const primaryNutrient = nutrientA || anyNutrient;
    const secondaryNutrient = nutrientB || anyNutrient;
    const tertiaryNutrient = calMag || anyNutrient;

    if (!primaryNutrient) {
      return { success: false, message: "No nutrient products found. Run seedPhase2Data first." };
    }

    let totalCreated = 0;

    // Create resources for fertigation activities
    for (const activity of fertigationActivities) {
      if (primaryNutrient) {
        await ctx.db.insert("activity_resources", {
          activity_id: activity._id,
          direction: "consumed",
          product_id: primaryNutrient._id,
          quantity: 0.5,
          quantity_unit: "L",
          cost_per_unit: primaryNutrient.default_price || 85000,
          cost_total: (primaryNutrient.default_price || 85000) * 0.5,
          application_rate: "2mL/L",
          application_method: "drench",
          created_at: activity.timestamp || now,
        });
        totalCreated++;
      }

      if (secondaryNutrient && secondaryNutrient._id !== primaryNutrient?._id) {
        await ctx.db.insert("activity_resources", {
          activity_id: activity._id,
          direction: "consumed",
          product_id: secondaryNutrient._id,
          quantity: 0.5,
          quantity_unit: "L",
          cost_per_unit: secondaryNutrient.default_price || 85000,
          cost_total: (secondaryNutrient.default_price || 85000) * 0.5,
          application_rate: "2mL/L",
          application_method: "drench",
          created_at: activity.timestamp || now,
        });
        totalCreated++;
      }
    }

    // Create resources for every 3rd irrigation activity
    const irrigationActivities = activities.filter(
      (a: any) => a.activity_type === "irrigation"
    );
    for (let i = 0; i < irrigationActivities.length; i += 3) {
      const activity = irrigationActivities[i];
      const product = tertiaryNutrient || primaryNutrient;
      if (!product) continue;

      await ctx.db.insert("activity_resources", {
        activity_id: activity._id,
        direction: "consumed",
        product_id: product._id,
        quantity: 0.1,
        quantity_unit: "L",
        cost_per_unit: product.default_price || 65000,
        cost_total: (product.default_price || 65000) * 0.1,
        application_rate: "1mL/L",
        application_method: "drench",
        created_at: activity.timestamp || now,
      });
      totalCreated++;
    }

    return {
      success: true,
      message: `Created ${totalCreated} activity resources`,
      count: totalCreated,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// MUTATION 5: Enriched Scheduled Activities
// ════════════════════════════════════════════════════════════════════════════════

export const seedEnrichedScheduledActivities = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const context = await resolveContext(ctx, args.email);
    if (!context) return { success: false, message: "User/facility/cannabis not found" };
    const { user, facility, companyId } = context;
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    // Build activity type lookup
    const typeMap = await buildActivityTypeMap(ctx, companyId);
    if (typeMap.size === 0) {
      return { success: false, message: "No activity types found. Run activityTypes.seedDefaults first." };
    }

    // Delete existing scheduled activities (they lack P2 fields)
    const existing = await ctx.db.query("scheduled_activities").collect();
    for (const sa of existing) {
      await ctx.db.delete(sa._id);
    }

    // Get active batches
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q: any) => q.eq("company_id", companyId))
      .collect();
    const activeBatches = batches.filter((b: any) => b.status === "active");

    if (activeBatches.length === 0) {
      return { success: false, message: "No active batches found" };
    }

    // Schedule template: array of { dayOffset, hourOffset, code, status, skipped_reason? }
    const SCHEDULE_ITEMS: Array<{
      dayOffset: number;
      hourOffset: number;
      code: string;
      status: string;
      skipped_reason?: string;
      completion_notes?: string;
    }> = [
      // ── Past completed ──
      { dayOffset: -5, hourOffset: 7, code: "irrigation", status: "completed", completion_notes: "Riego completado, drenaje verificado" },
      { dayOffset: -5, hourOffset: 9, code: "scouting", status: "completed", completion_notes: "Sin novedad, plantas sanas" },
      { dayOffset: -4, hourOffset: 7, code: "irrigation", status: "completed", completion_notes: "Completado sin novedades" },
      { dayOffset: -3, hourOffset: 7, code: "irrigation", status: "completed", completion_notes: "Completado sin novedades" },
      { dayOffset: -3, hourOffset: 9, code: "fertigation", status: "completed", completion_notes: "Nutrientes aplicados según EC objetivo" },
      // ── Past skipped ──
      { dayOffset: -2, hourOffset: 7, code: "irrigation", status: "skipped", skipped_reason: "Sistema de riego en mantenimiento" },
      { dayOffset: -1, hourOffset: 14, code: "foliar_spray", status: "skipped", skipped_reason: "Condiciones ambientales no favorables (HR > 80%)" },
      // ── Overdue ──
      { dayOffset: -1, hourOffset: 7, code: "irrigation", status: "pending" },
      // ── Today ──
      { dayOffset: 0, hourOffset: 7, code: "irrigation", status: "in_progress" },
      { dayOffset: 0, hourOffset: 9, code: "growth_check", status: "pending" },
      { dayOffset: 0, hourOffset: 14, code: "pruning", status: "pending" },
      // ── Upcoming ──
      { dayOffset: 1, hourOffset: 7, code: "irrigation", status: "pending" },
      { dayOffset: 1, hourOffset: 9, code: "fertigation", status: "pending" },
      { dayOffset: 2, hourOffset: 7, code: "irrigation", status: "pending" },
      { dayOffset: 3, hourOffset: 7, code: "irrigation", status: "pending" },
      { dayOffset: 3, hourOffset: 10, code: "scouting", status: "pending" },
      { dayOffset: 5, hourOffset: 7, code: "irrigation", status: "pending" },
      { dayOffset: 5, hourOffset: 9, code: "fertigation", status: "pending" },
      { dayOffset: 7, hourOffset: 7, code: "irrigation", status: "pending" },
    ];

    let totalCreated = 0;

    for (const batch of activeBatches) {
      const batchPhase = batch.current_phase;
      // Normalize phase to lowercase English for crop_phase
      const cropPhase = Object.entries(PHASE_INDEX).find(
        ([key]) => key === batchPhase
      );
      const normalizedPhase = cropPhase
        ? (["propagation", "vegetative", "flowering", "drying", "curing"][cropPhase[1]] || batchPhase)
        : batchPhase;

      for (const item of SCHEDULE_ITEMS) {
        const actType = typeMap.get(item.code);
        const scheduledDate = todayMs + item.dayOffset * DAY_MS + item.hourOffset * HOUR_MS;
        const durationMin = DURATION_MAP[item.code] || 30;

        await ctx.db.insert("scheduled_activities", {
          entity_type: "batch",
          entity_id: batch._id,
          activity_type: item.code,
          production_order_id: batch.production_order_id,
          scheduled_date: scheduledDate,
          estimated_duration_minutes: durationMin,
          is_recurring: ["irrigation", "fertigation"].includes(item.code),
          recurring_pattern: item.code === "irrigation" ? "daily" : item.code === "fertigation" ? "biweekly" : undefined,
          assigned_to: user._id,
          assigned_team: [],
          required_materials: [],
          required_equipment: [],
          status: item.status,

          // P2 fields
          company_id: companyId,
          type_id: actType?._id,
          crop_phase: normalizedPhase,
          source: "template",
          group_id: `grp-${item.dayOffset}-${item.code}`,

          // Status-specific fields
          actual_start_time: item.status === "completed" || item.status === "in_progress"
            ? scheduledDate : undefined,
          actual_end_time: item.status === "completed"
            ? scheduledDate + durationMin * 60_000 : undefined,
          completed_by: item.status === "completed" ? user._id : undefined,
          completion_notes: item.status === "completed"
            ? (item.completion_notes || "Completado sin novedades") : undefined,
          skipped_reason: item.status === "skipped" ? item.skipped_reason : undefined,

          created_at: now - 7 * DAY_MS,
          updated_at: now,
        });
        totalCreated++;
      }
    }

    return {
      success: true,
      message: `Created ${totalCreated} enriched scheduled activities for ${activeBatches.length} batches`,
      count: totalCreated,
    };
  },
});

// ════════════════════════════════════════════════════════════════════════════════
// ORCHESTRATOR ACTION
// ════════════════════════════════════════════════════════════════════════════════

export const seedShowcaseData = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const results: Record<string, any> = {};

    // Step 0: Ensure activity_types exist
    const userInfo = await ctx.runQuery(internal.seedShowcase.resolveCompanyId, {
      email: args.email,
    });
    if (!userInfo) {
      return { success: false, message: "User/company not found for email: " + args.email };
    }

    results.activityTypes = await ctx.runMutation(api.activityTypes.seedDefaults, {
      companyId: userInfo.companyId,
    });

    // Step 1: Order phases
    results.orderPhases = await ctx.runMutation(api.seedShowcase.seedOrderPhases, {
      email: args.email,
    });

    // Step 2: Batch losses
    results.batchLosses = await ctx.runMutation(api.seedShowcase.seedBatchLosses, {
      email: args.email,
    });

    // Step 3: Enriched activities
    results.enrichedActivities = await ctx.runMutation(api.seedShowcase.seedEnrichedActivities, {
      email: args.email,
    });

    // Step 4: Activity resources
    results.activityResources = await ctx.runMutation(api.seedShowcase.seedActivityResources, {
      email: args.email,
    });

    // Step 5: Enriched scheduled activities
    results.scheduledActivities = await ctx.runMutation(api.seedShowcase.seedEnrichedScheduledActivities, {
      email: args.email,
    });

    return { success: true, results };
  },
});
