/**
 * Activity Queries and Mutations
 * Activity logging and tracking
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
 */
export const log = mutation({
  args: {
    entity_type: v.string(), // batch/plant/area
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

    materials_consumed: v.optional(v.array(v.any())),
    equipment_used: v.optional(v.array(v.any())),
    quality_check_data: v.optional(v.object({})),
    environmental_data: v.optional(v.object({})),

    photos: v.optional(v.array(v.string())),
    files: v.optional(v.array(v.string())),

    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

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

      materials_consumed: args.materials_consumed || [],
      equipment_used: args.equipment_used || [],
      quality_check_data: args.quality_check_data,
      environmental_data: args.environmental_data,

      photos: args.photos || [],
      files: args.files || [],
      media_metadata: undefined,

      ai_assistance_data: undefined,
      activity_metadata: {},

      notes: args.notes,
      created_at: now,
    });

    return activityId;
  },
});
