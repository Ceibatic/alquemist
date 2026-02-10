/**
 * Inventory Queries and Mutations
 * Inventory management
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

    // Enrich items with product information
    const paginatedItems = items.slice(offset, offset + limit);
    const enrichedItems = await Promise.all(
      paginatedItems.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        return {
          ...item,
          productName: product?.name || 'Producto desconocido',
          productSku: product?.sku || '',
          productCategory: product?.category || '',
        };
      })
    );

    return {
      items: enrichedItems,
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
    productId: v.optional(v.id("products")),
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

    // Filter by product if provided
    if (args.productId) {
      items = items.filter((item) => item.product_id === args.productId);
    }

    // Create area name map
    const areaMap = new Map(areas.map((a) => [a._id, a.name]));

    // Enrich with product, supplier, and area data
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.product_id);
        const supplier = item.supplier_id ? await ctx.db.get(item.supplier_id) : null;
        return {
          ...item,
          productName: product?.name,
          productSku: product?.sku,
          productCategory: product?.category,
          supplierName: supplier?.name,
          areaName: item.area_id ? areaMap.get(item.area_id) : undefined,
        };
      })
    );

    // Apply category filter if provided (category is on products table)
    let filteredItems = itemsWithProducts;
    if (args.category) {
      filteredItems = itemsWithProducts.filter((item) => item.productCategory === args.category);
    }

    // Apply status filter if provided
    if (args.status) {
      filteredItems = filteredItems.filter((item) => item.lot_status === args.status);
    }

    // Calculate stock status for each item
    const itemsWithStatus = filteredItems.map((item) => {
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
    const product = await ctx.db.get(item.product_id);
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
      productName: product?.name || null,
      productSku: product?.sku || null,
      productCategory: product?.category || null,
      areaName: area?.name || null,
      facilityId: area?.facility_id || null,
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
 *
 * @deprecated Use activities.logInventoryMovement() instead for proper audit trail.
 * This mutation is kept for backward compatibility but will be removed in a future version.
 * All inventory movements should go through activities for centralized tracking.
 */
