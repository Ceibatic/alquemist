/**
 * Activity Queries and Mutations
 * Activity logging and tracking with inventory consumption support
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { generateInternalLotNumber } from "./helpers";

/**
 * List activities
 */
export const list = query({
  args: {
    companyId: v.string(),
    entity_type: v.optional(v.string()),
    entity_id: v.optional(v.string()),
    activity_type: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activitiesQuery = ctx.db.query("activities");

    // Apply filters
    if (args.entity_type) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.eq(q.field("entity_type"), args.entity_type)
      );
    }

    if (args.entity_id) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.eq(q.field("entity_id"), args.entity_id)
      );
    }

    if (args.activity_type) {
      activitiesQuery = activitiesQuery.filter((q) =>
        q.eq(q.field("activity_type"), args.activity_type)
      );
    }

    const activities = await activitiesQuery
      .order("desc")
      .take(args.limit || 50);

    // TODO: Verify company ownership through entity
    // For now, return all matching activities

    return {
      activities,
      total: activities.length,
    };
  },
});

/**
 * Log a new activity
 *
 * Supports automatic inventory consumption when consume_inventory is true.
 * materials_consumed should be an array of:
 * - { inventory_item_id, quantity } - consume from specific inventory item
 * - { product_id, quantity, facility_id } - auto-select from FIFO inventory
 */
export const log = mutation({
  args: {
    entity_type: v.string(), // batch/plant/area/recipe
    entity_id: v.string(),
    activity_type: v.string(),
    performed_by: v.id("users"),

    scheduled_activity_id: v.optional(v.id("scheduled_activities")),
    duration_minutes: v.optional(v.number()),

    area_from: v.optional(v.id("areas")),
    area_to: v.optional(v.id("areas")),

    quantity_before: v.optional(v.number()),
    quantity_after: v.optional(v.number()),

    qr_scanned: v.optional(v.string()),

    // Materials consumed - can be just metadata or trigger actual consumption
    materials_consumed: v.optional(v.array(v.any())),
    // Set to true to automatically deduct from inventory
    consume_inventory: v.optional(v.boolean()),
    // Required if consume_inventory is true and using product_id selection
    facility_id: v.optional(v.id("facilities")),

    equipment_used: v.optional(v.array(v.any())),
    quality_check_data: v.optional(v.object({})),
    environmental_data: v.optional(v.object({})),

    photos: v.optional(v.array(v.string())),
    files: v.optional(v.array(v.string())),

    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Process inventory consumption if enabled
    let processedMaterials: Array<{
      product_id?: Id<"products">;
      inventory_item_id?: Id<"inventory_items">;
      quantity: number;
      productName?: string;
      consumed: boolean;
    }> = [];

    if (args.consume_inventory && args.materials_consumed && args.materials_consumed.length > 0) {
      // Get facility areas if needed for FIFO selection
      let areaIds: Id<"areas">[] = [];
      if (args.facility_id) {
        const areas = await ctx.db
          .query("areas")
          .withIndex("by_facility", (q) => q.eq("facility_id", args.facility_id!))
          .collect();
        areaIds = areas.map((a) => a._id);
      }

      for (const material of args.materials_consumed) {
        const quantity = material.quantity as number;

        if (material.inventory_item_id) {
          // Direct inventory item consumption
          const itemId = material.inventory_item_id as Id<"inventory_items">;
          const item = await ctx.db.get(itemId);

          if (!item) {
            throw new Error(`Inventory item ${itemId} not found`);
          }

          if (item.quantity_available < quantity) {
            const product = await ctx.db.get(item.product_id);
            throw new Error(
              `Insufficient stock for ${product?.name || "product"}. Available: ${item.quantity_available}, Required: ${quantity}`
            );
          }

          // Deduct from inventory
          await ctx.db.patch(itemId, {
            quantity_available: item.quantity_available - quantity,
            last_movement_date: now,
            updated_at: now,
          });

          const product = await ctx.db.get(item.product_id);
          processedMaterials.push({
            product_id: item.product_id,
            inventory_item_id: itemId,
            quantity,
            productName: product?.name,
            consumed: true,
          });
        } else if (material.product_id) {
          // FIFO selection from product
          const productId = material.product_id as Id<"products">;
          const product = await ctx.db.get(productId);

          if (!product) {
            throw new Error(`Product ${productId} not found`);
          }

          // Get available inventory for this product
          const allInventory = await ctx.db.query("inventory_items").collect();
          let inventoryItems = allInventory
            .filter(
              (item) =>
                item.product_id === productId &&
                item.lot_status === "available" &&
                item.quantity_available > 0
            )
            .sort((a, b) => (a.received_date || 0) - (b.received_date || 0)); // FIFO

          // Filter by facility areas if specified
          if (areaIds.length > 0) {
            inventoryItems = inventoryItems.filter(
              (item) => item.area_id && areaIds.includes(item.area_id)
            );
          }

          let remainingToConsume = quantity;

          for (const item of inventoryItems) {
            if (remainingToConsume <= 0) break;

            const consumeFromThis = Math.min(item.quantity_available, remainingToConsume);

            await ctx.db.patch(item._id, {
              quantity_available: item.quantity_available - consumeFromThis,
              last_movement_date: now,
              updated_at: now,
            });

            processedMaterials.push({
              product_id: productId,
              inventory_item_id: item._id,
              quantity: consumeFromThis,
              productName: product.name,
              consumed: true,
            });

            remainingToConsume -= consumeFromThis;
          }

          if (remainingToConsume > 0) {
            throw new Error(
              `Insufficient stock for ${product.name}. Required: ${quantity}, Available: ${quantity - remainingToConsume}`
            );
          }
        } else {
          // Just metadata, no consumption
          processedMaterials.push({
            ...material,
            consumed: false,
          });
        }
      }
    } else if (args.materials_consumed) {
      // No consumption, just store metadata
      processedMaterials = args.materials_consumed.map((m: any) => ({
        ...m,
        consumed: false,
      }));
    }

    const activityId = await ctx.db.insert("activities", {
      entity_type: args.entity_type,
      entity_id: args.entity_id,
      activity_type: args.activity_type,
      scheduled_activity_id: args.scheduled_activity_id,
      performed_by: args.performed_by,

      timestamp: now,
      duration_minutes: args.duration_minutes,

      area_from: args.area_from,
      area_to: args.area_to,

      quantity_before: args.quantity_before,
      quantity_after: args.quantity_after,

      qr_scanned: args.qr_scanned,
      scan_timestamp: args.qr_scanned ? now : undefined,

      materials_consumed: processedMaterials,
      equipment_used: args.equipment_used || [],
      quality_check_data: args.quality_check_data,
      environmental_data: args.environmental_data,

      photos: args.photos || [],
      files: args.files || [],
      media_metadata: undefined,

      ai_assistance_data: undefined,
      activity_metadata: {}, // Note: consume_inventory flag is in processedMaterials.consumed field

      notes: args.notes,
      created_at: now,
    });

    return activityId;
  },
});

