/**
 * Reseed Script — Clean configuration environment
 *
 * Clears ALL production and config data for a user's company,
 * then re-seeds configuration: areas, products, suppliers, cultivars,
 * activity types, activity templates, and a production template.
 *
 * Preserves: companies, users, facilities, company_settings, roles,
 * crop_types, units_of_measure, geographic_locations, pest_diseases.
 *
 * Usage:
 *   npx convex run seedReseed:reseed '{"email":"christiangoye@gmail.com"}'
 */

import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ── Step 1: Resolve & Validate ──────────────────────────────────────────────

export const resolveAndValidate = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .collect();
    const user = users[0];
    if (!user) throw new Error(`User not found: ${email}`);
    if (!user.company_id) throw new Error(`User has no company_id`);

    const facilities = await ctx.db
      .query("facilities")
      .withIndex("by_company", (q) => q.eq("company_id", user.company_id!))
      .collect();
    const facility = facilities[0];
    if (!facility) throw new Error(`No facility found for company`);

    const cropTypes = await ctx.db
      .query("crop_types")
      .withIndex("by_name", (q) => q.eq("name", "Cannabis"))
      .collect();
    const cannabis = cropTypes[0];
    if (!cannabis) throw new Error(`Cannabis crop type not found`);

    return {
      companyId: user.company_id!,
      facilityId: facility._id,
      userId: user._id,
      cannabisId: cannabis._id,
    };
  },
});

// ── Step 2: Clear Production Data ───────────────────────────────────────────

export const clearProductionData = internalMutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, { companyId, facilityId }) => {
    const counts: Record<string, number> = {};

    // ── Nivel 1: Leaf tables ──

    // scheduled_activity_resources (via scheduled_activities)
    const scheduledActivities = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_company_status", (q) => q.eq("company_id", companyId))
      .collect();
    let sarCount = 0;
    for (const sa of scheduledActivities) {
      const sars = await ctx.db
        .query("scheduled_activity_resources")
        .withIndex("by_scheduled_activity", (q) => q.eq("scheduled_activity_id", sa._id))
        .collect();
      for (const sar of sars) {
        await ctx.db.delete(sar._id);
        sarCount++;
      }
    }
    counts.scheduled_activity_resources = sarCount;

    // activity_resources (via activities)
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let arCount = 0;
    for (const act of activities) {
      const ars = await ctx.db
        .query("activity_resources")
        .withIndex("by_activity", (q) => q.eq("activity_id", act._id))
        .collect();
      for (const ar of ars) {
        await ctx.db.delete(ar._id);
        arCount++;
      }
    }
    counts.activity_resources = arCount;

    // activity_observations
    const obs = await ctx.db
      .query("activity_observations")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const o of obs) await ctx.db.delete(o._id);
    counts.activity_observations = obs.length;

    // activity_environmental_readings
    const envReadings = await ctx.db
      .query("activity_environmental_readings")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const r of envReadings) await ctx.db.delete(r._id);
    counts.activity_environmental_readings = envReadings.length;

    // activity_attachments
    const attachments = await ctx.db
      .query("activity_attachments")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const a of attachments) await ctx.db.delete(a._id);
    counts.activity_attachments = attachments.length;

    // plant_measurements & plant_activities (via plants)
    const plants = await ctx.db
      .query("plants")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let pmCount = 0, paCount = 0;
    for (const plant of plants) {
      const measurements = await ctx.db
        .query("plant_measurements")
        .withIndex("by_plant", (q) => q.eq("plant_id", plant._id))
        .collect();
      for (const m of measurements) { await ctx.db.delete(m._id); pmCount++; }

      const plantActs = await ctx.db
        .query("plant_activities")
        .withIndex("by_plant", (q) => q.eq("plant_id", plant._id))
        .collect();
      for (const pa of plantActs) { await ctx.db.delete(pa._id); paCount++; }
    }
    counts.plant_measurements = pmCount;
    counts.plant_activities = paCount;

    // batch child tables (via batches)
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let bmCount = 0, blCount = 0, bhCount = 0;
    for (const batch of batches) {
      const movements = await ctx.db
        .query("batch_movements")
        .withIndex("by_batch", (q) => q.eq("batch_id", batch._id))
        .collect();
      for (const m of movements) { await ctx.db.delete(m._id); bmCount++; }

      const losses = await ctx.db
        .query("batch_losses")
        .withIndex("by_batch", (q) => q.eq("batch_id", batch._id))
        .collect();
      for (const l of losses) { await ctx.db.delete(l._id); blCount++; }

      const harvests = await ctx.db
        .query("batch_harvests")
        .withIndex("by_batch", (q) => q.eq("batch_id", batch._id))
        .collect();
      for (const h of harvests) { await ctx.db.delete(h._id); bhCount++; }
    }
    counts.batch_movements = bmCount;
    counts.batch_losses = blCount;
    counts.batch_harvests = bhCount;

    // order_phases & phase_transition_log (via production_orders)
    const orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    // Delete phase_transition_log BEFORE order_phases (FK dependency)
    let ptlCount = 0;
    for (const order of orders) {
      const logs = await ctx.db
        .query("phase_transition_log")
        .withIndex("by_order", (q) => q.eq("order_id", order._id))
        .collect();
      for (const l of logs) { await ctx.db.delete(l._id); ptlCount++; }
    }
    counts.phase_transition_log = ptlCount;

    let opCount = 0;
    for (const order of orders) {
      const phases = await ctx.db
        .query("order_phases")
        .withIndex("by_order", (q) => q.eq("order_id", order._id))
        .collect();
      for (const p of phases) { await ctx.db.delete(p._id); opCount++; }
    }
    counts.order_phases = opCount;

    // cost_entries
    const costs = await ctx.db
      .query("cost_entries")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    for (const c of costs) await ctx.db.delete(c._id);
    counts.cost_entries = costs.length;

    // ── Nivel 2: Parents with children already deleted ──

    // scheduled_activities (already queried above)
    for (const sa of scheduledActivities) await ctx.db.delete(sa._id);
    counts.scheduled_activities = scheduledActivities.length;

    // activities (already queried above)
    for (const act of activities) await ctx.db.delete(act._id);
    counts.activities = activities.length;

    // plants (already queried above)
    for (const plant of plants) await ctx.db.delete(plant._id);
    counts.plants = plants.length;

    // cultivation_schedules
    const schedules = await ctx.db
      .query("cultivation_schedules")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const s of schedules) await ctx.db.delete(s._id);
    counts.cultivation_schedules = schedules.length;

    // ── Nivel 3: Batches & Orders ──

    for (const batch of batches) await ctx.db.delete(batch._id);
    counts.batches = batches.length;

    for (const order of orders) await ctx.db.delete(order._id);
    counts.production_orders = orders.length;

    // ── Nivel 4: Transactions & compliance ──

    // inventory_transactions (NO by_company — go through areas → inventory_items)
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    let txCount = 0;
    for (const area of areas) {
      const invItems = await ctx.db
        .query("inventory_items")
        .withIndex("by_area", (q) => q.eq("area_id", area._id))
        .collect();
      for (const item of invItems) {
        const txs = await ctx.db
          .query("inventory_transactions")
          .withIndex("by_inventory_item", (q) => q.eq("inventory_item_id", item._id))
          .collect();
        for (const tx of txs) { await ctx.db.delete(tx._id); txCount++; }
      }
    }
    counts.inventory_transactions = txCount;

    // quality_checks
    const qcs = await ctx.db
      .query("quality_checks")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const qc of qcs) await ctx.db.delete(qc._id);
    counts.quality_checks = qcs.length;

    // pest_disease_records
    const pdrs = await ctx.db
      .query("pest_disease_records")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    for (const p of pdrs) await ctx.db.delete(p._id);
    counts.pest_disease_records = pdrs.length;

    // compliance_events
    const ces = await ctx.db
      .query("compliance_events")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const c of ces) await ctx.db.delete(c._id);
    counts.compliance_events = ces.length;

    // certificates
    const certs = await ctx.db
      .query("certificates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const c of certs) await ctx.db.delete(c._id);
    counts.certificates = certs.length;

    return counts;
  },
});

