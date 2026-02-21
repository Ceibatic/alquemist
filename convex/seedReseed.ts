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

    // order_phases (via production_orders)
    const orders = await ctx.db
      .query("production_orders")
      .withIndex("by_company", (q) => q.eq("company_id", companyId))
      .collect();
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

// ── Step 7: Orchestrator Action ─────────────────────────────────────────────

export const reseed = action({
  args: { email: v.string() },
  handler: async (ctx, { email }): Promise<{
    success: boolean;
    deleted: { production: Record<string, number>; config: Record<string, number> };
    seeded: { activityTemplates: number; templateResources: number };
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

    console.log(`\n✅ RESEED COMPLETE`);
    console.log(`  Deleted: ${totalProdDeleted} production + ${totalConfigDeleted} config = ${totalProdDeleted + totalConfigDeleted} total`);
    console.log(`  Created: activity types + 6 areas + cultivars + suppliers + products + inventory + 1 template + ${atResult.created} activity templates + ${atrResult.created} resources`);

    return {
      success: true,
      deleted: { production: prodCounts, config: configCounts },
      seeded: {
        activityTemplates: atResult.created,
        templateResources: atrResult.created,
      },
    };
  },
});
