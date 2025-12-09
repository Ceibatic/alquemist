/**
 * Batch Queries and Mutations
 * Batch-first tracking for agricultural production
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List batches for a company/facility/area
 */
export const list = query({
  args: {
    companyId: v.string(),
    facility_id: v.optional(v.id("facilities")),
    area_id: v.optional(v.id("areas")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let batchesQuery = ctx.db.query("batches");

    // Apply filters
    if (args.facility_id) {
      batchesQuery = batchesQuery.filter((q) =>
        q.eq(q.field("facility_id"), args.facility_id)
      );
    }

    if (args.area_id) {
      batchesQuery = batchesQuery.filter((q) =>
        q.eq(q.field("area_id"), args.area_id)
      );
    }

    if (args.status) {
      batchesQuery = batchesQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const allBatches = await batchesQuery.collect();

    // Filter by company - verify facility ownership
    const batches: any[] = [];
    for (const batch of allBatches) {
      const facility = await ctx.db.get(batch.facility_id);
      if (facility && facility.company_id === args.companyId) {
        batches.push(batch);
      }
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      batches: batches.slice(offset, offset + limit),
      total: batches.length,
    };
  },
});

/**
 * Get batch by ID
 */
export const get = query({
  args: {
    id: v.id("batches"),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) return null;

    // Verify company ownership through facility
    const facility = await ctx.db.get(batch.facility_id);
    if (!facility || facility.company_id !== args.companyId) {
      return null;
    }

    return batch;
  },
});

/**
 * Create a new batch
 */
export const create = mutation({
  args: {
    company_id: v.id("companies"),
    facility_id: v.id("facilities"),
    area_id: v.id("areas"),
    crop_type_id: v.id("crop_types"),
    cultivar_id: v.optional(v.id("cultivars")),
    production_order_id: v.optional(v.id("production_orders")),
    template_id: v.optional(v.id("production_templates")),
    source_batch_id: v.optional(v.id("batches")),

    batch_type: v.string(), // production/mother/research/rescue
    source_type: v.string(), // seed/clone/purchase/rescue
    tracking_level: v.optional(v.string()),
    enable_individual_tracking: v.optional(v.boolean()),

    planned_quantity: v.number(),
    current_quantity: v.number(),
    initial_quantity: v.number(),
    unit_of_measure: v.string(),

    sample_size: v.optional(v.number()),
    sample_frequency: v.optional(v.string()),

    germination_date: v.optional(v.number()),
    planned_completion_date: v.optional(v.number()),

    supplier_id: v.optional(v.id("suppliers")),
    external_lot_number: v.optional(v.string()),
    received_date: v.optional(v.number()),
    phytosanitary_certificate: v.optional(v.string()),

    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Generate batch code (cultivar-YYMMDD-XXX)
    const date = new Date(now);
    const dateStr = `${date.getFullYear().toString().slice(-2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const batchCode = `BAT-${dateStr}-${randomSuffix}`;

    const batchId = await ctx.db.insert("batches", {
      batch_code: batchCode,
      qr_code: batchCode, // Use batch_code as QR code
      company_id: args.company_id,
      facility_id: args.facility_id,
      area_id: args.area_id,
      crop_type_id: args.crop_type_id,
      cultivar_id: args.cultivar_id,
      production_order_id: args.production_order_id,
      template_id: args.template_id,
      source_batch_id: args.source_batch_id,

      batch_type: args.batch_type,
      source_type: args.source_type,
      tracking_level: args.tracking_level || "batch",
      enable_individual_tracking: args.enable_individual_tracking || false,

      planned_quantity: args.planned_quantity,
      current_quantity: args.current_quantity,
      initial_quantity: args.initial_quantity,
      lost_quantity: 0,
      unit_of_measure: args.unit_of_measure,

      sample_size: args.sample_size,
      sample_frequency: args.sample_frequency,

      germination_date: args.germination_date,
      created_date: now,
      planned_completion_date: args.planned_completion_date,

      environmental_history: [],

      supplier_id: args.supplier_id,
      external_lot_number: args.external_lot_number,
      received_date: args.received_date,
      phytosanitary_certificate: args.phytosanitary_certificate,

      created_by: args.created_by,
      status: args.status || "active",
      priority: args.priority || "normal",
      notes: args.notes,
      updated_at: now,
    });

    return {
      id: batchId,
      batch_code: batchCode,
    };
  },
});

/**
 * Update batch
 */
export const update = mutation({
  args: {
    id: v.id("batches"),
    companyId: v.string(),

    current_quantity: v.optional(v.number()),
    status: v.optional(v.string()),
    quality_grade: v.optional(v.string()),
    actual_completion_date: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, companyId, ...updates } = args;

    // Verify company ownership
    const batch = await ctx.db.get(id);
    if (!batch) throw new Error("Batch not found");

    const facility = await ctx.db.get(batch.facility_id);
    if (!facility || facility.company_id !== companyId) {
      throw new Error("Batch not found or access denied");
    }

    await ctx.db.patch(id, {
      ...updates,
      updated_at: Date.now(),
    });

    return id;
  },
});
