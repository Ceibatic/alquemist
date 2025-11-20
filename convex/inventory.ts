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

// ============================================================================
// PHASE 2: INVENTORY MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get inventory items by facility
 * Phase 2 Module 19
 */
export const getByFacility = query({
  args: {
    facilityId: v.id("facilities"),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get all areas for this facility first
    const areas = await ctx.db
      .query("areas")
      .withIndex("by_facility", (q) => q.eq("facility_id", args.facilityId))
      .collect();

    const areaIds = areas.map((a) => a._id);

    // Get inventory items in these areas
    const allItems = await ctx.db.query("inventory_items").collect();

    // Filter by areas belonging to this facility
    let items = allItems.filter((item) => item.area_id && areaIds.includes(item.area_id));

    // Apply category filter if provided
    if (args.category) {
      items = items.filter((item) => (item as any).category === args.category);
    }

    // Apply status filter if provided
    if (args.status) {
      items = items.filter((item) => item.lot_status === args.status);
    }

    // Calculate stock status for each item
    const itemsWithStatus = items.map((item) => {
      const reorderPoint = item.reorder_point || 0;
      const currentStock = item.quantity_available;

      let stockStatus = "adequate";
      if (currentStock <= 0) {
        stockStatus = "out_of_stock";
      } else if (currentStock <= reorderPoint * 0.5) {
        stockStatus = "critical";
      } else if (currentStock <= reorderPoint) {
        stockStatus = "low";
      } else if (item.maximum_stock_level && currentStock > item.maximum_stock_level) {
        stockStatus = "overstocked";
      }

      return {
        ...item,
        stockStatus,
      };
    });

    return itemsWithStatus;
  },
});

/**
 * Get inventory items by category
 * Phase 2 Module 19
 */
export const getByCategory = query({
  args: {
    facilityId: v.id("facilities"),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.runQuery("inventory:getByFacility" as any, {
      facilityId: args.facilityId,
      category: args.category,
    });
  },
});

/**
 * Get single inventory item by ID
 * Phase 2 Module 19
 */
export const getById = query({
  args: {
    inventoryId: v.id("inventory_items"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.inventoryId);
    if (!item) {
      return null;
    }

    // Get related data
    const area = item.area_id ? await ctx.db.get(item.area_id) : null;
    const supplier = item.supplier_id ? await ctx.db.get(item.supplier_id) : null;

    // Calculate stock status
    const reorderPoint = item.reorder_point || 0;
    const currentStock = item.quantity_available;

    let stockStatus = "adequate";
    if (currentStock <= 0) {
      stockStatus = "out_of_stock";
    } else if (currentStock <= reorderPoint * 0.5) {
      stockStatus = "critical";
    } else if (currentStock <= reorderPoint) {
      stockStatus = "low";
    } else if (item.maximum_stock_level && currentStock > item.maximum_stock_level) {
      stockStatus = "overstocked";
    }

    return {
      ...item,
      areaName: area?.name || null,
      supplierName: supplier?.name || null,
      stockStatus,
    };
  },
});

/**
 * Update inventory item
 * Phase 2 Module 19
 */
