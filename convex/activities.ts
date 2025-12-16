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
