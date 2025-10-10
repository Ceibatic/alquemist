/**
 * Inventory Queries and Mutations
 * Inventory management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List inventory items
 */
export const list = query({
  args: {
    companyId: v.string(),
    area_id: v.optional(v.id("areas")),
    product_id: v.optional(v.id("products")),
    lot_status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let itemsQuery = ctx.db.query("inventory_items");

    // Apply filters
    if (args.area_id) {
      itemsQuery = itemsQuery.filter((q) =>
        q.eq(q.field("area_id"), args.area_id)
      );
    }

    if (args.product_id) {
      itemsQuery = itemsQuery.filter((q) =>
        q.eq(q.field("product_id"), args.product_id)
      );
    }

    if (args.lot_status) {
      itemsQuery = itemsQuery.filter((q) =>
        q.eq(q.field("lot_status"), args.lot_status)
      );
    }

    const items = await itemsQuery.collect();

    // TODO: Verify company ownership through area/facility
    // For now, return all matching items

    const offset = args.offset || 0;
    const limit = args.limit || 50;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
    };
  },
});

/**
 * Create inventory item
 */
export const create = mutation({
  args: {
    product_id: v.id("products"),
    area_id: v.id("areas"),
    supplier_id: v.optional(v.id("suppliers")),

    quantity_available: v.number(),
    quantity_unit: v.string(),

    batch_number: v.optional(v.string()),
    supplier_lot_number: v.optional(v.string()),

    received_date: v.optional(v.number()),
    manufacturing_date: v.optional(v.number()),
    expiration_date: v.optional(v.number()),

    purchase_price: v.optional(v.number()),
    cost_per_unit: v.optional(v.number()),

    lot_status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const itemId = await ctx.db.insert("inventory_items", {
      product_id: args.product_id,
      area_id: args.area_id,
      supplier_id: args.supplier_id,

      quantity_available: args.quantity_available,
      quantity_reserved: 0,
      quantity_committed: 0,
      quantity_unit: args.quantity_unit,

      batch_number: args.batch_number,
      supplier_lot_number: args.supplier_lot_number,
      serial_numbers: [],

      received_date: args.received_date,
      manufacturing_date: args.manufacturing_date,
      expiration_date: args.expiration_date,
      last_tested_date: undefined,

      purchase_price: args.purchase_price,
      current_value: args.purchase_price,
      cost_per_unit: args.cost_per_unit,

      quality_grade: undefined,
      quality_notes: undefined,
      certificates: [],

      source_type: undefined,
      source_recipe_id: undefined,
      source_batch_id: undefined,
      production_date: undefined,

      storage_conditions: undefined,
      minimum_stock_level: undefined,
      maximum_stock_level: undefined,
      reorder_point: undefined,
      lead_time_days: undefined,

      lot_status: args.lot_status || "available",
      last_movement_date: now,
      notes: undefined,

      created_at: now,
      updated_at: now,
    });

    return itemId;
  },
});