// ── Step 3: Clear Config Data ───────────────────────────────────────────────

export const clearConfigData = internalMutation({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, { companyId, facilityId }) => {
    const counts: Record<string, number> = {};

    // Pre-fetch areas (needed for inventory_items and structures)
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();

    // ── Nivel 1: Template leaf tables ──

    // activity_template_resources & checklist (via activity_templates)
    const actTemplates = await ctx.db
      .query("activity_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let atrCount = 0, atcCount = 0;
    for (const at of actTemplates) {
      const resources = await ctx.db
        .query("activity_template_resources")
        .withIndex("by_template", (q) => q.eq("template_id", at._id))
        .collect();
      for (const r of resources) { await ctx.db.delete(r._id); atrCount++; }

      const checklist = await ctx.db
        .query("activity_template_checklist")
        .withIndex("by_template", (q) => q.eq("template_id", at._id))
        .collect();
      for (const c of checklist) { await ctx.db.delete(c._id); atcCount++; }
    }
    counts.activity_template_resources = atrCount;
    counts.activity_template_checklist = atcCount;

    // template_activities (via template_phases)
    const prodTemplates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let taCount = 0, tpCount = 0;
    for (const pt of prodTemplates) {
      const phases = await ctx.db
        .query("template_phases")
        .withIndex("by_template", (q) => q.eq("template_id", pt._id))
        .collect();
      for (const phase of phases) {
        const activities = await ctx.db
          .query("template_activities")
          .withIndex("by_phase", (q) => q.eq("phase_id", phase._id))
          .collect();
        for (const a of activities) { await ctx.db.delete(a._id); taCount++; }
        await ctx.db.delete(phase._id);
        tpCount++;
      }
    }
    counts.template_activities = taCount;
    counts.template_phases = tpCount;

    // ── Nivel 2: Templates ──

    for (const at of actTemplates) await ctx.db.delete(at._id);
    counts.activity_templates = actTemplates.length;

    for (const pt of prodTemplates) await ctx.db.delete(pt._id);
    counts.production_templates = prodTemplates.length;

    // quality_check_templates
    const qcTemplates = await ctx.db
      .query("quality_check_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const t of qcTemplates) await ctx.db.delete(t._id);
    counts.quality_check_templates = qcTemplates.length;

    // ── Nivel 3: Inventory ──

    // product_price_history (NO by_company — go through products)
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    let pphCount = 0;
    for (const p of products) {
      const history = await ctx.db
        .query("product_price_history")
        .withIndex("by_product", (q) => q.eq("product_id", p._id))
        .collect();
      for (const h of history) { await ctx.db.delete(h._id); pphCount++; }
    }
    counts.product_price_history = pphCount;

    // inventory_items (NO by_company — go through areas by_area)
    let invItemCount = 0;
    for (const area of areas) {
      const invItems = await ctx.db
        .query("inventory_items")
        .withIndex("by_area", (q) => q.eq("area_id", area._id))
        .collect();
      for (const i of invItems) { await ctx.db.delete(i._id); invItemCount++; }
    }
    counts.inventory_items = invItemCount;

    // ── Nivel 4: Resources ──

    for (const p of products) await ctx.db.delete(p._id);
    counts.products = products.length;

    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const s of suppliers) await ctx.db.delete(s._id);
    counts.suppliers = suppliers.length;

    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const c of cultivars) await ctx.db.delete(c._id);
    counts.cultivars = cultivars.length;

    // ── Nivel 5: Areas (already fetched at top) ──

    let structCount = 0;
    for (const area of areas) {
      const structures = await ctx.db
        .query("structures")
        .withIndex("by_area", (q) => q.eq("area_id", area._id))
        .collect();
      for (const s of structures) { await ctx.db.delete(s._id); structCount++; }
    }
    counts.structures = structCount;

    for (const area of areas) await ctx.db.delete(area._id);
    counts.areas = areas.length;

    const otherCrops = await ctx.db
      .query("other_crops")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    for (const oc of otherCrops) await ctx.db.delete(oc._id);
    counts.other_crops = otherCrops.length;

    // ── Nivel 6: Others ──

    const actTypes = await ctx.db
      .query("activity_types")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const at of actTypes) await ctx.db.delete(at._id);
    counts.activity_types = actTypes.length;

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const r of recipes) await ctx.db.delete(r._id);
    counts.recipes = recipes.length;

    const motherPlants = await ctx.db
      .query("mother_plants")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    for (const mp of motherPlants) await ctx.db.delete(mp._id);
    counts.mother_plants = motherPlants.length;

    // media_files & utility_readings
    const mediaFiles = await ctx.db
      .query("media_files")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    for (const mf of mediaFiles) await ctx.db.delete(mf._id);
    counts.media_files = mediaFiles.length;

    const utilityReadings = await ctx.db
      .query("utility_readings")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    for (const ur of utilityReadings) await ctx.db.delete(ur._id);
    counts.utility_readings = utilityReadings.length;

    return counts;
  },
});

// ── Step 5: Seed Activity Templates (the critical gap) ──────────────────────