/**
 * List activities by batch
 */
export const listByBatch = query({
  args: {
    batchId: v.id("batches"),
    activity_type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activitiesQuery = ctx.db
      .query("activities")
      .withIndex("by_entity", (q) =>
        q.eq("entity_type", "batch").eq("entity_id", args.batchId)
      );

    const activities = await activitiesQuery.order("desc").take(args.limit || 100);

    // Filter by activity_type if specified
    const filtered = args.activity_type
      ? activities.filter((a) => a.activity_type === args.activity_type)
      : activities;

    // Enrich with user info
    const enriched = await Promise.all(
      filtered.map(async (activity) => {
        const user = await ctx.db.get(activity.performed_by);
        return {
          ...activity,
          performedByName: user
            ? `${user.first_name} ${user.last_name}`
            : "Unknown",
        };
      })
    );

    return enriched;
  },
});

/**
 * List activities by production order (all batches)
 */
export const listByOrder = query({
  args: {
    orderId: v.id("production_orders"),
    activity_type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all batches for this order
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_production_order", (q) => q.eq("production_order_id", args.orderId))
      .collect();

    const batchIds = batches.map((b) => b._id);

    // Get activities for all batches
    const allActivities = await ctx.db.query("activities").collect();

    let activities = allActivities
      .filter(
        (a) =>
          a.entity_type === "batch" &&
          batchIds.includes(a.entity_id as Id<"batches">)
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    // Filter by activity_type if specified
    if (args.activity_type) {
      activities = activities.filter((a) => a.activity_type === args.activity_type);
    }

    // Apply limit
    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    // Enrich with user and batch info
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.performed_by);
        const batch = batches.find((b) => b._id === activity.entity_id);
        return {
          ...activity,
          performedByName: user
            ? `${user.first_name} ${user.last_name}`
            : "Unknown",
          batchCode: batch?.batch_code || "Unknown",
        };
      })
    );

    return enriched;
  },
});

/**
 * Get activity statistics for a batch or order
 */
export const getStats = query({
  args: {
    entity_type: v.string(), // 'batch' | 'order'
    entity_id: v.string(),
  },
  handler: async (ctx, args) => {
    let activities: any[] = [];

    if (args.entity_type === "batch") {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_entity", (q) =>
          q.eq("entity_type", "batch").eq("entity_id", args.entity_id)
        )
        .collect();
    } else if (args.entity_type === "order") {
      const orderId = args.entity_id as Id<"production_orders">;
      const batches = await ctx.db
        .query("batches")
        .withIndex("by_production_order", (q) => q.eq("production_order_id", orderId))
        .collect();

      const batchIds = batches.map((b) => b._id);
      const allActivities = await ctx.db.query("activities").collect();
      activities = allActivities.filter(
        (a) =>
          a.entity_type === "batch" &&
          batchIds.includes(a.entity_id as Id<"batches">)
      );
    }

    // Calculate statistics
    const byType: Record<string, number> = {};
    let totalDuration = 0;
    let totalWithDuration = 0;

    for (const activity of activities) {
      byType[activity.activity_type] = (byType[activity.activity_type] || 0) + 1;
      if (activity.duration_minutes) {
        totalDuration += activity.duration_minutes;
        totalWithDuration++;
      }
    }

    // Calculate quantity changes
    const movements = activities.filter(
      (a) => a.area_from || a.area_to
    ).length;

    const lossRecords = activities.filter(
      (a) => a.activity_type === "loss_record"
    );
    const totalLoss = lossRecords.reduce(
      (sum, a) => sum + ((a.quantity_before || 0) - (a.quantity_after || 0)),
      0
    );

    return {
      totalActivities: activities.length,
      byType,
      averageDuration: totalWithDuration > 0 ? totalDuration / totalWithDuration : 0,
      totalDurationMinutes: totalDuration,
      movements,
      totalLoss,
      firstActivity: activities.length > 0
        ? Math.min(...activities.map((a) => a.timestamp))
        : null,
      lastActivity: activities.length > 0
        ? Math.max(...activities.map((a) => a.timestamp))
        : null,
    };
  },
});

/**
 * Get scheduled activities for an entity
 */
export const getScheduledActivities = query({
  args: {
    entity_type: v.string(),
    entity_id: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("scheduled_activities")
      .withIndex("by_entity", (q) =>
        q.eq("entity_type", args.entity_type).eq("entity_id", args.entity_id)
      );

    const activities = await query.collect();

    // Filter by status if specified
    const filtered = args.status
      ? activities.filter((a) => a.status === args.status)
      : activities;

    return filtered.sort((a, b) => a.scheduled_date - b.scheduled_date);
  },
});

/**
 * Log an inventory movement
 *
 * This is the CENTRAL mutation for ALL inventory movements.
 * All inventory changes must go through this function for proper audit trail.
 *
 * Movement types:
 * - receipt: New inventory coming in (creates new inventory_item)
 * - consumption: Using inventory for production
 * - correction: Adjusting stock count (physical count differs from system)
 * - waste: Loss due to spoilage, damage, etc.
 * - transfer: Moving inventory between areas
 * - return: Returning inventory to supplier
 */