export const adjustStock = mutation({
  args: {
    inventoryId: v.id("inventory_items"),
    adjustmentType: v.string(), // "addition" | "consumption" | "waste" | "transfer" | "correction"
    quantity: v.number(),
    reason: v.string(),
    notes: v.optional(v.string()),
    userId: v.id("users"),
    // Optional reference to related entity
    referenceType: v.optional(v.string()), // activity/production_order/transfer
    referenceId: v.optional(v.string()),
    // For transfers
    destinationAreaId: v.optional(v.id("areas")),
    // Cultivation context (US-RES.4)
    batchId: v.optional(v.id("batches")),
    zoneId: v.optional(v.id("areas")),
    cropPhase: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
    costPerUnit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Verify item exists
    const item = await ctx.db.get(args.inventoryId);
    if (!item) {
      throw new Error("Inventory item not found");
    }

    const quantityBefore = item.quantity_available;
    let newQuantity = quantityBefore;
    let quantityChange = 0;

    // Calculate new quantity based on adjustment type
    if (args.adjustmentType === "addition") {
      newQuantity += args.quantity;
      quantityChange = args.quantity;
    } else if (["consumption", "waste", "transfer"].includes(args.adjustmentType)) {
      // Validate sufficient stock
      if (item.quantity_available < args.quantity) {
        throw new Error(`Insufficient stock. Available: ${item.quantity_available}, Required: ${args.quantity}`);
      }
      newQuantity -= args.quantity;
      quantityChange = -args.quantity;
    } else if (args.adjustmentType === "correction") {
      // For corrections, quantity is the new absolute value
      quantityChange = args.quantity - quantityBefore;
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

    // Create inventory transaction record for audit trail
    await ctx.db.insert("inventory_transactions", {
      inventory_item_id: args.inventoryId,
      product_id: item.product_id,
      transaction_type: args.adjustmentType,
      quantity_change: quantityChange,
      quantity_before: quantityBefore,
      quantity_after: newQuantity,
      quantity_unit: item.quantity_unit,
      reason: args.reason,
      reference_type: args.referenceType,
      reference_id: args.referenceId,
      source_area_id: args.adjustmentType === "transfer" ? item.area_id : undefined,
      destination_area_id: args.destinationAreaId,
      batch_id: args.batchId,
      zone_id: args.zoneId,
      crop_phase: args.cropPhase,
      activity_id: args.activityId,
      cost_per_unit: args.costPerUnit,
      cost_total: args.costPerUnit ? args.quantity * args.costPerUnit : undefined,
      performed_by: args.userId,
      performed_at: now,
      notes: args.notes,
      created_at: now,
    });

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

// ============================================================================
// TRANSACTION HISTORY
// ============================================================================

/**
 * Get transaction history for an inventory item
 */
export const getTransactionHistory = query({
  args: {
    inventoryId: v.id("inventory_items"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const transactions = await ctx.db
      .query("inventory_transactions")
      .withIndex("by_inventory_item", (q) =>
        q.eq("inventory_item_id", args.inventoryId)
      )
      .order("desc")
      .take(limit);

    // Enrich with user info
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const user = await ctx.db.get(tx.performed_by);
        const userName = user
          ? user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.email
          : "Usuario desconocido";

        // Get area names if applicable
        let sourceAreaName = null;
        let destinationAreaName = null;

        if (tx.source_area_id) {
          const sourceArea = await ctx.db.get(tx.source_area_id);
          sourceAreaName = sourceArea?.name || null;
        }

        if (tx.destination_area_id) {
          const destArea = await ctx.db.get(tx.destination_area_id);
          destinationAreaName = destArea?.name || null;
        }

        // Get cultivation context names if applicable
        let batchName = null;
        let zoneName = null;

        if (tx.batch_id) {
          const batch = await ctx.db.get(tx.batch_id);
          batchName = batch?.batch_code || null;
        }

        if (tx.zone_id) {
          const zone = await ctx.db.get(tx.zone_id);
          zoneName = zone?.name || null;
        }

        return {
          ...tx,
          performedByName: userName,
          sourceAreaName,
          destinationAreaName,
          batchName,
          zoneName,
        };
      })
    );

    return enrichedTransactions;
  },
});

/**
 * Get transaction history for a product (across all inventory items)
 */
export const getProductTransactionHistory = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const transactions = await ctx.db
      .query("inventory_transactions")
      .withIndex("by_product", (q) => q.eq("product_id", args.productId))
      .order("desc")
      .take(limit);

    // Enrich with user info
    const enrichedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const user = await ctx.db.get(tx.performed_by);
        const userName = user
          ? user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.email
          : "Usuario desconocido";

        // Get inventory item info
        const inventoryItem = await ctx.db.get(tx.inventory_item_id);
        const area = inventoryItem?.area_id
          ? await ctx.db.get(inventoryItem.area_id)
          : null;

        return {
          ...tx,
          performedByName: userName,
          areaName: area?.name || null,
          batchNumber: inventoryItem?.batch_number || null,
        };
      })
    );

    return enrichedTransactions;
  },
});

/**
 * Get transaction type labels
 */
export const getTransactionTypeLabels = query({
  args: {},
  handler: async () => {
    return [
      { value: "addition", label: "Entrada" },
      { value: "consumption", label: "Consumo" },
      { value: "waste", label: "Desperdicio" },
      { value: "transfer", label: "Transferencia" },
      { value: "correction", label: "Corrección" },
      { value: "receipt", label: "Recepción" },
    ];
  },
});

/**
 * Count inventory items by product
 * Returns statistics about inventory for a specific product
 * Used in product detail page (US-PRD.4)
 */
export const countByProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("inventory_items")
      .filter((q) => q.eq(q.field("product_id"), args.productId))
      .collect();

    // Count total items
    const totalItems = items.length;

    // Count active items (quantity > 0 and not discontinued/consumed)
    const activeItems = items.filter(
      (item) =>
        item.quantity_available > 0 &&
        item.transformation_status !== "consumed" &&
        item.lot_status !== "discontinued"
    ).length;

    // Sum total quantity available
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity_available || 0),
      0
    );

    return {
      totalItems,
      activeItems,
      totalQuantity,
    };
  },
});