const ACTIVITY_TEMPLATE_DEFS = [
  {
    name: "Riego diario",
    code: "IRR-DAILY",
    typeCode: "irrigation",
    applicable_phases: ["propagation", "vegetative", "flowering"],
    frequency_type: "daily" as const,
    estimated_duration_minutes: 20,
    description: "Riego manual o automatizado según programa de irrigación",
  },
  {
    name: "Fertirrigación vegetativo",
    code: "FERT-VEG",
    typeCode: "fertigation",
    applicable_phases: ["vegetative"],
    frequency_type: "weekly" as const,
    estimated_duration_minutes: 30,
    description: "Aplicación de nutrientes base A+B + Cal-Mag para fase vegetativa",
  },
  {
    name: "Fertirrigación floración",
    code: "FERT-FLOR",
    typeCode: "fertigation",
    applicable_phases: ["flowering"],
    frequency_type: "weekly" as const,
    estimated_duration_minutes: 30,
    description: "Aplicación de nutrientes bloom A+B + Cal-Mag para fase de floración",
  },
  {
    name: "Poda de formación",
    code: "PRUNE-FORM",
    typeCode: "pruning",
    applicable_phases: ["vegetative"],
    frequency_type: "weekly" as const,
    estimated_duration_minutes: 60,
    description: "Poda apical y lateral para promover ramificación",
  },
  {
    name: "Poda baja (lollipop)",
    code: "PRUNE-LOLLI",
    typeCode: "pruning",
    applicable_phases: ["flowering"],
    frequency_type: "once" as const,
    estimated_duration_minutes: 90,
    description: "Remoción de ramas bajas sin luz para concentrar energía en colas principales",
  },
  {
    name: "Tutorado",
    code: "TRAIN-SCR",
    typeCode: "training",
    applicable_phases: ["vegetative", "flowering"],
    frequency_type: "weekly" as const,
    estimated_duration_minutes: 45,
    description: "Técnicas de entrenamiento: LST, SCROG, supercropping",
  },
  {
    name: "Monitoreo fitosanitario",
    code: "SCOUT-PEST",
    typeCode: "scouting",
    applicable_phases: ["propagation", "vegetative", "flowering"],
    frequency_type: "biweekly" as const,
    estimated_duration_minutes: 45,
    description: "Inspección visual de plagas, enfermedades y deficiencias nutricionales",
  },
  {
    name: "Medición de crecimiento",
    code: "GROW-CHECK",
    typeCode: "growth_check",
    applicable_phases: ["vegetative", "flowering"],
    frequency_type: "weekly" as const,
    estimated_duration_minutes: 25,
    description: "Registro de altura, internodos, y desarrollo de la planta",
  },
  {
    name: "Inspección radicular",
    code: "ROOT-CHECK",
    typeCode: "root_check",
    applicable_phases: ["propagation", "vegetative"],
    frequency_type: "biweekly" as const,
    estimated_duration_minutes: 20,
    description: "Verificar salud de raíces, color, y presencia de patógenos",
  },
  {
    name: "Lectura ambiental",
    code: "ENV-READ",
    typeCode: "environmental_check",
    applicable_phases: ["propagation", "vegetative", "flowering", "drying", "curing"],
    frequency_type: "daily" as const,
    estimated_duration_minutes: 10,
    description: "Registro de temperatura, humedad, CO2, VPD",
  },
  {
    name: "Trasplante",
    code: "TRANSPLANT",
    typeCode: "transplant",
    applicable_phases: ["propagation", "vegetative"],
    frequency_type: "once" as const,
    estimated_duration_minutes: 120,
    description: "Trasplante a contenedor definitivo con sustrato preparado",
  },
  {
    name: "Aspersión foliar preventiva",
    code: "FOLIAR-PREV",
    typeCode: "foliar_spray",
    applicable_phases: ["vegetative", "flowering"],
    frequency_type: "biweekly" as const,
    estimated_duration_minutes: 40,
    description: "Aplicación foliar de aceite de neem u otros preventivos",
  },
  {
    name: "Cosecha (corte)",
    code: "HARVEST-CUT",
    typeCode: "harvest_cut",
    applicable_phases: ["flowering"],
    frequency_type: "once" as const,
    estimated_duration_minutes: 180,
    description: "Corte de plantas maduras, registro de peso húmedo",
  },
  {
    name: "Manicurado / Trimming",
    code: "TRIM-DRY",
    typeCode: "trimming",
    applicable_phases: ["drying"],
    frequency_type: "once" as const,
    estimated_duration_minutes: 480, // 8 hours
    duration_type: "days" as const,
    duration_value: 3,
    description: "Remoción de hojas grandes y manicurado fino, 2-3 días por lote",
  },
  {
    name: "Empaque final",
    code: "PACK-FINAL",
    typeCode: "packaging",
    applicable_phases: ["curing"],
    frequency_type: "once" as const,
    estimated_duration_minutes: 120,
    description: "Pesaje, etiquetado y empaque para distribución",
  },
];

export const seedActivityTemplates = internalMutation({
  args: {
    companyId: v.id("companies"),
    cannabisId: v.id("crop_types"),
  },
  handler: async (ctx, { companyId, cannabisId }) => {
    const now = Date.now();

    // Build code→id map from activity_types
    const actTypes = await ctx.db
      .query("activity_types")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();

    const codeToId: Record<string, Id<"activity_types">> = {};
    for (const at of actTypes) {
      codeToId[at.code] = at._id;
    }

    let created = 0;
    for (let i = 0; i < ACTIVITY_TEMPLATE_DEFS.length; i++) {
      const def = ACTIVITY_TEMPLATE_DEFS[i];
      const typeId = codeToId[def.typeCode];
      if (!typeId) {
        console.warn(`Activity type not found: ${def.typeCode} — skipping ${def.name}`);
        continue;
      }

      await ctx.db.insert("activity_templates", {
        company_id: companyId,
        type_id: typeId,
        name: def.name,
        code: def.code,
        description: def.description,
        crop_type_ids: [cannabisId],
        applicable_phases: def.applicable_phases,
        estimated_duration_minutes: def.estimated_duration_minutes,
        duration_type: def.duration_type,
        duration_value: def.duration_value,
        frequency_type: def.frequency_type,
        requires_verification: false,
        sort_order: i + 1,
        is_active: true,
        version: 1,
        created_at: now,
        updated_at: now,
      });
      created++;
    }

    return { created };
  },
});

// ── Step 6: Seed Activity Template Resources ────────────────────────────────

const TEMPLATE_RESOURCE_DEFS: Array<{
  templateCode: string;
  products: Array<{
    sku: string;
    quantity: number;
    quantity_basis: string;
    direction: string;
    application_rate?: string;
    application_method?: string;
  }>;
}> = [
  {
    templateCode: "FERT-VEG",
    products: [
      { sku: "DEMO-NUT-A", quantity: 2, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "2mL/L", application_method: "drench" },
      { sku: "DEMO-NUT-B", quantity: 2, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "2mL/L", application_method: "drench" },
      { sku: "DEMO-CALMAG", quantity: 1, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "1mL/L", application_method: "drench" },
    ],
  },
  {
    templateCode: "FERT-FLOR",
    products: [
      { sku: "DEMO-BLOOM-A", quantity: 3, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "3mL/L", application_method: "drench" },
      { sku: "DEMO-BLOOM-B", quantity: 3, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "3mL/L", application_method: "drench" },
      { sku: "DEMO-CALMAG", quantity: 1, quantity_basis: "per_L_solution", direction: "consumed", application_rate: "1mL/L", application_method: "drench" },
    ],
  },
  {
    templateCode: "FOLIAR-PREV",
    products: [
      { sku: "DEMO-NEEM", quantity: 5, quantity_basis: "per_L_solution", direction: "applied", application_rate: "5mL/L", application_method: "foliar" },
    ],
  },
  {
    templateCode: "TRANSPLANT",
    products: [
      { sku: "DEMO-MIX", quantity: 10, quantity_basis: "per_plant", direction: "consumed", application_rate: "10L/planta" },
    ],
  },
];