export const logInventoryMovement = mutation({
  args: {
    // Movement type
    movement_type: v.union(
      v.literal("receipt"),
      v.literal("consumption"),
      v.literal("correction"),
      v.literal("waste"),
      v.literal("transfer"),
      v.literal("return"),
      v.literal("transformation") // For phase transitions and harvests
    ),

    // Product identification
    product_id: v.id("products"),
    // For existing item operations (consumption, correction, waste, transfer, return)
    inventory_item_id: v.optional(v.id("inventory_items")),

    // Quantity
    quantity: v.number(),
    quantity_unit: v.string(),
    // For correction: the new absolute quantity (not delta)
    new_quantity: v.optional(v.number()),

    // Location
    area_id: v.id("areas"),
    facility_id: v.id("facilities"),
    // For transfers
    destination_area_id: v.optional(v.id("areas")),

    // Supplier (for receipts)
    supplier_id: v.optional(v.id("suppliers")),

    // Batch info (for receipts)
    batch_number: v.optional(v.string()),
    supplier_lot_number: v.optional(v.string()),

    // Dates (for receipts)
    received_date: v.optional(v.number()),
    manufacturing_date: v.optional(v.number()),
    expiration_date: v.optional(v.number()),

    // Financial (for receipts)
    purchase_price: v.optional(v.number()),
    cost_per_unit: v.optional(v.number()),

    // Context
    reason: v.string(),
    notes: v.optional(v.string()),

    // For consumption linked to production
    entity_type: v.optional(v.string()), // batch/area/plant
    entity_id: v.optional(v.string()),

    // User performing the action
    performed_by: v.id("users"),

    // Lot selection mode (for consumption)
    lot_selection_mode: v.optional(v.union(
      v.literal("fifo"),
      v.literal("specific")
    )),

    // For transformations (phase transitions, harvests)
    transformation_type: v.optional(v.union(
      v.literal("phase_transition"),
      v.literal("harvest"),
      v.literal("propagation")
    )),
    target_product_id: v.optional(v.id("products")),
    target_quantity: v.optional(v.number()),
    target_quantity_unit: v.optional(v.string()),
    loss_quantity: v.optional(v.number()),
    loss_reason: v.optional(v.string()),
    // For linking to batch (if plant-related transformation)
    source_batch_id: v.optional(v.id("batches")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get product info
    const product = await ctx.db.get(args.product_id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    let inventoryItem = args.inventory_item_id
      ? await ctx.db.get(args.inventory_item_id)
      : null;

    // Variables for activity creation
    let activityType = "";
    let entityType = args.entity_type || "inventory";
    let entityId = args.entity_id || "";
    let quantityBefore: number | undefined;
    let quantityAfter: number | undefined;
    let createdInventoryItemId: Id<"inventory_items"> | undefined;

    switch (args.movement_type) {
      case "receipt": {
        // Create new inventory item
        activityType = "inventory_receipt";

        // Auto-generate internal batch number if not provided
        const internalBatchNumber = args.batch_number ||
          await generateInternalLotNumber(ctx, product.category);

        // First create the activity (without inventory link)
        const activityId = await ctx.db.insert("activities", {
          entity_type: "inventory",
          entity_id: "", // Will be updated after inventory creation
          activity_type: activityType,
          performed_by: args.performed_by,
          timestamp: now,
          materials_consumed: [],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            movement_type: args.movement_type,
            product_id: args.product_id,
            product_name: product.name,
            product_sku: product.sku,
            quantity: args.quantity,
            quantity_unit: args.quantity_unit,
            batch_number: internalBatchNumber,
            supplier_lot_number: args.supplier_lot_number,
            supplier_id: args.supplier_id,
            purchase_price: args.purchase_price,
            reason: args.reason,
          },
          notes: args.notes,
          created_at: now,
        });

        // Create the inventory item with activity reference
        createdInventoryItemId = await ctx.db.insert("inventory_items", {
          product_id: args.product_id,
          area_id: args.area_id,
          supplier_id: args.supplier_id,
          quantity_available: args.quantity,
          quantity_reserved: 0,
          quantity_committed: 0,
          quantity_unit: args.quantity_unit,
          batch_number: internalBatchNumber,
          supplier_lot_number: args.supplier_lot_number,
          serial_numbers: [],
          received_date: args.received_date || now,
          manufacturing_date: args.manufacturing_date,
          expiration_date: args.expiration_date,
          purchase_price: args.purchase_price,
          cost_per_unit: args.cost_per_unit,
          certificates: [],
          source_type: "purchase",
          lot_status: "available",
          last_movement_date: now,
          notes: args.notes,
          created_at: now,
          updated_at: now,
          created_by_activity_id: activityId,
        });

        // Update activity with entity_id
        await ctx.db.patch(activityId, {
          entity_id: createdInventoryItemId,
        });

        quantityBefore = 0;
        quantityAfter = args.quantity;
        entityId = createdInventoryItemId;

        return {
          activityId,
          inventoryItemId: createdInventoryItemId,
          movement_type: args.movement_type,
          quantity_change: args.quantity,
        };
      }

      case "consumption":
      case "waste":
      case "return": {
        activityType = `inventory_${args.movement_type}`;

        if (!inventoryItem && !args.inventory_item_id) {
          // FIFO selection if no specific item provided
          if (args.lot_selection_mode !== "specific") {
            // Get areas in the facility
            const areas = await ctx.db
              .query("areas")
              .withIndex("by_facility", (q) => q.eq("facility_id", args.facility_id))
              .collect();
            const areaIds = areas.map((a) => a._id);

            // Get available inventory for this product, FIFO order
            const allInventory = await ctx.db.query("inventory_items").collect();
            const availableItems = allInventory
              .filter(
                (item) =>
                  item.product_id === args.product_id &&
                  item.lot_status === "available" &&
                  item.quantity_available > 0 &&
                  areaIds.includes(item.area_id)
              )
              .sort((a, b) => (a.received_date || 0) - (b.received_date || 0));

            if (availableItems.length === 0) {
              throw new Error(`No hay inventario disponible de ${product.name}`);
            }

            // Consume from FIFO with quantity tracking
            let remainingToConsume = args.quantity;
            const consumedItems: Array<{
              inventoryItemId: string;
              quantityConsumed: number;
              quantityBefore: number;
              quantityAfter: number;
              batchNumber?: string;
            }> = [];

            for (const item of availableItems) {
              if (remainingToConsume <= 0) break;

              const quantityBefore = item.quantity_available;
              const consumeFromThis = Math.min(quantityBefore, remainingToConsume);
              const quantityAfter = quantityBefore - consumeFromThis;

              await ctx.db.patch(item._id, {
                quantity_available: quantityAfter,
                last_movement_date: now,
                updated_at: now,
              });

              consumedItems.push({
                inventoryItemId: item._id,
                quantityConsumed: consumeFromThis,
                quantityBefore,
                quantityAfter,
                batchNumber: item.batch_number,
              });

              remainingToConsume -= consumeFromThis;
            }

            if (remainingToConsume > 0) {
              throw new Error(
                `Stock insuficiente de ${product.name}. Requerido: ${args.quantity}, Disponible: ${args.quantity - remainingToConsume}`
              );
            }

            // Calculate totals for activity-level tracking
            const totalQuantityBefore = consumedItems.reduce((sum, ci) => sum + ci.quantityBefore, 0);
            const totalQuantityAfter = consumedItems.reduce((sum, ci) => sum + ci.quantityAfter, 0);

            // Create activity with all consumed items including quantity tracking
            const activityId = await ctx.db.insert("activities", {
              entity_type: entityType,
              entity_id: entityId || consumedItems[0].inventoryItemId,
              activity_type: activityType,
              performed_by: args.performed_by,
              timestamp: now,
              quantity_before: totalQuantityBefore,
              quantity_after: totalQuantityAfter,
              materials_consumed: consumedItems.map((ci) => ({
                inventory_item_id: ci.inventoryItemId,
                quantity: ci.quantityConsumed,
                quantity_unit: args.quantity_unit,
                quantity_before: ci.quantityBefore,
                quantity_after: ci.quantityAfter,
                product_id: args.product_id,
                product_name: product.name,
                batch_number: ci.batchNumber,
                consumed: true,
              })),
              equipment_used: [],
              photos: [],
              files: [],
              activity_metadata: {
                movement_type: args.movement_type,
                product_id: args.product_id,
                product_name: product.name,
                total_quantity: args.quantity,
                quantity_unit: args.quantity_unit,
                reason: args.reason,
                lot_selection_mode: "fifo",
                lots_consumed: consumedItems.map((ci) => ({
                  inventory_item_id: ci.inventoryItemId,
                  batch_number: ci.batchNumber,
                  quantity_from_lot: ci.quantityConsumed,
                  quantity_before: ci.quantityBefore,
                  quantity_after: ci.quantityAfter,
                })),
              },
              notes: args.notes,
              created_at: now,
            });

            return {
              activityId,
              inventoryItemId: null,
              movement_type: args.movement_type,
              quantity_change: -args.quantity,
              consumedItems,
            };
          }
        }

        // Specific item consumption
        if (!inventoryItem) {
          throw new Error("Item de inventario no encontrado");
        }

        if (inventoryItem.quantity_available < args.quantity) {
          throw new Error(
            `Stock insuficiente. Disponible: ${inventoryItem.quantity_available}, Requerido: ${args.quantity}`
          );
        }

        quantityBefore = inventoryItem.quantity_available;
        quantityAfter = inventoryItem.quantity_available - args.quantity;

        await ctx.db.patch(inventoryItem._id, {
          quantity_available: quantityAfter,
          last_movement_date: now,
          updated_at: now,
        });

        entityId = entityId || inventoryItem._id;

        const activityId = await ctx.db.insert("activities", {
          entity_type: entityType,
          entity_id: entityId,
          activity_type: activityType,
          performed_by: args.performed_by,
          timestamp: now,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          materials_consumed: [
            {
              inventory_item_id: inventoryItem._id,
              quantity: args.quantity,
              quantity_unit: args.quantity_unit,
              quantity_before: quantityBefore,
              quantity_after: quantityAfter,
              product_id: args.product_id,
              product_name: product.name,
              batch_number: inventoryItem.batch_number,
              consumed: true,
            },
          ],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            movement_type: args.movement_type,
            product_id: args.product_id,
            product_name: product.name,
            quantity_unit: args.quantity_unit,
            reason: args.reason,
            lot_selection_mode: "specific",
          },
          notes: args.notes,
          created_at: now,
        });

        return {
          activityId,
          inventoryItemId: inventoryItem._id,
          movement_type: args.movement_type,
          quantity_change: -args.quantity,
        };
      }

      case "correction": {
        activityType = "inventory_correction";

        if (!inventoryItem) {
          throw new Error("Item de inventario no encontrado para corrección");
        }

        const newQuantity = args.new_quantity ?? args.quantity;
        quantityBefore = inventoryItem.quantity_available;
        quantityAfter = newQuantity;

        const quantityChange = newQuantity - quantityBefore;

        await ctx.db.patch(inventoryItem._id, {
          quantity_available: newQuantity,
          last_movement_date: now,
          updated_at: now,
        });

        entityId = inventoryItem._id;

        const activityId = await ctx.db.insert("activities", {
          entity_type: "inventory",
          entity_id: entityId,
          activity_type: activityType,
          performed_by: args.performed_by,
          timestamp: now,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          materials_consumed: [],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            movement_type: args.movement_type,
            product_id: args.product_id,
            product_name: product.name,
            quantity_unit: args.quantity_unit,
            quantity_change: quantityChange,
            reason: args.reason,
          },
          notes: args.notes,
          created_at: now,
        });

        return {
          activityId,
          inventoryItemId: inventoryItem._id,
          movement_type: args.movement_type,
          quantity_change: quantityChange,
        };
      }

      case "transfer": {
        activityType = "inventory_transfer";

        if (!inventoryItem) {
          throw new Error("Item de inventario no encontrado para transferencia");
        }

        if (!args.destination_area_id) {
          throw new Error("Área de destino requerida para transferencia");
        }

        if (inventoryItem.quantity_available < args.quantity) {
          throw new Error(
            `Stock insuficiente para transferir. Disponible: ${inventoryItem.quantity_available}`
          );
        }

        quantityBefore = inventoryItem.quantity_available;
        quantityAfter = inventoryItem.quantity_available - args.quantity;

        // Reduce from source
        await ctx.db.patch(inventoryItem._id, {
          quantity_available: quantityAfter,
          last_movement_date: now,
          updated_at: now,
        });

        // Check if destination already has same product/batch
        const existingInDestination = await ctx.db
          .query("inventory_items")
          .filter((q) =>
            q.and(
              q.eq(q.field("product_id"), args.product_id),
              q.eq(q.field("area_id"), args.destination_area_id!),
              q.eq(q.field("batch_number"), inventoryItem.batch_number),
              q.eq(q.field("lot_status"), "available")
            )
          )
          .first();

        let destinationItemId: Id<"inventory_items">;

        if (existingInDestination) {
          // Add to existing
          await ctx.db.patch(existingInDestination._id, {
            quantity_available: existingInDestination.quantity_available + args.quantity,
            last_movement_date: now,
            updated_at: now,
          });
          destinationItemId = existingInDestination._id;
        } else {
          // Create new item in destination
          destinationItemId = await ctx.db.insert("inventory_items", {
            product_id: args.product_id,
            area_id: args.destination_area_id,
            supplier_id: inventoryItem.supplier_id,
            quantity_available: args.quantity,
            quantity_reserved: 0,
            quantity_committed: 0,
            quantity_unit: inventoryItem.quantity_unit,
            batch_number: inventoryItem.batch_number,
            supplier_lot_number: inventoryItem.supplier_lot_number,
            serial_numbers: [],
            received_date: inventoryItem.received_date,
            manufacturing_date: inventoryItem.manufacturing_date,
            expiration_date: inventoryItem.expiration_date,
            purchase_price: inventoryItem.purchase_price,
            cost_per_unit: inventoryItem.cost_per_unit,
            certificates: [],
            source_type: "transfer",
            lot_status: "available",
            last_movement_date: now,
            notes: `Transferido desde otra área`,
            created_at: now,
            updated_at: now,
          });
        }

        entityId = inventoryItem._id;

        const activityId = await ctx.db.insert("activities", {
          entity_type: "inventory",
          entity_id: entityId,
          activity_type: activityType,
          performed_by: args.performed_by,
          timestamp: now,
          area_from: args.area_id,
          area_to: args.destination_area_id,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          materials_consumed: [],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            movement_type: args.movement_type,
            product_id: args.product_id,
            product_name: product.name,
            quantity: args.quantity,
            quantity_unit: args.quantity_unit,
            source_inventory_id: inventoryItem._id,
            destination_inventory_id: destinationItemId,
            reason: args.reason,
          },
          notes: args.notes,
          created_at: now,
        });

        return {
          activityId,
          inventoryItemId: inventoryItem._id,
          destinationItemId,
          movement_type: args.movement_type,
          quantity_change: -args.quantity,
        };
      }

      case "transformation": {
        activityType = `inventory_transformation`;

        // Validate required args for transformation
        if (!inventoryItem) {
          throw new Error("Item de inventario no encontrado para transformación");
        }
        if (!args.target_product_id) {
          throw new Error("Producto destino requerido para transformación");
        }
        if (args.target_quantity === undefined || args.target_quantity === null) {
          throw new Error("Cantidad destino requerida para transformación");
        }
        if (!args.target_quantity_unit) {
          throw new Error("Unidad de cantidad destino requerida para transformación");
        }

        // Get target product info
        const targetProduct = await ctx.db.get(args.target_product_id);
        if (!targetProduct) {
          throw new Error("Producto destino no encontrado");
        }

        // Check source has enough quantity
        if (inventoryItem.quantity_available < args.quantity) {
          throw new Error(
            `Stock insuficiente para transformar. Disponible: ${inventoryItem.quantity_available}, Requerido: ${args.quantity}`
          );
        }

        quantityBefore = inventoryItem.quantity_available;
        quantityAfter = 0; // Source item will be fully consumed in transformation

        // Determine transformation status based on type
        const transformationStatus = args.transformation_type === "harvest"
          ? "harvested" as const
          : "transformed" as const;

        // Create the activity first
        const activityId = await ctx.db.insert("activities", {
          entity_type: args.entity_type || "inventory",
          entity_id: args.entity_id || inventoryItem._id,
          activity_type: activityType,
          performed_by: args.performed_by,
          timestamp: now,
          quantity_before: quantityBefore,
          quantity_after: quantityAfter,
          materials_consumed: [
            {
              inventory_item_id: inventoryItem._id,
              product_id: args.product_id,
              product_name: product.name,
              quantity: args.quantity,
              quantity_unit: args.quantity_unit,
              quantity_before: quantityBefore,
              quantity_after: 0,
              batch_number: inventoryItem.batch_number,
            },
          ],
          equipment_used: [],
          photos: [],
          files: [],
          activity_metadata: {
            movement_type: args.movement_type,
            transformation_type: args.transformation_type,
            source_product_id: args.product_id,
            source_product_name: product.name,
            target_product_id: args.target_product_id,
            target_product_name: targetProduct.name,
            source_quantity: args.quantity,
            source_quantity_unit: args.quantity_unit,
            target_quantity: args.target_quantity,
            target_quantity_unit: args.target_quantity_unit,
            loss_quantity: args.loss_quantity,
            loss_reason: args.loss_reason,
            reason: args.reason,
          },
          notes: args.notes,
          created_at: now,
        });

        // Generate internal batch number for transformed product based on TARGET category
        // Internal products (transformations) don't have supplier_id or supplier_lot_number
        const transformedBatchNumber = await generateInternalLotNumber(ctx, targetProduct.category);

        // Create new inventory item for the transformed product
        // Note: supplier_id and supplier_lot_number are NOT copied - this is an internal product
        const transformedItemId = await ctx.db.insert("inventory_items", {
          product_id: args.target_product_id,
          area_id: args.area_id,
          // supplier_id: undefined - internal products have no external supplier
          // supplier_lot_number: undefined - no supplier lot for internal products
          quantity_available: args.target_quantity,
          quantity_reserved: 0,
          quantity_committed: 0,
          quantity_unit: args.target_quantity_unit,
          batch_number: transformedBatchNumber, // New internal lot based on target category
          // Traceability: keep reference to source batch number in notes
          serial_numbers: [],
          received_date: now,
          manufacturing_date: now,
          expiration_date: inventoryItem.expiration_date, // Inherit expiration if relevant
          // For internal products, cost is inherited from source for now
          // This could be calculated differently for production costing
          purchase_price: inventoryItem.purchase_price,
          cost_per_unit: inventoryItem.cost_per_unit,
          certificates: [],
          source_type: "production",
          source_batch_id: args.source_batch_id || inventoryItem.source_batch_id,
          lot_status: "available",
          last_movement_date: now,
          notes: `Transformado desde ${product.name} (lote: ${inventoryItem.batch_number || 'N/A'}) via ${args.transformation_type || 'transformation'}`,
          created_at: now,
          updated_at: now,
          created_by_activity_id: activityId,
          transformation_status: "active",
        });

        // Mark source item as transformed
        await ctx.db.patch(inventoryItem._id, {
          quantity_available: 0,
          last_movement_date: now,
          updated_at: now,
          transformation_status: transformationStatus,
          transformed_to_item_id: transformedItemId,
          transformed_by_activity_id: activityId,
        });

        // Update activity with materials_produced
        await ctx.db.patch(activityId, {
          materials_produced: [
            {
              product_id: args.target_product_id,
              inventory_item_id: transformedItemId,
              quantity: args.target_quantity,
              quantity_unit: args.target_quantity_unit,
            },
          ],
        });

        return {
          activityId,
          sourceInventoryItemId: inventoryItem._id,
          transformedInventoryItemId: transformedItemId,
          movement_type: args.movement_type,
          transformation_type: args.transformation_type,
          source_quantity_consumed: args.quantity,
          target_quantity_produced: args.target_quantity,
          loss_quantity: args.loss_quantity,
        };
      }

      default:
        throw new Error(`Tipo de movimiento no soportado: ${args.movement_type}`);
    }
  },
});