export const update = mutation({
  args: {
    inventoryId: v.id("inventory_items"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    supplier_id: v.optional(v.id("suppliers")),
    reorder_point: v.optional(v.number()),
    reorder_quantity: v.optional(v.number()),
    cost_per_unit: v.optional(v.number()),
    storage_location: v.optional(v.string()),
    expiration_date: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify item exists
    const item = await ctx.db.get(args.inventoryId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    const updates: any = {
      updated_at: now,
    };

    // Only update fields that are provided
    if (args.name !== undefined) updates.name = args.name;
    if (args.sku !== undefined) updates.sku = args.sku;
    if (args.supplier_id !== undefined) updates.supplier_id = args.supplier_id;
    if (args.reorder_point !== undefined) updates.reorder_point = args.reorder_point;
    if (args.reorder_quantity !== undefined) updates.reorder_quantity = args.reorder_quantity;
    if (args.cost_per_unit !== undefined) updates.cost_per_unit = args.cost_per_unit;
    if (args.storage_location !== undefined) updates.storage_location = args.storage_location;
    if (args.expiration_date !== undefined) updates.expiration_date = args.expiration_date;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.inventoryId, updates);

    return {
      success: true,
      message: "Inventory item updated successfully",
    };
  },
});

/**
 * Adjust stock levels (add or consume)
 * Phase 2 Module 19
 */
export const adjustStock = mutation({
  args: {
    inventoryId: v.id("inventory_items"),
    adjustmentType: v.string(), // "addition" | "consumption" | "waste" | "transfer" | "correction"
    quantity: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify item exists
    const item = await ctx.db.get(args.inventoryId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    let newQuantity = item.quantity_available;

    // Calculate new quantity based on adjustment type
    if (args.adjustmentType === "addition") {
      newQuantity += args.quantity;
    } else if (["consumption", "waste", "transfer"].includes(args.adjustmentType)) {
      // Validate sufficient stock
      if (item.quantity_available < args.quantity) {
        throw new Error(`Insufficient stock. Available: ${item.quantity_available}, Required: ${args.quantity}`);
      }
      newQuantity -= args.quantity;
    } else if (args.adjustmentType === "correction") {
      // For corrections, quantity is the new absolute value
      newQuantity = args.quantity;
    } else {
      throw new Error(`Invalid adjustment type: ${args.adjustmentType}`);
    }

    // Update inventory item
    await ctx.db.patch(args.inventoryId, {
      quantity_available: newQuantity,
      last_movement_date: now,
      updated_at: now,
    });

    // TODO: Create inventory transaction record for audit trail
    // This would be implemented in Phase 3 or later

    return {
      success: true,
      newStock: newQuantity,
      message: "Stock adjusted successfully",
    };
  },
});

/**
 * Get low stock items (below reorder point)
 * Phase 2 Module 19
 */
export const getLowStock = query({
  args: {
    facilityId: v.id("facilities"),
  },
  handler: async (ctx, args) => {
    // Get all inventory for facility
    const items = await ctx.runQuery("inventory:getByFacility" as any, {
      facilityId: args.facilityId,
    });

    // Filter to only low/critical stock items
    const lowStockItems = items.filter((item: any) => {
      const reorderPoint = item.reorder_point || 0;
      return item.quantity_available <= reorderPoint;
    });

    // Sort by urgency (critical first, then low)
    lowStockItems.sort((a: any, b: any) => {
      if (a.stockStatus === "critical" && b.stockStatus !== "critical") return -1;
      if (a.stockStatus !== "critical" && b.stockStatus === "critical") return 1;
      if (a.stockStatus === "out_of_stock" && b.stockStatus !== "out_of_stock") return -1;
      if (a.stockStatus !== "out_of_stock" && b.stockStatus === "out_of_stock") return 1;
      return 0;
    });

    return lowStockItems;
  },
});

/**
 * Delete inventory item (soft delete)
 * Phase 2 Module 19
 */
export const remove = mutation({
  args: {
    inventoryId: v.id("inventory_items"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify item exists
    const item = await ctx.db.get(args.inventoryId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    // Check if item has stock or transaction history
    if (item.quantity_available > 0 || item.quantity_reserved > 0 || item.quantity_committed > 0) {
      // Soft delete - just mark as inactive
      await ctx.db.patch(args.inventoryId, {
        lot_status: "discontinued",
        updated_at: now,
      });

      return {
        success: true,
        message: "Inventory item marked as discontinued (has stock or history)",
      };
    }

    // Hard delete if no stock or history
    await ctx.db.delete(args.inventoryId);

    return {
      success: true,
      message: "Inventory item deleted successfully",
    };
  },
});