export const seedActivityTemplateResources = internalMutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    const now = Date.now();

    // Build code→id map for activity_templates
    const templates = await ctx.db
      .query("activity_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const templateCodeToId: Record<string, Id<"activity_templates">> = {};
    for (const t of templates) {
      if (t.code) templateCodeToId[t.code] = t._id;
    }

    // Build sku→id map for products
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const skuToId: Record<string, Id<"products">> = {};
    for (const p of products) {
      skuToId[p.sku] = p._id;
    }

    let created = 0;
    for (const def of TEMPLATE_RESOURCE_DEFS) {
      const templateId = templateCodeToId[def.templateCode];
      if (!templateId) {
        console.warn(`Template not found: ${def.templateCode}`);
        continue;
      }

      for (let i = 0; i < def.products.length; i++) {
        const prod = def.products[i];
        const productId = skuToId[prod.sku];
        if (!productId) {
          console.warn(`Product not found: ${prod.sku}`);
          continue;
        }

        await ctx.db.insert("activity_template_resources", {
          template_id: templateId,
          product_id: productId,
          quantity: prod.quantity,
          quantity_basis: prod.quantity_basis,
          direction: prod.direction,
          application_rate: prod.application_rate,
          application_method: prod.application_method,
          is_required: true,
          sequence: i + 1,
          created_at: now,
        });
        created++;
      }
    }

    return { created };
  },
});

// ── Step 5b: Seed Plant Material Products ────────────────────────────────────

export const seedPlantMaterialProducts = internalMutation({
  args: {
    companyId: v.id("companies"),
    cannabisId: v.id("crop_types"),
  },
  handler: async (ctx, { companyId, cannabisId }) => {
    const now = Date.now();

    // Idempotency: skip if PM-SEED-001 already exists
    const existing = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    if (existing.some((p) => p.sku === "PM-SEED-001")) {
      return { created: 0, message: "Plant material products already exist" };
    }

    const chain = [
      { sku: "PM-FINAL-001", name: "Flor Empacada Cannabis", category: "processed_plant", defaultUnit: "g", description: "Producto final empacado, listo para distribución", pricePerUnit: 45000 },
      { sku: "PM-TRIM-001", name: "Flor Trimmeada Cannabis", category: "processed_plant", defaultUnit: "g", description: "Flor seca manicurada, lista para empaque", pricePerUnit: 40000 },
      { sku: "PM-DRY-001", name: "Flor Seca Cannabis", category: "harvest_dry", defaultUnit: "g", description: "Material vegetal secado (12-15% humedad)", pricePerUnit: 35000 },
      { sku: "PM-WET-001", name: "Flor Húmeda Cannabis", category: "harvest_wet", defaultUnit: "g", description: "Material cosechado fresco, previo a secado", pricePerUnit: 8000 },
      { sku: "PM-FLOR-001", name: "Planta en Floración", category: "plant_flowering", defaultUnit: "plants", description: "Planta cannabis en fase de floración", pricePerUnit: 25000 },
      { sku: "PM-VEG-001", name: "Planta Vegetativa", category: "plant_vegetative", defaultUnit: "plants", description: "Planta cannabis en fase vegetativa", pricePerUnit: 15000 },
      { sku: "PM-SEEDLING-001", name: "Plántula Cannabis", category: "seedling", defaultUnit: "plants", description: "Plántula en propagación, post-germinación", pricePerUnit: 8000 },
      { sku: "PM-SEED-001", name: "Semilla Cannabis", category: "seed", defaultUnit: "seeds", description: "Semilla feminizada lista para germinación", pricePerUnit: 5000 },
    ];

    for (const def of chain) {
      await ctx.db.insert("products", {
        company_id: companyId,
        sku: def.sku,
        name: def.name,
        description: def.description,
        category: def.category,
        subcategory: "plant_material",
        applicable_crop_type_ids: [cannabisId],
        regional_suppliers: [],
        weight_value: 1,
        weight_unit: def.defaultUnit,
        regulatory_registered: false,
        organic_certified: false,
        default_price: def.pricePerUnit,
        price_currency: "COP",
        price_unit: "per_unit",
        status: "active",
        created_at: now,
        updated_at: now,
      });
    }

    return { created: chain.length };
  },
});

// ── Step 6: Get seeded references ────────────────────────────────────────────

export const getSeededReferences = internalQuery({
  args: {
    companyId: v.id("companies"),
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, { companyId, facilityId }) => {
    // Find the demo production template
    const templates = await ctx.db
      .query("production_templates")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const demoTemplate = templates.find((t) => t.name.includes("(Demo)"));

    // Find cultivars
    const cultivars = await ctx.db
      .query("cultivars")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const blueDream = cultivars.find((c) => c.name.includes("Blue Dream"));
    const ogKush = cultivars.find((c) => c.name.includes("OG Kush"));

    // Find all areas by type
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", facilityId))
      .collect();
    const propagationArea = areas.find((a) => a.area_type === "propagation");
    const areasByType: Record<string, Id<"areas">> = {};
    for (const area of areas) {
      areasByType[area.area_type] = area._id;
    }

    // Find DEMO products by SKU
    const products = await ctx.db
      .query("products")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const productsBySku: Record<string, Id<"products">> = {};
    for (const p of products) {
      if (p.sku.startsWith("DEMO-")) {
        productsBySku[p.sku] = p._id;
      }
    }

    // Find activity types by code (for ad-hoc activity execution)
    const activityTypes = await ctx.db
      .query("activity_types")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
    const activityTypesByCode: Record<string, Id<"activity_types">> = {};
    for (const at of activityTypes) {
      activityTypesByCode[at.code] = at._id;
    }

    return {
      templateId: demoTemplate?._id,
      cultivarIds: {
        blueDream: blueDream?._id,
        ogKush: ogKush?._id,
      },
      areaIds: {
        propagation: propagationArea?._id,
      },
      areasByType,
      productsBySku,
      activityTypesByCode,
    };
  },
});

// ── Step 7b: Get order phase IDs ────────────────────────────────────────────