/**
 * Get inventory movement history for an item or product
 */
export const getInventoryMovements = query({
  args: {
    inventoryItemId: v.optional(v.id("inventory_items")),
    productId: v.optional(v.id("products")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all activities that are inventory-related
    const inventoryActivityTypes = [
      "inventory_receipt",
      "inventory_consumption",
      "inventory_correction",
      "inventory_waste",
      "inventory_transfer",
      "inventory_return",
      "inventory_transformation",
    ];

    let activities = await ctx.db.query("activities").order("desc").collect();

    // Filter by activity type
    activities = activities.filter((a) =>
      inventoryActivityTypes.includes(a.activity_type)
    );

    // Filter by inventory item if specified
    if (args.inventoryItemId) {
      activities = activities.filter((a) => {
        // Check entity_id
        if (a.entity_id === args.inventoryItemId) return true;
        // Check materials_consumed
        const materials = a.materials_consumed as Array<{ inventory_item_id?: string }>;
        return materials.some((m) => m.inventory_item_id === args.inventoryItemId);
      });
    }

    // Filter by product if specified
    if (args.productId) {
      activities = activities.filter((a) => {
        const metadata = a.activity_metadata as { product_id?: string };
        if (metadata.product_id === args.productId) return true;
        const materials = a.materials_consumed as Array<{ product_id?: string }>;
        return materials.some((m) => m.product_id === args.productId);
      });
    }

    // Apply limit
    if (args.limit) {
      activities = activities.slice(0, args.limit);
    }

    // Enrich with user info
    const enriched = await Promise.all(
      activities.map(async (activity) => {
        const user = await ctx.db.get(activity.performed_by);
        return {
          ...activity,
          performedByName: user
            ? `${user.first_name} ${user.last_name}`
            : "Desconocido",
        };
      })
    );

    return enriched;
  },
});

/**
 * Log a phase transition for a batch with inventory synchronization
 * This mutation:
 * 1. Updates the batch's growth phase
 * 2. Transforms the associated inventory item to a new product category
 * 3. Records loss/mortality if any
 */
export const logPhaseTransitionWithInventory = mutation({
  args: {
    batchId: v.id("batches"),
    newPhase: v.string(), // seedling, vegetative, flowering, etc.

    // Inventory transformation
    sourceInventoryItemId: v.optional(v.id("inventory_items")),
    targetProductId: v.id("products"), // Product with the new category
    targetQuantity: v.number(), // Quantity after transition (may be less due to loss)
    targetQuantityUnit: v.string(),

    // Loss tracking
    lossQuantity: v.optional(v.number()),
    lossReason: v.optional(v.string()),

    // Location
    areaId: v.id("areas"),
    facilityId: v.id("facilities"),

    // Context
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get batch
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch no encontrado");
    }

    if (batch.status !== "active") {
      throw new Error("Solo batches activos pueden cambiar de fase");
    }

    const previousPhase = batch.current_phase;

    // Get target product
    const targetProduct = await ctx.db.get(args.targetProductId);
    if (!targetProduct) {
      throw new Error("Producto destino no encontrado");
    }

    // Get source inventory item
    let sourceInventoryItem = args.sourceInventoryItemId
      ? await ctx.db.get(args.sourceInventoryItemId)
      : null;

    // If no source inventory provided, try to find one linked to this batch
    if (!sourceInventoryItem) {
      const linkedInventory = await ctx.db
        .query("inventory_items")
        .filter((q) =>
          q.and(
            q.eq(q.field("source_batch_id"), args.batchId),
            q.eq(q.field("lot_status"), "available"),
            q.or(
              q.eq(q.field("transformation_status"), undefined),
              q.eq(q.field("transformation_status"), "active")
            )
          )
        )
        .first();

      sourceInventoryItem = linkedInventory;
    }

    // Get source product if we have source inventory
    let sourceProduct = null;
    if (sourceInventoryItem) {
      sourceProduct = await ctx.db.get(sourceInventoryItem.product_id);
    }

    // Update batch phase
    await ctx.db.patch(args.batchId, {
      current_phase: args.newPhase,
      current_quantity: args.targetQuantity,
      lost_quantity: (batch.lost_quantity || 0) + (args.lossQuantity || 0),
      mortality_rate: batch.initial_quantity > 0
        ? ((batch.lost_quantity || 0) + (args.lossQuantity || 0)) / batch.initial_quantity * 100
        : 0,
      notes: args.notes
        ? `${batch.notes || ""}\nPhase changed to ${args.newPhase}: ${args.notes}`
        : batch.notes,
      updated_at: now,
    });

    // Update individual plants if tracking enabled
    if (batch.enable_individual_tracking) {
      const plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
        .collect();

      for (const plant of plants) {
        await ctx.db.patch(plant._id, {
          plant_stage: args.newPhase,
          updated_at: now,
        });
      }
    }

    // Handle inventory transformation if we have source inventory
    let transformedInventoryItemId: Id<"inventory_items"> | undefined;
    let inventoryActivityId: Id<"activities"> | undefined;

    if (sourceInventoryItem) {
      const sourceQuantity = sourceInventoryItem.quantity_available;
      const quantityBefore = sourceQuantity;

      // Create activity for the transformation
      inventoryActivityId = await ctx.db.insert("activities", {
        entity_type: "batch",
        entity_id: args.batchId,
        activity_type: "inventory_transformation",
        performed_by: args.performedBy,
        timestamp: now,
        quantity_before: quantityBefore,
        quantity_after: 0,
        materials_consumed: [
          {
            inventory_item_id: sourceInventoryItem._id,
            product_id: sourceInventoryItem.product_id,
            product_name: sourceProduct?.name || "Desconocido",
            quantity: sourceQuantity,
            quantity_unit: sourceInventoryItem.quantity_unit,
            quantity_before: quantityBefore,
            quantity_after: 0,
            batch_number: sourceInventoryItem.batch_number,
          },
        ],
        equipment_used: [],
        photos: [],
        files: [],
        activity_metadata: {
          transformation_type: "phase_transition",
          previous_phase: previousPhase,
          new_phase: args.newPhase,
          source_product_id: sourceInventoryItem.product_id,
          source_product_name: sourceProduct?.name,
          target_product_id: args.targetProductId,
          target_product_name: targetProduct.name,
          source_quantity: sourceQuantity,
          target_quantity: args.targetQuantity,
          loss_quantity: args.lossQuantity,
          loss_reason: args.lossReason,
        },
        notes: args.notes || `Transición de fase: ${previousPhase} → ${args.newPhase}`,
        created_at: now,
      });

      // Generate internal batch number for transformed product based on TARGET category
      // Internal products (phase transitions) don't have supplier_id or supplier_lot_number
      const transformedBatchNumber = await generateInternalLotNumber(ctx, targetProduct.category);

      // Create new inventory item for the transformed product
      // Note: supplier_id and supplier_lot_number are NOT copied - this is an internal transformation
      transformedInventoryItemId = await ctx.db.insert("inventory_items", {
        product_id: args.targetProductId,
        area_id: args.areaId,
        // supplier_id: undefined - internal products have no external supplier
        // supplier_lot_number: undefined - no supplier lot for internal products
        quantity_available: args.targetQuantity,
        quantity_reserved: 0,
        quantity_committed: 0,
        quantity_unit: args.targetQuantityUnit,
        batch_number: transformedBatchNumber, // New internal lot based on target category
        serial_numbers: [],
        received_date: now,
        manufacturing_date: now,
        expiration_date: sourceInventoryItem.expiration_date,
        purchase_price: sourceInventoryItem.purchase_price,
        cost_per_unit: sourceInventoryItem.cost_per_unit,
        certificates: [],
        source_type: "production",
        source_batch_id: args.batchId,
        lot_status: "available",
        last_movement_date: now,
        notes: `Transición de fase: ${previousPhase} → ${args.newPhase} (lote origen: ${sourceInventoryItem.batch_number || 'N/A'})`,
        created_at: now,
        updated_at: now,
        created_by_activity_id: inventoryActivityId,
        transformation_status: "active",
      });

      // Mark source item as transformed
      await ctx.db.patch(sourceInventoryItem._id, {
        quantity_available: 0,
        last_movement_date: now,
        updated_at: now,
        transformation_status: "transformed",
        transformed_to_item_id: transformedInventoryItemId,
        transformed_by_activity_id: inventoryActivityId,
      });

      // Update activity with materials_produced
      await ctx.db.patch(inventoryActivityId, {
        materials_produced: [
          {
            product_id: args.targetProductId,
            inventory_item_id: transformedInventoryItemId,
            quantity: args.targetQuantity,
            quantity_unit: args.targetQuantityUnit,
          },
        ],
      });
    } else {
      // No inventory to transform, just log the phase transition activity
      inventoryActivityId = await ctx.db.insert("activities", {
        entity_type: "batch",
        entity_id: args.batchId,
        activity_type: "phase_transition",
        performed_by: args.performedBy,
        timestamp: now,
        quantity_before: batch.current_quantity,
        quantity_after: args.targetQuantity,
        materials_consumed: [],
        equipment_used: [],
        photos: [],
        files: [],
        activity_metadata: {
          previous_phase: previousPhase,
          new_phase: args.newPhase,
          loss_quantity: args.lossQuantity,
          loss_reason: args.lossReason,
        },
        notes: args.notes || `Transición de fase: ${previousPhase} → ${args.newPhase}`,
        created_at: now,
      });
    }

    return {
      success: true,
      batchId: args.batchId,
      activityId: inventoryActivityId,
      previousPhase,
      newPhase: args.newPhase,
      sourceInventoryItemId: sourceInventoryItem?._id,
      transformedInventoryItemId,
      quantityBeforeTransition: sourceInventoryItem?.quantity_available || batch.current_quantity,
      quantityAfterTransition: args.targetQuantity,
      lossQuantity: args.lossQuantity,
    };
  },
});