/**
 * Get cost breakdown by batch (COGS) - Simple version from Resource System
 * Groups inventory transactions by crop_phase and calculates totals
 * @deprecated Use getFullCostByBatch for complete COGS including labor, utilities, and depreciation
 */
export const getCostByBatch = query({
  args: {
    batchId: v.id("batches"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("inventory_transactions")
      .withIndex("by_batch_id", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Only include transactions with cost data
    const costTransactions = transactions.filter(
      (tx) => tx.cost_total != null && tx.cost_total > 0
    );

    // Enrich with product names
    const enriched = await Promise.all(
      costTransactions.map(async (tx) => {
        const product = await ctx.db.get(tx.product_id);
        return {
          _id: tx._id,
          product_name: product?.name || "Producto desconocido",
          product_sku: product?.sku || "",
          crop_phase: tx.crop_phase || "sin_fase",
          transaction_type: tx.transaction_type,
          quantity_change: Math.abs(tx.quantity_change),
          quantity_unit: tx.quantity_unit,
          cost_per_unit: tx.cost_per_unit || 0,
          cost_total: tx.cost_total || 0,
          performed_at: tx.performed_at,
        };
      })
    );

    // Group by crop_phase
    const byPhase: Record<string, {
      phase: string;
      transactions: typeof enriched;
      total: number;
    }> = {};

    for (const tx of enriched) {
      if (!byPhase[tx.crop_phase]) {
        byPhase[tx.crop_phase] = {
          phase: tx.crop_phase,
          transactions: [],
          total: 0,
        };
      }
      byPhase[tx.crop_phase].transactions.push(tx);
      byPhase[tx.crop_phase].total += tx.cost_total;
    }

    const phases = Object.values(byPhase).sort((a, b) => {
      const order = ["propagation", "vegetative", "flowering", "harvest", "post_harvest", "processing", "sin_fase"];
      return order.indexOf(a.phase) - order.indexOf(b.phase);
    });

    const grandTotal = phases.reduce((sum, p) => sum + p.total, 0);

    // Get harvest data for COGS per unit calculation
    const harvests = await ctx.db
      .query("batch_harvests")
      .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
      .collect();

    const totalYield = harvests.reduce((sum, h) => sum + h.total_weight, 0);
    const yieldUnit = harvests[0]?.weight_unit || "g";
    const cogsPerUnit = totalYield > 0 ? grandTotal / totalYield : null;

    return {
      phases,
      grandTotal,
      totalYield,
      yieldUnit,
      cogsPerUnit,
      transactionCount: enriched.length,
    };
  },
});

/**
 * Get full COGS for a batch - Complete COGS System
 * Combines material consumption (from activities) + cost_entries (labor, utilities, depreciation)
 * Returns materials (from activity material consumption), labor, utilities, and depreciation
 */
export const getFullCostByBatch = query({
  args: {
    batchId: v.id("batches"),
  },
  handler: async (ctx, args) => {
    // 1. Material costs — extract from activities linked to this batch
    // Activities track materials_consumed with quantity and product_id
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_entity", (q) =>
        q.eq("entity_type", "batch").eq("entity_id", args.batchId)
      )
      .collect();

    const enrichedMaterials: Array<{
      _id: string;
      date: number;
      type: string;
      productId: Id<"products">;
      productName: string;
      quantity: number;
      quantityUnit: string;
      costPerUnit: number | undefined;
      costTotal: number;
      cropPhase: string | undefined;
    }> = [];

    for (const activity of activities) {
      const materials = (activity.materials_consumed || []) as Array<{
        product_id?: string;
        inventory_item_id?: string;
        quantity?: number;
        consumed?: boolean;
      }>;

      for (const mat of materials) {
        if (!mat.product_id || !mat.quantity) continue;
        const productId = mat.product_id as Id<"products">;
        const product = await ctx.db.get(productId);

        // Try to get cost from inventory item if available
        let costPerUnit: number | undefined;
        let costTotal = 0;
        if (mat.inventory_item_id) {
          const item = await ctx.db.get(mat.inventory_item_id as Id<"inventory_items">);
          if (item?.cost_per_unit) {
            costPerUnit = item.cost_per_unit;
            costTotal = costPerUnit * (mat.quantity || 0);
          }
        }

        enrichedMaterials.push({
          _id: `${activity._id}-${mat.product_id}`,
          date: activity.timestamp,
          type: activity.activity_type,
          productId,
          productName: product?.name || "Desconocido",
          quantity: mat.quantity || 0,
          quantityUnit: product?.default_unit || "unidades",
          costPerUnit,
          costTotal,
          cropPhase: undefined,
        });
      }
    }

    const materialsTotal = enrichedMaterials.reduce((sum, m) => sum + m.costTotal, 0);

    // 2. Cost entries (labor, utilities, depreciation)
    const costEntries = await ctx.db
      .query("cost_entries")
      .withIndex("by_batch_id", (q) => q.eq("batch_id", args.batchId))
      .collect();

    // Group by type
    const laborEntries = costEntries.filter((e) => e.cost_type === "labor");
    const utilityEntries = costEntries.filter((e) => e.cost_type.startsWith("utility_"));
    const depreciationEntries = costEntries.filter((e) => e.cost_type === "depreciation");

    // Enrich labor entries with user info
    const enrichedLabor = await Promise.all(
      laborEntries.map(async (e) => {
        let userName = "Desconocido";
        if (e.performed_by) {
          const user = await ctx.db.get(e.performed_by);
          if (user) userName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Desconocido";
        }
        // Get activity info
        let activityType = "";
        if (e.activity_id) {
          const activity = await ctx.db.get(e.activity_id);
          if (activity) activityType = activity.activity_type;
        }
        const details = e.details as {
          role_display_name?: string;
          hourly_rate?: number;
          duration_minutes?: number;
        } | undefined;
        return {
          _id: e._id,
          date: e.created_at,
          userName,
          activityType,
          roleName: details?.role_display_name || "",
          hourlyRate: details?.hourly_rate || 0,
          durationMinutes: details?.duration_minutes || 0,
          costTotal: e.cost_total,
          cropPhase: e.crop_phase,
        };
      })
    );

    const laborTotal = laborEntries.reduce((sum, e) => sum + e.cost_total, 0);
    const utilitiesTotal = utilityEntries.reduce((sum, e) => sum + e.cost_total, 0);
    const depreciationTotal = depreciationEntries.reduce((sum, e) => sum + e.cost_total, 0);
    const grandTotal = materialsTotal + laborTotal + utilitiesTotal + depreciationTotal;

    return {
      materials: {
        entries: enrichedMaterials,
        total: Math.round(materialsTotal * 100) / 100,
      },
      labor: {
        entries: enrichedLabor,
        total: Math.round(laborTotal * 100) / 100,
      },
      utilities: {
        entries: utilityEntries.map((e) => ({
          _id: e._id,
          costType: e.cost_type,
          period: e.period,
          costTotal: e.cost_total,
          cropPhase: e.crop_phase,
          details: e.details as {
            utility_type?: string;
            consumption?: number;
            consumption_unit?: string;
            proportion?: number;
          } | undefined,
        })),
        total: Math.round(utilitiesTotal * 100) / 100,
      },
      depreciation: {
        entries: depreciationEntries.map((e) => ({
          _id: e._id,
          period: e.period,
          costTotal: e.cost_total,
          details: e.details as {
            equipment_name?: string;
            equipment_sku?: string;
            monthly_depreciation?: number;
            proportion?: number;
          } | undefined,
        })),
        total: Math.round(depreciationTotal * 100) / 100,
      },
      grandTotal: Math.round(grandTotal * 100) / 100,
      breakdown: {
        materials: materialsTotal > 0 ? Math.round((materialsTotal / grandTotal) * 100) : 0,
        labor: laborTotal > 0 ? Math.round((laborTotal / grandTotal) * 100) : 0,
        utilities: utilitiesTotal > 0 ? Math.round((utilitiesTotal / grandTotal) * 100) : 0,
        depreciation: depreciationTotal > 0 ? Math.round((depreciationTotal / grandTotal) * 100) : 0,
      },
    };
  },
});

/**
 * Get full traceability chain for an inventory item - Resource System
 * Traverses backward to origin (receipt) and forward to final product
 */
export const getFullTrace = query({
  args: {
    inventoryItemId: v.id("inventory_items"),
  },
  handler: async (ctx, args) => {
    type TraceStep = {
      _id: string;
      direction: "backward" | "current" | "forward";
      item_id: string;
      product_name: string;
      product_sku: string;
      product_category: string;
      quantity: number;
      quantity_unit: string;
      batch_number?: string;
      transformation_status?: string;
      activity_type?: string;
      timestamp: number;
    };

    const steps: TraceStep[] = [];
    const visited = new Set<string>();

    // Helper to enrich an inventory item into a trace step
    async function itemToStep(
      itemId: Id<"inventory_items">,
      direction: "backward" | "current" | "forward"
    ): Promise<TraceStep | null> {
      if (visited.has(itemId)) return null;
      visited.add(itemId);

      const item = await ctx.db.get(itemId);
      if (!item) return null;

      const product = await ctx.db.get(item.product_id);

      // Get activity info if available
      let activityType: string | undefined;
      const activityId = direction === "forward"
        ? item.created_by_activity_id
        : item.transformed_by_activity_id;
      if (activityId) {
        const activity = await ctx.db.get(activityId);
        if (activity) {
          activityType = activity.activity_type;
        }
      }

      return {
        _id: item._id,
        direction,
        item_id: item._id,
        product_name: product?.name || "Producto desconocido",
        product_sku: product?.sku || "",
        product_category: product?.category || "",
        quantity: item.quantity_available,
        quantity_unit: item.quantity_unit,
        batch_number: item.batch_number,
        transformation_status: item.transformation_status,
        activity_type: activityType,
        timestamp: item.received_date || item.created_at,
      };
    }

    // 1. Traverse backward: find items that were transformed into this one
    // Look for items where transformed_to_item_id === our item
    let currentBackId: Id<"inventory_items"> | undefined = args.inventoryItemId;
    const backwardSteps: TraceStep[] = [];
    let safetyBack = 0;

    while (currentBackId && safetyBack < 20) {
      safetyBack++;
      // Find items that transformed into currentBackId
      const sourceItems = await ctx.db
        .query("inventory_items")
        .filter((q) => q.eq(q.field("transformed_to_item_id"), currentBackId))
        .take(1);

      if (sourceItems.length === 0) break;

      const sourceItem = sourceItems[0];
      const step = await itemToStep(sourceItem._id, "backward");
      if (!step) break;
      backwardSteps.unshift(step);
      currentBackId = sourceItem._id;
    }

    steps.push(...backwardSteps);

    // 2. Add current item
    const currentStep = await itemToStep(args.inventoryItemId, "current");
    if (currentStep) {
      steps.push(currentStep);
    }

    // 3. Traverse forward: follow transformed_to_item_id chain
    let currentFwdId: Id<"inventory_items"> | undefined;
    const currentItem = await ctx.db.get(args.inventoryItemId);
    if (currentItem?.transformed_to_item_id) {
      currentFwdId = currentItem.transformed_to_item_id;
    }

    let safetyFwd = 0;
    while (currentFwdId && safetyFwd < 20) {
      safetyFwd++;
      const step = await itemToStep(currentFwdId, "forward");
      if (!step) break;
      steps.push(step);

      const fwdItem = await ctx.db.get(currentFwdId);
      currentFwdId = fwdItem?.transformed_to_item_id;
    }

    // 4. Get the receipt transaction for the earliest item (origin)
    let originReceipt = null;
    if (steps.length > 0) {
      const earliestId = steps[0].item_id as Id<"inventory_items">;
      const receipts = await ctx.db
        .query("inventory_transactions")
        .withIndex("by_inventory_item", (q) =>
          q.eq("inventory_item_id", earliestId)
        )
        .filter((q) => q.eq(q.field("transaction_type"), "receipt"))
        .take(1);

      if (receipts.length > 0) {
        const receipt = receipts[0];
        const user = await ctx.db.get(receipt.performed_by);
        originReceipt = {
          date: receipt.performed_at,
          reason: receipt.reason,
          performed_by: user
            ? user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name || user.email
            : "Desconocido",
        };
      }
    }

    return {
      steps,
      originReceipt,
      totalSteps: steps.length,
    };
  },
});