export const getOrderPhaseIds = internalQuery({
  args: {
    orderId: v.id("production_orders"),
  },
  handler: async (ctx, { orderId }) => {
    const phases = await ctx.db
      .query("order_phases")
      .withIndex("by_order", (q) => q.eq("order_id", orderId))
      .collect();

    return phases
      .sort((a, b) => a.phase_order - b.phase_order)
      .map((p) => ({
        _id: p._id,
        phase_name: p.phase_name,
        status: p.status,
        completion_criteria: (p.completion_criteria as Array<{ id: string; is_required: boolean }>) ?? [],
      }));
  },
});

// ── Step 7c: Get scheduled activities for a phase ────────────────────────

export const getScheduledActivitiesForPhase = internalQuery({
  args: { orderPhaseId: v.id("order_phases") },
  handler: async (ctx, { orderPhaseId }) => {
    // Entry activities (phase_role="entry")
    const entry = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_phase_role", (q) =>
        q.eq("order_phase_id", orderPhaseId).eq("phase_role", "entry")
      )
      .collect();

    // Exit activities (phase_role="exit")
    const exit = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_phase_role", (q) =>
        q.eq("order_phase_id", orderPhaseId).eq("phase_role", "exit")
      )
      .collect();

    // Regular activities (no phase_role) — query by order_phase_id, filter out entry/exit
    const allForPhase = await ctx.db
      .query("scheduled_activities")
      .withIndex("by_phase_role", (q) =>
        q.eq("order_phase_id", orderPhaseId)
      )
      .collect();
    const regular = allForPhase.filter(
      (sa) => sa.phase_role !== "entry" && sa.phase_role !== "exit"
    );

    return {
      entry: entry.map((sa) => ({
        _id: sa._id,
        group_id: sa.group_id,
        status: sa.status,
        activity_type: sa.activity_type,
        type_id: sa.type_id,
      })),
      exit: exit.map((sa) => ({
        _id: sa._id,
        group_id: sa.group_id,
        status: sa.status,
        activity_type: sa.activity_type,
        type_id: sa.type_id,
      })),
      regular: regular.map((sa) => ({
        _id: sa._id,
        group_id: sa.group_id,
        status: sa.status,
        activity_type: sa.activity_type,
        type_id: sa.type_id,
      })),
    };
  },
});

// ── Step 7d: Get batches for an order ────────────────────────────────────

export const getBatchesForOrder = internalQuery({
  args: { orderId: v.id("production_orders") },
  handler: async (ctx, { orderId }) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_production_order", (q) =>
        q.eq("production_order_id", orderId)
      )
      .collect();

    return batches.map((b) => ({
      _id: b._id,
      batch_code: b.batch_code,
      current_quantity: b.current_quantity,
      area_id: b.area_id,
    }));
  },
});

// ── Step 7e: Seed traceability data (observations + env readings) ────────