/**
 * Log a harvest for a batch with inventory transformation
 * This mutation:
 * 1. Updates the batch status to harvested
 * 2. Transforms plant inventory items to plant_material inventory
 * 3. Records yield and any waste
 */
export const logHarvest = mutation({
  args: {
    batchId: v.id("batches"),

    // Inventory transformation
    sourceInventoryItemId: v.optional(v.id("inventory_items")),
    targetProductId: v.id("products"), // Product with category "plant_material"

    // Harvest quantities
    plantsHarvested: v.number(), // Number of plants harvested
    plantsUnit: v.string(), // Usually "plants" or "unidades"
    yieldQuantity: v.number(), // Amount of material produced
    yieldUnit: v.string(), // kg, g, lbs, etc.

    // Waste/loss tracking
    wasteQuantity: v.optional(v.number()),
    wasteReason: v.optional(v.string()),

    // Location
    areaId: v.id("areas"),
    facilityId: v.id("facilities"),

    // Harvest details
    harvestDate: v.optional(v.number()),
    dryWeight: v.optional(v.number()),
    wetWeight: v.optional(v.number()),
    moistureContent: v.optional(v.number()), // Percentage

    // Context
    notes: v.optional(v.string()),
    performedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const harvestDate = args.harvestDate || now;

    // Get batch
    const batch = await ctx.db.get(args.batchId);
    if (!batch) {
      throw new Error("Batch no encontrado");
    }

    if (batch.status !== "active") {
      throw new Error("Solo batches activos pueden ser cosechados");
    }

    // Get target product (plant_material)
    const targetProduct = await ctx.db.get(args.targetProductId);
    if (!targetProduct) {
      throw new Error("Producto destino no encontrado");
    }

    // Get source inventory item
    let sourceInventoryItem = args.sourceInventoryItemId
      ? await ctx.db.get(args.sourceInventoryItemId)
      : null;

    // If no source inventory provided, try to find one linked to this batch
    if (!sourceInventoryItem) {
      const linkedInventory = await ctx.db
        .query("inventory_items")
        .filter((q) =>
          q.and(
            q.eq(q.field("source_batch_id"), args.batchId),
            q.eq(q.field("lot_status"), "available"),
            q.or(
              q.eq(q.field("transformation_status"), undefined),
              q.eq(q.field("transformation_status"), "active")
            )
          )
        )
        .first();

      sourceInventoryItem = linkedInventory;
    }

    // Get source product if we have source inventory
    let sourceProduct = null;
    if (sourceInventoryItem) {
      sourceProduct = await ctx.db.get(sourceInventoryItem.product_id);
    }

    // Update batch to harvested status
    await ctx.db.patch(args.batchId, {
      status: "harvested",
      current_phase: "harvested",
      harvest_date: harvestDate,
      current_quantity: 0, // All plants harvested
      notes: args.notes
        ? `${batch.notes || ""}\nHarvested: ${args.notes}`
        : batch.notes,
      updated_at: now,
    });

    // Update individual plants if tracking enabled
    if (batch.enable_individual_tracking) {
      const plants = await ctx.db
        .query("plants")
        .withIndex("by_batch", (q) => q.eq("batch_id", args.batchId))
        .collect();

      for (const plant of plants) {
        await ctx.db.patch(plant._id, {
          plant_stage: "harvested",
          status: "harvested",
          harvested_date: harvestDate,
          updated_at: now,
        });
      }
    }

    // Handle inventory transformation
    let harvestedInventoryItemId: Id<"inventory_items"> | undefined;
    let activityId: Id<"activities">;

    if (sourceInventoryItem) {
      const sourceQuantity = sourceInventoryItem.quantity_available;
      const quantityBefore = sourceQuantity;

      // Create harvest activity
      activityId = await ctx.db.insert("activities", {
        entity_type: "batch",
        entity_id: args.batchId,
        activity_type: "harvest",
        performed_by: args.performedBy,
        timestamp: harvestDate,
        quantity_before: quantityBefore,
        quantity_after: 0,
        materials_consumed: [
          {
            inventory_item_id: sourceInventoryItem._id,
            product_id: sourceInventoryItem.product_id,
            product_name: sourceProduct?.name || "Desconocido",
            quantity: args.plantsHarvested,
            quantity_unit: args.plantsUnit,
            quantity_before: quantityBefore,
            quantity_after: 0,
            batch_number: sourceInventoryItem.batch_number,
          },
        ],
        equipment_used: [],
        photos: [],
        files: [],
        activity_metadata: {
          transformation_type: "harvest",
          source_product_id: sourceInventoryItem.product_id,
          source_product_name: sourceProduct?.name,
          target_product_id: args.targetProductId,
          target_product_name: targetProduct.name,
          plants_harvested: args.plantsHarvested,
          plants_unit: args.plantsUnit,
          yield_quantity: args.yieldQuantity,
          yield_unit: args.yieldUnit,
          waste_quantity: args.wasteQuantity,
          waste_reason: args.wasteReason,
          dry_weight: args.dryWeight,
          wet_weight: args.wetWeight,
          moisture_content: args.moistureContent,
        },
        notes: args.notes || `Cosecha de ${args.plantsHarvested} plantas → ${args.yieldQuantity} ${args.yieldUnit}`,
        created_at: now,
      });

      // Generate internal batch number for harvested material based on TARGET category
      // Harvested materials are internal products - no supplier_id or supplier_lot_number
      const harvestedBatchNumber = await generateInternalLotNumber(ctx, targetProduct.category);

      // Create new inventory item for the harvested material
      // Note: supplier_id and supplier_lot_number are NOT copied - this is an internal product
      harvestedInventoryItemId = await ctx.db.insert("inventory_items", {
        product_id: args.targetProductId,
        area_id: args.areaId,
        // supplier_id: undefined - harvested materials have no external supplier
        // supplier_lot_number: undefined - no supplier lot for harvested materials
        quantity_available: args.yieldQuantity,
        quantity_reserved: 0,
        quantity_committed: 0,
        quantity_unit: args.yieldUnit,
        batch_number: harvestedBatchNumber, // New internal lot based on target category (plant_material)
        serial_numbers: [],
        received_date: harvestDate,
        manufacturing_date: harvestDate,
        purchase_price: sourceInventoryItem.purchase_price,
        cost_per_unit: sourceInventoryItem.cost_per_unit
          ? (sourceInventoryItem.cost_per_unit * args.plantsHarvested) / args.yieldQuantity
          : undefined, // Recalculate cost per unit based on yield
        certificates: [],
        source_type: "production",
        source_batch_id: args.batchId,
        lot_status: "available",
        last_movement_date: now,
        notes: `Cosecha de batch ${batch.batch_code || args.batchId}: ${args.yieldQuantity} ${args.yieldUnit} (lote origen: ${sourceInventoryItem.batch_number || 'N/A'})`,
        created_at: now,
        updated_at: now,
        created_by_activity_id: activityId,
        transformation_status: "active",
      });

      // Mark source item as harvested
      await ctx.db.patch(sourceInventoryItem._id, {
        quantity_available: 0,
        last_movement_date: now,
        updated_at: now,
        transformation_status: "harvested",
        transformed_to_item_id: harvestedInventoryItemId,
        transformed_by_activity_id: activityId,
      });

      // Update activity with materials_produced
      await ctx.db.patch(activityId, {
        materials_produced: [
          {
            product_id: args.targetProductId,
            inventory_item_id: harvestedInventoryItemId,
            quantity: args.yieldQuantity,
            quantity_unit: args.yieldUnit,
          },
        ],
      });
    } else {
      // No inventory to transform, just log the harvest activity
      activityId = await ctx.db.insert("activities", {
        entity_type: "batch",
        entity_id: args.batchId,
        activity_type: "harvest",
        performed_by: args.performedBy,
        timestamp: harvestDate,
        quantity_before: batch.current_quantity,
        quantity_after: 0,
        materials_consumed: [],
        equipment_used: [],
        photos: [],
        files: [],
        activity_metadata: {
          plants_harvested: args.plantsHarvested,
          plants_unit: args.plantsUnit,
          yield_quantity: args.yieldQuantity,
          yield_unit: args.yieldUnit,
          waste_quantity: args.wasteQuantity,
          waste_reason: args.wasteReason,
          dry_weight: args.dryWeight,
          wet_weight: args.wetWeight,
          moisture_content: args.moistureContent,
        },
        notes: args.notes || `Cosecha de ${args.plantsHarvested} plantas → ${args.yieldQuantity} ${args.yieldUnit}`,
        created_at: now,
      });

      // Create inventory item for yield without source transformation
      harvestedInventoryItemId = await ctx.db.insert("inventory_items", {
        product_id: args.targetProductId,
        area_id: args.areaId,
        quantity_available: args.yieldQuantity,
        quantity_reserved: 0,
        quantity_committed: 0,
        quantity_unit: args.yieldUnit,
        serial_numbers: [],
        received_date: harvestDate,
        manufacturing_date: harvestDate,
        certificates: [],
        source_type: "production",
        source_batch_id: args.batchId,
        lot_status: "available",
        last_movement_date: now,
        notes: `Cosecha de batch ${batch.batch_code || args.batchId}`,
        created_at: now,
        updated_at: now,
        created_by_activity_id: activityId,
        transformation_status: "active",
      });

      // Update activity with materials_produced
      await ctx.db.patch(activityId, {
        materials_produced: [
          {
            product_id: args.targetProductId,
            inventory_item_id: harvestedInventoryItemId,
            quantity: args.yieldQuantity,
            quantity_unit: args.yieldUnit,
          },
        ],
      });
    }

    return {
      success: true,
      batchId: args.batchId,
      activityId,
      sourceInventoryItemId: sourceInventoryItem?._id,
      harvestedInventoryItemId,
      plantsHarvested: args.plantsHarvested,
      yieldQuantity: args.yieldQuantity,
      yieldUnit: args.yieldUnit,
      wasteQuantity: args.wasteQuantity,
    };
  },
});

