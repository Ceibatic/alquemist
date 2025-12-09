/**
 * Activity Queries and Mutations
 * Activity logging and tracking with inventory consumption support
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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