export const seedTraceabilityData = internalMutation({
  args: {
    activityId: v.id("activities"),
    companyId: v.id("companies"),
    observations: v.optional(
      v.array(
        v.object({
          observation_type: v.string(),
          severity: v.optional(v.string()),
          description: v.string(),
          recommended_action: v.optional(v.string()),
          organism_name: v.optional(v.string()),
          affected_area_pct: v.optional(v.number()),
          plant_part: v.optional(v.string()),
        })
      )
    ),
    environmentalReadings: v.optional(
      v.array(
        v.object({
          reading_type: v.string(),
          value: v.number(),
          unit: v.string(),
          location_note: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let obsCount = 0;
    let envCount = 0;

    if (args.observations) {
      for (const obs of args.observations) {
        await ctx.db.insert("activity_observations", {
          activity_id: args.activityId,
          company_id: args.companyId,
          observation_type: obs.observation_type,
          severity: obs.severity,
          organism_name: obs.organism_name,
          affected_area_pct: obs.affected_area_pct,
          plant_part: obs.plant_part,
          description: obs.description,
          recommended_action: obs.recommended_action,
          resolved: obs.observation_type === "positive" || obs.observation_type === "growth",
          resolved_at:
            obs.observation_type === "positive" || obs.observation_type === "growth"
              ? now
              : undefined,
          created_at: now,
        });
        obsCount++;
      }
    }

    if (args.environmentalReadings) {
      for (const reading of args.environmentalReadings) {
        await ctx.db.insert("activity_environmental_readings", {
          activity_id: args.activityId,
          company_id: args.companyId,
          reading_type: reading.reading_type,
          value: reading.value,
          unit: reading.unit,
          measured_at: now,
          location_note: reading.location_note,
          created_at: now,
        });
        envCount++;
      }
    }

    return { observations: obsCount, environmentalReadings: envCount };
  },
});

// ── Step 7f: Seed batch movements ────────────────────────────────────────

export const seedBatchMovements = internalMutation({
  args: {
    movements: v.array(
      v.object({
        batchId: v.id("batches"),
        fromAreaId: v.id("areas"),
        toAreaId: v.id("areas"),
        reason: v.string(),
        performedBy: v.id("users"),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const mov of args.movements) {
      // Insert batch_movement record
      await ctx.db.insert("batch_movements", {
        batch_id: mov.batchId,
        from_area_id: mov.fromAreaId,
        to_area_id: mov.toAreaId,
        movement_date: now,
        reason: mov.reason,
        performed_by: mov.performedBy,
        created_at: now,
      });

      // Update batch area_id
      const batch = await ctx.db.get(mov.batchId);
      if (batch) {
        await ctx.db.patch(mov.batchId, { area_id: mov.toAreaId });

        // Decrease from-area occupancy
        const fromArea = await ctx.db.get(mov.fromAreaId);
        if (fromArea) {
          await ctx.db.patch(mov.fromAreaId, {
            current_occupancy: Math.max(0, fromArea.current_occupancy - batch.current_quantity),
          });
        }

        // Increase to-area occupancy
        const toArea = await ctx.db.get(mov.toAreaId);
        if (toArea) {
          await ctx.db.patch(mov.toAreaId, {
            current_occupancy: toArea.current_occupancy + batch.current_quantity,
          });
        }
      }
    }

    return { created: args.movements.length };
  },
});

// ── Step 8: Orchestrator Action ─────────────────────────────────────────────

export const reseed = action({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<{
    success: boolean;
    deleted: { production: Record<string, number>; config: Record<string, number> };
    seeded: {
      activityTemplates: number;
      templateResources: number;
      plantMaterialProducts: number;
      productionOrders: number;
    };
  }> => {
    console.log(`\n🌱 RESEED starting for ${email}...\n`);

    // 1. Resolve user context
    console.log("Step 1: Resolving user context...");
    const context: {
      companyId: Id<"companies">;
      facilityId: Id<"facilities">;
      userId: Id<"users">;
      cannabisId: Id<"crop_types">;
    } = await ctx.runQuery(internal.seedReseed.resolveAndValidate, { email });
    console.log(`  ✓ Company: ${context.companyId}, Facility: ${context.facilityId}`);

    // 2. Clear production data
    console.log("\nStep 2: Clearing production data...");
    const prodCounts: Record<string, number> = await ctx.runMutation(internal.seedReseed.clearProductionData, {
      companyId: context.companyId,
      facilityId: context.facilityId,
    });
    const totalProdDeleted = Object.values(prodCounts).reduce((a: number, b: number) => a + b, 0);
    console.log(`  ✓ Deleted ${totalProdDeleted} production records`);
    for (const [table, count] of Object.entries(prodCounts)) {
      if ((count as number) > 0) console.log(`    - ${table}: ${count}`);
    }

    // 3. Clear config data
    console.log("\nStep 3: Clearing config data...");
    const configCounts: Record<string, number> = await ctx.runMutation(internal.seedReseed.clearConfigData, {
      companyId: context.companyId,
      facilityId: context.facilityId,
    });
    const totalConfigDeleted = Object.values(configCounts).reduce((a: number, b: number) => a + b, 0);
    console.log(`  ✓ Deleted ${totalConfigDeleted} config records`);
    for (const [table, count] of Object.entries(configCounts)) {
      if ((count as number) > 0) console.log(`    - ${table}: ${count}`);
    }

    // 4a. Seed activity types
    console.log("\nStep 4a: Seeding activity types...");
    await ctx.runMutation(api.activityTypes.seedDefaults, {
      companyId: context.companyId,
    });
    console.log("  ✓ Activity types seeded");

    // 4b. Seed onboarding data (areas, cultivars, suppliers, products, inventory, template)
    console.log("\nStep 4b: Seeding onboarding data...");
    await ctx.runMutation(api.seedOnboardingData.generateSampleDataForNewCompany, {
      companyId: context.companyId,
      facilityId: context.facilityId,
      userId: context.userId,
      cropTypeId: context.cannabisId,
    });
    console.log("  ✓ Onboarding data seeded");

    // 4c. Seed activity templates (the critical gap)
    console.log("\nStep 4c: Seeding activity templates...");
    const atResult: { created: number } = await ctx.runMutation(internal.seedReseed.seedActivityTemplates, {
      companyId: context.companyId,
      cannabisId: context.cannabisId,
    });
    console.log(`  ✓ ${atResult.created} activity templates created`);

    // 4d. Seed activity template resources
    console.log("\nStep 4d: Seeding activity template resources...");
    const atrResult: { created: number } = await ctx.runMutation(internal.seedReseed.seedActivityTemplateResources, {
      companyId: context.companyId,
    });
    console.log(`  ✓ ${atrResult.created} template resources created`);

    // 5. Seed plant material products (transformation chain)
    console.log("\nStep 5: Seeding plant material products...");
    const pmResult: { created: number } = await ctx.runMutation(internal.seedReseed.seedPlantMaterialProducts, {
      companyId: context.companyId,
      cannabisId: context.cannabisId,
    });
    console.log(`  ✓ ${pmResult.created} plant material products created`);

    // 6. Get seeded references for production orders
    console.log("\nStep 6: Resolving seeded references...");
    const refs = await ctx.runQuery(internal.seedReseed.getSeededReferences, {
      companyId: context.companyId,
      facilityId: context.facilityId,
    });

    if (!refs.templateId || !refs.cultivarIds.blueDream || !refs.areaIds.propagation) {
      console.log("  ⚠ Missing references for production orders — skipping steps 7-10");
      console.log(`    templateId: ${refs.templateId ?? "MISSING"}`);
      console.log(`    blueDream: ${refs.cultivarIds.blueDream ?? "MISSING"}`);
      console.log(`    propagation: ${refs.areaIds.propagation ?? "MISSING"}`);

      return {
        success: true,
        deleted: { production: prodCounts, config: configCounts },
        seeded: {
          activityTemplates: atResult.created,
          templateResources: atrResult.created,
          plantMaterialProducts: pmResult.created,
          productionOrders: 0,
        },
      };
    }
    console.log(`  ✓ Template: ${refs.templateId}, BlueDream: ${refs.cultivarIds.blueDream}`);

    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Helper: build resource arg for executeActivity
    const makeResource = (productId: Id<"products">, qty: number, unit: string) => ({
      product_id: productId,
      direction: "consumed",
      quantity: qty,
      quantity_unit: unit,
    });

    // 7. Create order #1 — Blue Dream (mid-lifecycle)
    console.log("\nStep 7: Creating production order #1 (Blue Dream)...");
    const order1Id: Id<"production_orders"> = await ctx.runMutation(api.productionOrders.create, {
      companyId: context.companyId,
      facilityId: context.facilityId,
      templateId: refs.templateId,
      cropTypeId: context.cannabisId,
      cultivarId: refs.cultivarIds.blueDream,
      orderType: "seed-to-harvest",
      sourceType: "clone",
      requestedQuantity: 100,
      batchSize: 50,
      targetAreaId: refs.areaIds.propagation,
      plannedStartDate: now - 45 * DAY_MS,
      priority: "high",
      notes: "Orden demo Blue Dream — generada por reseed",
      requestedBy: context.userId,
    });
    console.log(`  ✓ Order #1 created: ${order1Id}`);

    // 8. Activate order #1 (creates batches, distributes activities)
    console.log("\nStep 8: Activating order #1...");
    await ctx.runMutation(api.productionOrders.activate, {
      orderId: order1Id,
      approvedBy: context.userId,
      targetAreaId: refs.areaIds.propagation,
    });
    console.log("  ✓ Order #1 activated (2 batches created)");

    // 8b. Resolve batch and phase references
    console.log("\nStep 8b: Resolving batches and phase references...");
    const batches = await ctx.runQuery(internal.seedReseed.getBatchesForOrder, { orderId: order1Id });
    const phases1 = await ctx.runQuery(internal.seedReseed.getOrderPhaseIds, { orderId: order1Id });
    console.log(`  ✓ ${batches.length} batches, ${phases1.length} phases resolved`);

    if (phases1.length >= 3 && batches.length >= 2) {
      const propPhase = phases1[0];
      const vegPhase = phases1[1];
      const florPhase = phases1[2];
      const vegAreaId = refs.areasByType["vegetative"];
      const florAreaId = refs.areasByType["flowering"];

      // ═══════════════════════════════════════════════════════════════════
      // 9. PROPAGATION — full cycle
      // ═══════════════════════════════════════════════════════════════════
      console.log("\nStep 9: Propagation — full cycle...");
      const propSAs = await ctx.runQuery(internal.seedReseed.getScheduledActivitiesForPhase, {
        orderPhaseId: propPhase._id as Id<"order_phases">,
      });

      // 9a. Entry activity (multi-batch via groupId) → phase in_progress
      let propEntryActivityId: Id<"activities"> | null = null;
      const propEntryGroupId = propSAs.entry[0]?.group_id;
      if (propEntryGroupId) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          groupId: propEntryGroupId,
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "propagation",
          notes: "Inicio de propagación — preparación de esquejes",
          envTemp: 24,
          envHumidity: 78,
        });
        propEntryActivityId = result.activityId;
        console.log("  ✓ 9a: Entry executed → phase in_progress");
      }

      // 9b. Env readings for entry
      if (propEntryActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: propEntryActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 24, unit: "C", location_note: "Canopy level" },
            { reading_type: "humidity", value: 78, unit: "%", location_note: "Ambient" },
            { reading_type: "vpd", value: 0.8, unit: "kPa", location_note: "Canopy level" },
          ],
        });
        console.log("  ✓ 9b: Env readings seeded (temp/hum/VPD)");
      }

      // 9c. Execute ad-hoc Riego with resource consumption
      let propRegularActivityId: Id<"activities"> | null = null;
      const irrigationTypeId = refs.activityTypesByCode["irrigation"];
      if (irrigationTypeId && refs.productsBySku["DEMO-NUT-A"]) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          typeId: irrigationTypeId,
          batchIds: batches.map((b) => b._id),
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "propagation",
          notes: "Riego con nutriente base A",
          envTemp: 24.5,
          envHumidity: 76,
          resources: [makeResource(refs.productsBySku["DEMO-NUT-A"], 1, "L")],
          consumeInventory: true,
        });
        propRegularActivityId = result.activityId;
        console.log("  ✓ 9c: Riego executed with NUT-A (1L FIFO)");
      }

      // 9d. Env readings for regular
      if (propRegularActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: propRegularActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 24.5, unit: "C" },
            { reading_type: "humidity", value: 76, unit: "%" },
          ],
        });
        console.log("  ✓ 9d: Env readings seeded");
      }

      // 9e. Mark completion criteria (prop-roots, prop-survival)
      for (const criterion of propPhase.completion_criteria.filter(
        (c: { is_required: boolean }) => c.is_required
      )) {
        await ctx.runMutation(api.productionOrders.updateCriterionStatus, {
          orderId: order1Id,
          phaseId: propPhase._id as Id<"order_phases">,
          criterionId: criterion.id,
          status: "completed",
          performedBy: context.userId,
        });
      }
      console.log("  ✓ 9e: Completion criteria marked (prop-roots, prop-survival)");

      // 9f. Exit activity → phase complete → Vegetativo awaiting_entry
      let propExitActivityId: Id<"activities"> | null = null;
      const propExitSA = propSAs.exit[0];
      if (propExitSA) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          scheduledActivityId: propExitSA._id,
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "propagation",
          notes: "Inspección final de propagación",
        });
        propExitActivityId = result.activityId;
        console.log("  ✓ 9f: Exit executed → Vegetativo awaiting_entry");
      }

      // 9g. Observations for exit
      if (propExitActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: propExitActivityId,
          companyId: context.companyId,
          observations: [
            {
              observation_type: "growth",
              description: "Raíces visibles en 90% de los esquejes, supervivencia del 92%",
              severity: "none",
            },
            {
              observation_type: "positive",
              description: "Esquejes con buen vigor y coloración saludable",
            },
          ],
        });
        console.log("  ✓ 9g: Observations seeded");
      }

      // 9h. Batch movements: propagation → vegetative
      if (vegAreaId) {
        await ctx.runMutation(internal.seedReseed.seedBatchMovements, {
          movements: batches.map((b) => ({
            batchId: b._id,
            fromAreaId: refs.areaIds.propagation!,
            toAreaId: vegAreaId,
            reason: "phase_change",
            performedBy: context.userId,
          })),
        });
        console.log("  ✓ 9h: Batch movements seeded (prop → veg)");
      }

      // ═══════════════════════════════════════════════════════════════════
      // 10. VEGETATIVE — full cycle
      // ═══════════════════════════════════════════════════════════════════
      console.log("\nStep 10: Vegetative — full cycle...");
      const vegSAs = await ctx.runQuery(internal.seedReseed.getScheduledActivitiesForPhase, {
        orderPhaseId: vegPhase._id as Id<"order_phases">,
      });

      // 10a. Entry activity → phase in_progress
      let vegEntryActivityId: Id<"activities"> | null = null;
      const vegEntryGroupId = vegSAs.entry[0]?.group_id;
      if (vegEntryGroupId) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          groupId: vegEntryGroupId,
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "vegetative",
          notes: "Inicio vegetativo — riego de aclimatación post-trasplante",
          envTemp: 25,
          envHumidity: 62,
        });
        vegEntryActivityId = result.activityId;
        console.log("  ✓ 10a: Entry executed → phase in_progress");
      }

      // 10b. Env readings + observation for entry
      if (vegEntryActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: vegEntryActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 25, unit: "C", location_note: "Canopy level" },
            { reading_type: "humidity", value: 62, unit: "%", location_note: "Ambient" },
            { reading_type: "vpd", value: 1.1, unit: "kPa", location_note: "Canopy level" },
          ],
          observations: [
            {
              observation_type: "growth",
              description: "Trasplante exitoso, plantas aclimatándose bien",
              severity: "none",
            },
          ],
        });
        console.log("  ✓ 10b: Env readings + observation seeded");
      }

      // 10c. Execute ad-hoc fertilización with resources (NUT-A + NUT-B + CALMAG)
      let vegFertActivityId: Id<"activities"> | null = null;
      const fertigationTypeId = refs.activityTypesByCode["fertigation"];
      if (
        fertigationTypeId &&
        refs.productsBySku["DEMO-NUT-A"] &&
        refs.productsBySku["DEMO-NUT-B"] &&
        refs.productsBySku["DEMO-CALMAG"]
      ) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          typeId: fertigationTypeId,
          batchIds: batches.map((b) => b._id),
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "vegetative",
          notes: "Fertilización vegetativa — Base A+B + Cal-Mag",
          envTemp: 25.5,
          envHumidity: 60,
          resources: [
            makeResource(refs.productsBySku["DEMO-NUT-A"], 1, "L"),
            makeResource(refs.productsBySku["DEMO-NUT-B"], 1, "L"),
            makeResource(refs.productsBySku["DEMO-CALMAG"], 1, "L"),
          ],
          consumeInventory: true,
        });
        vegFertActivityId = result.activityId;
        console.log("  ✓ 10c: Fertilización executed with NUT-A/B + CALMAG");
      }

      // 10d. Env readings for fertilización
      if (vegFertActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: vegFertActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 25.5, unit: "C" },
            { reading_type: "humidity", value: 60, unit: "%" },
          ],
        });
        console.log("  ✓ 10d: Env readings seeded");
      }

      // 10e. Mark completion criteria (veg-height, veg-nodes)
      for (const criterion of vegPhase.completion_criteria.filter(
        (c: { is_required: boolean }) => c.is_required
      )) {
        await ctx.runMutation(api.productionOrders.updateCriterionStatus, {
          orderId: order1Id,
          phaseId: vegPhase._id as Id<"order_phases">,
          criterionId: criterion.id,
          status: "completed",
          performedBy: context.userId,
        });
      }
      console.log("  ✓ 10e: Completion criteria marked (veg-height, veg-nodes)");

      // 10f. Exit activity → phase complete → Floración awaiting_entry
      let vegExitActivityId: Id<"activities"> | null = null;
      const vegExitSA = vegSAs.exit[0];
      if (vegExitSA) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          scheduledActivityId: vegExitSA._id,
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "vegetative",
          notes: "Inspección final de vegetativo",
        });
        vegExitActivityId = result.activityId;
        console.log("  ✓ 10f: Exit executed → Floración awaiting_entry");
      }

      // 10g. Observations for exit
      if (vegExitActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: vegExitActivityId,
          companyId: context.companyId,
          observations: [
            {
              observation_type: "growth",
              description: "Altura promedio 38cm, 7 nudos desarrollados, sin plagas detectadas",
              severity: "none",
            },
          ],
        });
        console.log("  ✓ 10g: Observations seeded");
      }

      // 10h. Batch movements: vegetative → flowering
      if (vegAreaId && florAreaId) {
        await ctx.runMutation(internal.seedReseed.seedBatchMovements, {
          movements: batches.map((b) => ({
            batchId: b._id,
            fromAreaId: vegAreaId,
            toAreaId: florAreaId,
            reason: "phase_change",
            performedBy: context.userId,
          })),
        });
        console.log("  ✓ 10h: Batch movements seeded (veg → flor)");
      }

      // ═══════════════════════════════════════════════════════════════════
      // 11. FLOWERING — entry + 1 activity (in progress)
      // ═══════════════════════════════════════════════════════════════════
      console.log("\nStep 11: Flowering — entry + 1 activity...");
      const florSAs = await ctx.runQuery(internal.seedReseed.getScheduledActivitiesForPhase, {
        orderPhaseId: florPhase._id as Id<"order_phases">,
      });

      // 11a. Entry activity → phase in_progress
      let florEntryActivityId: Id<"activities"> | null = null;
      const florEntryGroupId = florSAs.entry[0]?.group_id;
      if (florEntryGroupId) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          groupId: florEntryGroupId,
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "flowering",
          notes: "Inicio floración — cambio de fotoperiodo 12/12",
          envTemp: 23,
          envHumidity: 48,
        });
        florEntryActivityId = result.activityId;
        console.log("  ✓ 11a: Entry executed → phase in_progress");
      }

      // 11b. Env readings for entry
      if (florEntryActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: florEntryActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 23, unit: "C", location_note: "Canopy level" },
            { reading_type: "humidity", value: 48, unit: "%", location_note: "Ambient" },
            { reading_type: "vpd", value: 1.3, unit: "kPa", location_note: "Canopy level" },
          ],
        });
        console.log("  ✓ 11b: Env readings seeded (temp/hum/VPD)");
      }

      // 11c. Execute ad-hoc fertirrigación with bloom resources
      let florFertActivityId: Id<"activities"> | null = null;
      if (
        fertigationTypeId &&
        refs.productsBySku["DEMO-BLOOM-A"] &&
        refs.productsBySku["DEMO-BLOOM-B"] &&
        refs.productsBySku["DEMO-CALMAG"]
      ) {
        const result = await ctx.runMutation(api.activities.executeActivity, {
          typeId: fertigationTypeId,
          batchIds: batches.map((b) => b._id),
          performedBy: context.userId,
          companyId: context.companyId,
          facilityId: context.facilityId,
          cropPhase: "flowering",
          notes: "Fertirrigación floración — Bloom A+B + Cal-Mag",
          envTemp: 23.5,
          envHumidity: 50,
          resources: [
            makeResource(refs.productsBySku["DEMO-BLOOM-A"], 1, "L"),
            makeResource(refs.productsBySku["DEMO-BLOOM-B"], 1, "L"),
            makeResource(refs.productsBySku["DEMO-CALMAG"], 1, "L"),
          ],
          consumeInventory: true,
        });
        florFertActivityId = result.activityId;
        console.log("  ✓ 11c: Fertirrigación executed with BLOOM-A/B + CALMAG");
      }

      // 11d. Observations + env for fertirrigación (pest finding)
      if (florFertActivityId) {
        await ctx.runMutation(internal.seedReseed.seedTraceabilityData, {
          activityId: florFertActivityId,
          companyId: context.companyId,
          environmentalReadings: [
            { reading_type: "temperature", value: 23.5, unit: "C" },
            { reading_type: "humidity", value: 50, unit: "%" },
          ],
          observations: [
            {
              observation_type: "pest",
              severity: "low",
              description: "Trips detectados en hojas inferiores de 3 plantas",
              recommended_action: "Aplicar aceite de neem en aspersión foliar",
              plant_part: "leaf",
              affected_area_pct: 8,
            },
          ],
        });
        console.log("  ✓ 11d: Env readings + pest observation seeded");
      }

      // Flowering stays in_progress — no exit, no criteria completion
      console.log("  ✓ Flowering remains in_progress (realistic mid-lifecycle state)");
    } else {
      console.log("  ⚠ Insufficient phases or batches — skipping traceability steps 9-11");
    }

    // 12. Create order #2 — OG Kush (planning only)
    console.log("\nStep 12: Creating production order #2 (OG Kush)...");
    let order2Created = false;
    if (refs.cultivarIds.ogKush) {
      await ctx.runMutation(api.productionOrders.create, {
        companyId: context.companyId,
        facilityId: context.facilityId,
        templateId: refs.templateId,
        cropTypeId: context.cannabisId,
        cultivarId: refs.cultivarIds.ogKush,
        orderType: "seed-to-harvest",
        sourceType: "clone",
        requestedQuantity: 60,
        batchSize: 30,
        plannedStartDate: now + 7 * DAY_MS,
        priority: "normal",
        notes: "Orden demo OG Kush — generada por reseed",
        requestedBy: context.userId,
      });
      order2Created = true;
      console.log("  ✓ Order #2 created (planning)");
    } else {
      console.log("  ⚠ OG Kush cultivar not found — skipping order #2");
    }

    console.log(`\n✅ RESEED COMPLETE`);
    console.log(`  Deleted: ${totalProdDeleted} production + ${totalConfigDeleted} config = ${totalProdDeleted + totalConfigDeleted} total`);
    console.log(`  Created: config + ${atResult.created} activity templates + ${atrResult.created} resources`);
    console.log(`  Created: ${pmResult.created} plant material products`);
    console.log(`  Created: ${order2Created ? 2 : 1} production orders with full traceability`);
    console.log(`  Traceability: activities + observations + env readings + batch movements`);

    return {
      success: true,
      deleted: { production: prodCounts, config: configCounts },
      seeded: {
        activityTemplates: atResult.created,
        templateResources: atrResult.created,
        plantMaterialProducts: pmResult.created,
        productionOrders: order2Created ? 2 : 1,
      },
    };
  },
});