/**
 * Complete a scheduled activity
 */
export const completeScheduledActivity = mutation({
  args: {
    scheduledActivityId: v.id("scheduled_activities"),
    completedBy: v.id("users"),
    notes: v.optional(v.string()),
    duration_minutes: v.optional(v.number()),
    materials_consumed: v.optional(v.array(v.any())),
    quality_check_data: v.optional(v.object({})),
    photos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const scheduledActivity = await ctx.db.get(args.scheduledActivityId);
    if (!scheduledActivity) {
      throw new Error("Scheduled activity not found");
    }

    if (scheduledActivity.status === "completed") {
      throw new Error("Activity already completed");
    }

    // Update scheduled activity status
    await ctx.db.patch(args.scheduledActivityId, {
      status: "completed",
      actual_end_time: now,
      completed_by: args.completedBy,
      completion_notes: args.notes,
      updated_at: now,
    });

    // Create activity record
    const activityId = await ctx.db.insert("activities", {
      entity_type: scheduledActivity.entity_type,
      entity_id: scheduledActivity.entity_id,
      activity_type: scheduledActivity.activity_type,
      scheduled_activity_id: args.scheduledActivityId,
      performed_by: args.completedBy,
      timestamp: now,
      duration_minutes: args.duration_minutes,
      materials_consumed: args.materials_consumed || [],
      equipment_used: [],
      quality_check_data: args.quality_check_data,
      photos: args.photos || [],
      files: [],
      activity_metadata: {},
      notes: args.notes,
      created_at: now,
    });

    return {
      activityId,
      scheduledActivityId: args.scheduledActivityId,
    };
  },
});
